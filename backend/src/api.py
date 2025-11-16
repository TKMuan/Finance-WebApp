from psycopg2.extensions import connection
from psycopg2 import sql
from src.models import Account, generate_sha256_hash

def check_extra_fields(data: dict, allowed_fields: set) -> bool:
    return bool(set(data.keys()) - allowed_fields)

def check_required_fields(data: dict, required_fields: set) -> bool:
    return (required_fields - set(data.keys()))

class APIResponse:
    def __init__(self, success: bool, code: str, data: dict = None, message: str = None):
        self.success = success
        self.code = code
        self.data = data
        self.message = message

    def to_dict(self):
        response = {"status": "success" if self.success else "error", "code": self.code}
        if self.success:
            response["data"] = self.data
            if self.message:
                response["message"] = self.message
        else:
            response["error"] = {"message": self.message}
        return response

    @classmethod
    def success(cls, data: dict = None, message: str = None):
        return cls(True, code="200", data=data, message=message).to_dict()

    @classmethod
    def error(cls, code: str, message: str):
        return cls(False, code=code, message=message).to_dict()



class AccountAPI:
    @staticmethod
    def get_account_details(conn: connection, account_id: str, fields: list[str]) -> dict:

        try:
            query = sql.SQL("SELECT * FROM {table} WHERE id = %s").format(
                table=sql.Identifier(Account.table)
            )
            with conn.cursor() as cur:
                cur.execute(query, (account_id,))
                result = cur.fetchone()
                if not result:
                    return APIResponse.error("404", "Account not found.")

                columns = [desc[0] for desc in cur.description]
                account_data = dict(zip(columns, result))
                return APIResponse.success(data=account_data)

        except Exception as e:
            return APIResponse.error("500", str(e))

    @staticmethod
    def create_account(conn: connection, data: dict) -> dict:
        try:
            fields_check = check_required_fields(data, Account.required_fields)
            if check_extra_fields(data, Account.required_fields.union(Account.optional_fields)):
                return APIResponse.error("400", "Extra fields provided that are not allowed.")

            print("missing fields:", fields_check)
            if fields_check:
                return APIResponse.error("400", f"Missing required fields: {fields_check}")

            password = generate_sha256_hash(data['password'])
            data["password"] = password

            account: Account = Account.from_dict({k:v for k,v in data.items() if k in Account.required_fields.union(Account.optional_fields)})
            account.insert(conn, data['modifying_user'])

            account.save(conn)

            return APIResponse.success(message="Account created successfully.", data={"account_id": account.id})

        except Exception as e:
            conn.rollback()
            return APIResponse.error("500", str(e))

    @staticmethod
    def update_account(conn: connection, updated: dict, id: str) -> dict:
        pass

    @staticmethod
    def delete_account(conn: connection, id: str) -> dict:
        pass