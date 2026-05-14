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
    InvalidCredentials,
    UnauthorizedAccess
)
from typing import (
    Any
)
from repositories import (
    BaseRepo
)
from datetime import (
    datetime
)
from db import (
    transaction
)
import logging

logger = logging.getLogger(__name__)

class MethodsRepo(BaseRepo):
    def _get_table(self):
        return UserMethods.table
    
    def _get_columns(self):
        return UserMethods.columns
    
    def _get_required_fields(self):
        return UserMethods.required_fields
    
    def _get_optional_fields(self):
        return UserMethods.optional_fields

    def validate_owner(self, conn: connection, accountID: str, id: str):
            query, params = self.sql_select(['id'], where_conditions={"accountID": accountID, "id": id})

            logger.debug(f"query: {query.as_string(conn)}")
            logger.debug(f"params: {params}")
            with conn.cursor() as curr:
                curr.execute(query, params)
                isOwner = curr.fetchall()

            if not isOwner:
                raise UnauthorizedAccess("User does not have access to current data")

    def get_user_methods(
            self,
            conn: connection,
            id: str,
            limit: int = None,
            offset: int = None) -> list[dict[str, Any],]:

        columns = ['id', 'name']

        query, params = self.sql_select(
            columns, key_column='accountID',  
            key_column_value=id, 
            limit=limit,
            offset=offset
            )

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            result = cur.fetchall()

        return [dict(row) for row in result] 
    
    def update_user_method(self, conn: connection, name: str, accountID: str, id: str):
        time = datetime.now()
        query = self.sql_update({"name": name, "modified": time, "modified_by": accountID}, "id")
        params = [name, time, accountID, id]
        logger.debug(f"update query: {query.as_string(conn)}")
        logger.debug(f"update params: {params}")

        with transaction(conn) as trans:
            with trans.cursor() as curr:
                curr.execute(query, params)
            return curr.rowcount 
    
    def delete_user_method(self, conn: connection, accountID: str, id: str):
        query, params = self.sql_delete({"id": id, "accountID": accountID})

        logger.debug(f"query: {query.as_string(conn)}")
        logger.debug(f"params: {params}")

        with transaction(conn) as trans:
            with trans.cursor() as curr:
                curr.execute(query, params)
            return curr.rowcount
    
    


