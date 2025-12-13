from psycopg2.extensions import (
    connection,
)
from psycopg2.extras import (
    RealDictCursor
)
from psycopg2 import (
    sql,
)
from errors.auth_errors import (
    InvalidToken,
    MissingToken,
    ExpiredToken,
    AuthError,
    AuthForbiddenError,
    InvalidCredentials
)
from errors import (
    ValidationError,
    MissingFieldError,
    ExtraFieldError,
    MissingDocumentID,
)
from errors import (
    UnauthorizedAccess
)
from models import (
    BaseModel,
    Account
)
from repositories import (
    BaseRepo,
    AccountRepo 
)
from typing import (
    Type
)
from utils import (
    CryptoUtil,
    AuthUtil
)
from datetime import (
    datetime,
    timezone
)
from db import (
    transaction
)
import jwt

class AccountService:
    def __init__(self, repo: AccountRepo):
        self.repo: AccountRepo = repo
    
    def login(self, conn: connection, email: str, password: str):
        credentials = self.repo.get_login_credentials(conn=conn, email=email)
        hashed_password = CryptoUtil.generate_sha256_hash(password)

        if not CryptoUtil.safe_compare_hashes(hashed_password, credentials.get('password')):
            raise InvalidCredentials("Invalid Credentials")
        
        data_columns = ["fname"]
        account_data = self.repo.get_user_details(conn, credentials.get('id'), data_columns)[0]
        print('account_data: ', account_data)

        jwt_tokens = AuthUtil.generate_token(
            user_id=credentials.get('id'),
            user_email=email,
            fname=account_data
        )

        data = {
            'tokens': jwt_tokens,
            'user':{
                'email': email,
                'id': credentials.get('id'),
                'fname': account_data
            }

        }
        return data

    def check_active_login(self, conn: connection, access_token: str, refresh_token: str) -> dict:
        try: 
            decoded = AuthUtil.validate_token(access_token)
            user_id = decoded.get('sub', "")
            fname = decoded.get("fname")
            user_email = decoded.get("email")
            return {'token': access_token, "id": user_id, "name": fname, "email": user_email, 'refreshed': False}

        except (MissingToken, ExpiredToken): 
            pass

        try:
            decoded = AuthUtil.validate_token(refresh_token)
            user_id = decoded.get('sub', "")

            self.repo.record_exists(conn, user_id)

            columns = ["email", "fname"] 
            query, params = self.repo.sql_select(columns, key_column='id', key_column_value=user_id)
            with conn.cursor() as cur:
                cur.execute(query, params)
                result = cur.fetchone() 
                print(result)

                columns = [desc[0] for desc in cur.description]
                account_data = dict(zip(columns, result))
                user_email = account_data.get("email", "")
                fname = account_data.get("fname", "")

            additional_claims = {
                "email": user_email,
                "fname": fname
            }
            new_access_token =  AuthUtil.generate_refresh(user_id, additional_claims)
            return {'token': new_access_token, "id": user_id, "name": fname, "email": user_email, "refreshed": True}
        
        except (MissingToken, ExpiredToken):
            raise InvalidToken("Both access tokens and refresh tokens are invalid")

        except AuthError as e:
            raise AuthForbiddenError(str(e))

    def create_account(self, conn: connection, data: dict) -> dict:
        print("creating account")
        Account.check_required_fields(data, Account.required_fields - {"id", "modified_by"})
        Account.check_extra_fields(data, Account.required_fields.union(Account.optional_fields))

        password = CryptoUtil.generate_sha256_hash(data['password'])
        data["password"] = password
        data['created']= datetime.now(timezone.utc)
        data['modified']= data['created']
        data['id'] = CryptoUtil.generate_sha256_hash(data['email']+data['created'].strftime("%Y-%m-%d %H:%M:%S"))
        data["modified_by"] = data['id']
        print("data: ", data)

        account: Account = Account(**data)
        for col in self.repo._get_columns():
            print(f"{col}: {getattr(account, col)}")
        with transaction(conn):
           self.repo.insert(conn, account)
        return {"account_id": account.id}


    def update_account(self, conn: connection, updated: dict, id: str) -> dict:
        #to be implemented 
        pass

    def delete_account(self, conn: connection, id: str) -> dict:
        #to be implemented 
        pass


    def get_account_details(self, conn: connection, account_id: str, token: str, fields: set[str]=None) -> dict:

        AuthUtil.validate_authorization(account_id, token)

        if not fields:
            fields = Account.allowed_fields()

        Account.check_extra_fields(data=fields)

        self.repo.record_exists(conn, account_id)

        query, params = self.repo.sql_select(fields, key_column='id', key_column_value=account_id)

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            result = cur.fetchone()
            columns = [desc[0] for desc in cur.description]
            account_data = dict(zip(columns, result))
            return account_data



"""
to be checked later
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
"""
