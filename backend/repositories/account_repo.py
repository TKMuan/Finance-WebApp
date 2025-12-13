from psycopg2.extensions import (
    connection
)
from psycopg2.extras import (
    RealDictCursor
)
from models import (
    Account
)
from errors import (
    InvalidCredentials
)
from typing import (
    Any
)
from repositories import (
    BaseRepo
)

class AccountRepo(BaseRepo):
    def _get_table(self):
        return Account.table
    
    def _get_columns(self):
        return Account.columns
    
    def _get_required_fields(self):
        return Account.required_fields
    
    def _get_optional_fields(self):
        return Account.optional_fields

    def get_login_credentials(self, 
                      conn: connection, 
                      email: str, 
                      ) -> dict[str, str]:

        columns = ["id", 'password']
        query, params = self.sql_select(
            columns, key_column='email', 
            key_column_value=email, 
            )
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            result = cur.fetchone()

        if not result:
            raise InvalidCredentials("Invalid Credentials")
        
        return dict(result)
    
    def get_user_details(
            self,
            conn: connection,
            id: str,
            columns: list[str]
            ) -> dict[str, Any]:

        if not columns:
            columns = ['fname', 'mname', 'lname', 'email']
        
        query, params = self.sql_select(
            columns,
            key_column='id',
            key_column_value=id
        )

        with conn.cursor() as curr:
            curr.execute(query, params)
            result = curr.fetchone()
        print("result: ", result) 
        return result

