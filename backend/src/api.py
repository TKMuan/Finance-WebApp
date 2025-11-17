import hmac
import flask_jwt_extended
from psycopg2.extensions import connection
from psycopg2 import sql
from src.errors import UnauthorizedAccess, MissingFieldError
from src.models import Account, generate_sha256_hash
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token
from enum import Enum
import bcrypt

class APIResponse:
    def __init__(self, success: bool, code: str, data: dict = None, message: str = None):
        self.status = success
        self.code = code
        self.data = data
        self.message = message

    def to_dict(self):
        response = {"status": "success" if self.status else "error", "code": self.code}
        if self.status:
            response["data"] = self.data
            if self.message:
                response["message"] = self.message
        else:
            response["error"] = {"message": self.message}
        return response

    @classmethod
    def success(cls, data: dict = None, message: str = None, code: str = "200"):
        return cls(True, code=code, data=data, message=message).to_dict()

    @classmethod
    def error(cls, code: str, message: str):
        return cls(False, code=code, message=message).to_dict()


class JWTAuthAPI:

    class ErrorCode(Enum):
        REQUIRE_REFRESH = "401"
        REQUIRE_RE_AUTH = "402"        

    @staticmethod
    def generate_token(user_id: str, user_email: str, fname: str) -> str:
        additional_claims = {
            "email": user_email,
            "fname": fname
        }
        try:
            access_token = create_access_token(identity=user_id, additional_claims=additional_claims)
            refresh_token = create_refresh_token(identity=user_id)

            return APIResponse.success(data={'access_token': access_token, 'refresh_token': refresh_token}, message="Tokens generated successfully.")
        except Exception as e:
            return APIResponse.error("500", str(e))

    @staticmethod
    def _generate_refresh(id, additional_claims: dict = None) -> str:
        try:
            refreshed_token = create_access_token(identity=id, additional_claims=additional_claims, fresh=False)
            return APIResponse.success(data={'access_token': refreshed_token}, message="Access token refreshed successfully.")
        except Exception as e:
            return APIResponse.error("500", str(e))
    
    @staticmethod
    def validate_token(token:str, refresh: bool=False):
        try:
            decode_token(token, allow_expired=False, refresh=refresh)
            return APIResponse.success(message="Token validated successfully.")

        except Exception as e:
            return APIResponse.error("401", str(e))
    
    @staticmethod
    def check_active_login(access_token:str, refresh_token: str):
        if not access_token:
            return APIResponse.error(JWTAuthAPI.ErrorCode.REQUIRE_RE_AUTH, "")
        try: 
            decode_token(access_token, allow_expired=False, refresh=False)
            return APIResponse.success(message="Active login validated successfully.")
        except flask_jwt_extended.ExpiredSignatureError:
            decode_token(refresh_token, allow_expired=False)
            return APIResponse.error(JWTAuthAPI.ErrorCode.REQUIRE_REFRESH, message="Access token expired, refresh required: " + str(e))
        except Exception as e:
            return APIResponse.error(JWTAuthAPI.ErrorCode.REQUIRE_RE_AUTH, message="Re-authentication required: " + str(e))


class AccountAPI:

    @staticmethod
    def safe_compare_hashes(hash1: str, hash2: str) -> bool:
        # Convert hex strings to bytes if necessary
        hash1_bytes = bytes.fromhex(hash1) if isinstance(hash1, str) else hash1
        hash2_bytes = bytes.fromhex(hash2) if isinstance(hash2, str) else hash2
        return hmac.compare_digest(hash1_bytes, hash2_bytes)

    @staticmethod
    def validate_login(conn: connection, email: str, password: str) -> dict:
        try:
            hashed_password = generate_sha256_hash(password)
            query = sql.SQL("SELECT id, fname, email, password FROM {table} WHERE email = %s").format(
                table=sql.Identifier(Account.table)
            )
            with conn.cursor() as cur:
                cur.execute(query, (email,))
                result = cur.fetchone()
                if not result:
                    return APIResponse.error("401", "Invalid email or password.")

                columns = [desc[0] for desc in cur.description]
                account_data = dict(zip(columns, result))
                stored_password = account_data.pop("password")

                if not AccountAPI.safe_compare_hashes(stored_password, hashed_password):
                    return APIResponse.error("401", "Invalid email or password.")

                jwt_tokens = JWTAuthAPI.generate_token(
                    user_id=account_data.get("id"),
                    user_email=account_data.get("email"),
                    fname=account_data.get("fname")
                )

                return APIResponse.success(data=jwt_tokens, message="Login successful.")


        except Exception as e:
            return APIResponse.error("500", str(e))

    @staticmethod
    def get_account_details(conn: connection, account_id: str, fields: set[str], requesting_user: str) -> dict:

        try:
            Account.validate_authorization(conn, requesting_user)

            allowed_fields = {'email', 'fname', 'mname', 'lname', 'created', 'modified'}

            if not fields:
                fields = allowed_fields

            if Account.check_extra_fields(data=fields, allowed_fields=allowed_fields):
                return APIResponse.error("400", f"Extra fields {fields - allowed_fields} provided that are not allowed.")

            query_fields = sql.SQL(', ').join([sql.Identifier(field) for field in fields if field in allowed_fields])
            query = sql.SQL("SELECT {fields} FROM {table} WHERE id = %s").format(
                table=sql.Identifier(Account.table),
                fields=sql.SQL(", ").join(sql.Identifier(field) for field in query_fields if field in allowed_fields)
            )
            with conn.cursor() as cur:
                cur.execute(query, (account_id,))
                result = cur.fetchone()
                if not result:
                    return APIResponse.error("404", "Account not found.")

                columns = [desc[0] for desc in cur.description]
                account_data = dict(zip(columns, result))
                return APIResponse.success(data=account_data)

        except UnauthorizedAccess as ua:
            return APIResponse.error("403", str(ua))

        except MissingFieldError as mfe:
            return APIResponse.error("400", str(mfe))

        except Exception as e:
            return APIResponse.error("500", str(e))

    @staticmethod
    def create_account(conn: connection, data: dict) -> dict:
        try:
            fields_check = Account.check_required_fields(data, Account.required_fields)
            if Account.check_extra_fields(data, Account.required_fields.union(Account.optional_fields)):
                return APIResponse.error("400", "Extra fields provided that are not allowed.")

            if fields_check:
                return APIResponse.error("400", f"Missing required fields: {fields_check}")

            password = generate_sha256_hash(data['password'])
            data["password"] = password

            account: Account = Account.from_dict({k:v for k,v in data.items() if k in Account.required_fields.union(Account.optional_fields)})
            account.insert(conn, data['modifying_user'])

            account.save(conn)

            return APIResponse.success(message="Account created successfully.", data={"account_id": account.id})

        except MissingFieldError as mfe:
            return APIResponse.error("400", str(mfe))

        except Exception as e:
            conn.rollback()
            return APIResponse.error("500", str(e))

    @staticmethod
    def update_account(conn: connection, updated: dict, id: str) -> dict:
        pass

    @staticmethod
    def delete_account(conn: connection, id: str) -> dict:
        pass