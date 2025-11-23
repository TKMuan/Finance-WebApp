import hmac
import flask_jwt_extended
import jwt
from psycopg2.extensions import connection
from psycopg2 import sql
from src.errors import UnauthorizedAccess, MissingFieldError, MissingModifyingUser
from src.errors import ErrorCodes, SuccessCodes, ErrorTypes, SuccessTypes
from src.models import Account, Document, generate_sha256_hash
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token
from enum import Enum
from typing import Union, Type

class APIResponse:
    def __init__(self, success: bool, code: Union[ErrorTypes, SuccessTypes], data: dict = None, message: str = None):
        self.status = success
        self.code = code
        self.data = data
        self.message = message

    def to_dict(self):
        response = {"status": self.status, "code": self.code}
        if self.status:
            response["data"] = self.data
            if self.message:
                response["message"] = self.message
        else:
            response["message"] = self.message
        return response

    @classmethod
    def success(cls, code: SuccessTypes = None, data: dict = None, message: str = None) -> dict:
        if not code:
            code = SuccessCodes.BASE.SUCCESS
        return cls(True, code=code, data=data, message=message).to_dict()

    @classmethod
    def error(cls, code: ErrorTypes = None, message: str = None) -> dict:
        if not code:
            code = ErrorCodes.BASE.ERROR
        return cls(False, code=code, message=message).to_dict()


class JWTAuthAPI:
    @staticmethod
    def generate_token(user_id: str, user_email: str, fname: str) -> dict:
        additional_claims = {
            "email": user_email,
            "fname": fname
        }
        try:
            access_token = create_access_token(identity=user_id, additional_claims=additional_claims)
            refresh_token = create_refresh_token(identity=user_id)

            return APIResponse.success(data={'access_token': access_token, 'refresh_token': refresh_token}, message="Tokens generated successfully.")
        except Exception as e:
            return APIResponse.error(message=str(e))

    @staticmethod
    def _generate_refresh(id, additional_claims: dict = None) -> dict:
        try:
            refreshed_token = create_access_token(identity=id, additional_claims=additional_claims, fresh=False)
            return APIResponse.success(
                data={'access_token': refreshed_token}, 
                message="Access token refreshed successfully.", 
                code=SuccessCodes.JWT.REFRESH_SUCCESS
                )
        except Exception as e:
            return APIResponse.error(str(e))
    
    @staticmethod
    def validate_token(token:str):
        if not token:
            return APIResponse.error(code=ErrorCodes.JWT.INVALID_TOKEN, message="Invalid Token")
        try:
            decoded = decode_token(token, allow_expired=False)
            return APIResponse.success(data=decoded, message="Token validated successfully.", code=SuccessCodes.JWT.VALID_TOKEN)

        except jwt.ExpiredSignatureError:
            return APIResponse.error(code=ErrorCodes.JWT.EXPIRED_TOKEN, message="Token has Expired")

        except Exception as e:
            return APIResponse.error(message=f"{type(e).__name__} - {str(e)}")
    
    @staticmethod
    def check_active_login(conn: connection, access_token: str, refresh_token: str):
        try: 
            code = SuccessCodes.JWT.ACCESS_ACTIVE
            result = JWTAuthAPI.validate_token(access_token)
            if not result.get('status'):
                refresh_result = JWTAuthAPI.validate_token(refresh_token)
                if not refresh_result.get('status'):
                    if refresh_result.get('code') == ErrorCodes.JWT.INVALID_TOKEN:
                        refresh_result['message'] = "Re-authenticate user"
                    return refresh_result  
                code = SuccessCodes.JWT.ACCESS_REFRESHED
                decoded = refresh_result.get('data')
            else:
                decoded = result.get("data")

            user_id = decoded.get("sub", "")

            Document.validate_modifying_user(conn, user_id)

            query = sql.SQL("SELECT id, email, fname from {table} WHERE id = %s").format(
                    table=sql.Identifier(Account.table)
                    )

            with conn.cursor() as cur:
                cur.execute(query, (user_id,))
                result = cur.fetchone() 
                if not result:
                    return APIResponse.error(ErrorCodes.DOCUMENT.RECORD_NOT_FOUND, ErrorCodes.DOCUMENT.RECORD_NOT_FOUND.name)

                columns = [desc[0] for desc in cur.description]
                account_data = dict(zip(columns, result))
                user_email = account_data.get("email", "")
                fname = account_data.get("fname", "")
            
            additional_claims = {
                "email": user_email,
                "fname": fname
            }

            response = JWTAuthAPI._generate_refresh(user_id, additional_claims)
            if not response.get('status', ''):
                return response

            data = response.get('data', {})
            data['email'] = user_email
            data['fname'] = fname
            data['id'] = user_id 
            return APIResponse.success(code=code, data=data, message="Returned Active User")

        except MissingModifyingUser as e:
            return APIResponse.error(code=e.code, message=str(e))

        except Exception as e:
            return APIResponse.error("500", str(e))


class AccountAPI:

    @staticmethod
    def safe_compare_hashes(hash1: str, hash2: str) -> bool:
        # Convert hex strings to bytes if necessary
        hash1_bytes = bytes.fromhex(hash1) if isinstance(hash1, str) else hash1
        hash2_bytes = bytes.fromhex(hash2) if isinstance(hash2, str) else hash2
        return hmac.compare_digest(hash1_bytes, hash2_bytes)

    @staticmethod
    def refresh_access_token(conn: connection, refresh_token: str):
        try:
            decoded = decode_token(refresh_token, allow_expired=False)
            user_id = decoded.get("sub", "")
            Document.validate_modifying_user(conn, user_id)

            query = sql.SQL("SELECT email, fname FROM {table} WHERE id = %s").format(
                table=sql.Identifier(Account.table)
            )
            with conn.cursor() as cur:
                cur.execute(query, (user_id,))
                result = cur.fetchone()
                if not result:
                    return APIResponse.error("404", "Account not found.")

                columns = [desc[0] for desc in cur.description]
                account_data = dict(zip(columns, result))
                user_email = account_data.get("email", "")
                fname = account_data.get("fname", "")

            additional_claims = {
                "email": user_email,
                "fname": fname
            }

            # might want to change to generate both access and refresh tokens later 
            response = JWTAuthAPI._generate_refresh(user_id, additional_claims)
            if not response.get('status', ''):
                return response

            data = response.get('data', {})
            data['email'] = user_email
            data['fname'] = fname
            data['id'] = user_id
            return APIResponse.success(data=data, message="Access token refreshed successfully.")

        except Exception as e:
            return APIResponse.error("401", str(e))
    
    @staticmethod
    def validate_login(conn: connection, email: str, password: str) -> dict:
        try:
            query = sql.SQL("SELECT id, fname, email, password FROM {table} WHERE email = %s").format(
                table=sql.Identifier(Account.table)
            )
            with conn.cursor() as cur:
                cur.execute(query, (email,))
                result = cur.fetchone()
                if not result:
                    return APIResponse.error(ErrorCodes.ACCOUNT.INVALID_CREDENTIALS, "Invalid email or password.")

                columns = [desc[0] for desc in cur.description]
                account_data = dict(zip(columns, result))
                stored_password = account_data.pop("password")
                hashed_password = generate_sha256_hash(password)

                if not AccountAPI.safe_compare_hashes(stored_password, hashed_password):
                    return APIResponse.error(code=ErrorCodes.ACCOUNT.INVALID_CREDENTIALS, message="Invalid email or password.")

                jwt_tokens = JWTAuthAPI.generate_token(
                    user_id=account_data.get("id"),
                    user_email=account_data.get("email"),
                    fname=account_data.get("fname")
                )
                if jwt_tokens.get("status") is False:
                    return APIResponse.error(jwt_tokens.get("code"), jwt_tokens.get("error"))
                data = jwt_tokens.get("data", {})
                data['email'] = account_data.get("email")
                data['fname'] = account_data.get("fname")
                data['id'] = account_data.get("id")
                return APIResponse.success(data=data, message="Login successful.")


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
        #to be implemented 
        pass

    @staticmethod
    def delete_account(conn: connection, id: str) -> dict:
        #to be implemented 
        pass

class TransactionAPI:
    @staticmethod
    def create_transaction(conn: connection, user_id: str, ) -> dict:
        pass

    @staticmethod
    def update_transaction(conn: connection, updated: dict, id: str) -> dict:
        #to be implemented 
        pass

    @staticmethod
    def delete_transaction(conn: connection, id: str) -> dict:
        #to be implemented 
        pass