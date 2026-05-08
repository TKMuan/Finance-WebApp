from psycopg2.extensions import (
    connection
)
from psycopg2 import (
    sql
)
from psycopg2.extras import (
    RealDictCursor
)
from models import (
    UserMethods
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

class MethodsRepo(BaseRepo):
    def _get_table(self):
        return UserMethods.table
    
    def _get_columns(self):
        return UserMethods.columns
    
    def _get_required_fields(self):
        return UserMethods.required_fields
    
    def _get_optional_fields(self):
        return UserMethods.optional_fields

    def get_user_methods(
            self,
            conn: connection,
            id: str,
            limit: int = None,
            offset: int = None) -> list[dict[str, Any],]:

        columns = ['id', 'name']

        query, params = self.sql_select(
            columns, key_column='user_id',  
            key_column_value=id, 
            limit=limit,
            offset=offset
            )

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            result = cur.fetchall()

        return [dict(row) for row in result] 

