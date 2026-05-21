from models import (
    UserGroups,
    TransactionGroups
)

from repositories import (
    BaseRepo
)
from psycopg2.extensions import (
    connection
)
from psycopg2.extras import (
    RealDictCursor
)
from db import (
    transaction
)
from datetime import (
    datetime
)
from typing import (
    Any
)
import logging

logger = logging.getLogger(__name__)

class UserGroupRepo(BaseRepo):
    def _get_table(self):
        return UserGroups.table
    
    def _get_columns(self):
        return UserGroups.columns
    
    def _get_required_fields(self):
        return UserGroups.required_fields
    
    def _get_optional_fields(self):
        return UserGroups.optional_fields

    @classmethod
    def validate_parent_group(cls, conn: connection, parent_id: str):
        pass
    
    def update_user_group(self, conn: connection, accountID: str, name: str, id: str):
        time = datetime.now()
        query, params = self.sql_update({"name": name, "modified": time, "modified_by": accountID}, key_column="id", key_column_value=id)
        logger.debug(f"update query: {query.as_string(conn)}")
        logger.debug(f"update params: {params}")

        with conn.cursor() as curr:
            curr.execute(query, params)
        return curr.rowcount 

    def delete_user_group(self, conn: connection, accountID: str, id: str):
        query, params = self.sql_delete(where_conditions={"id": id, "accountID": accountID})

        logger.debug(f"query: {query.as_string(conn)}")
        logger.debug(f"params: {params}")

        with transaction(conn) as trans:
            with trans.cursor() as curr:
                curr.execute(query, params)
            return curr.rowcount
    
    def get_user_group(self, conn: connection, accountID: str, id: str):

        logger.debug(f"generating query")
        query, params = self.sql_select(where_conditions={"id": id, "accountID": accountID})
        logger.debug(f"query: {query.as_string(conn)}")
        logger.debug(f"params: {params}")

        with conn.cursor(cursor_factory=RealDictCursor) as curr:
            curr.execute(query, params)
            result = dict(curr.fetchone())
        
        logger.debug(f"Fetched data: {result}")

        return result


    def get_all_user_groups(self, conn: connection, accountID: str, limit: int, offset: int, name: str = None):


        like_conditions = {'name': name} if name else None
        query, params = self.sql_select(where_conditions={"accountID": accountID}, limit=limit, offset=offset, like_condition=like_conditions)

        logger.debug(f"query: {query.as_string(conn)}")
        logger.debug(f"params: {params}")

        with conn.cursor(cursor_factory=RealDictCursor) as curr:
            curr.execute(query, params)
            result = curr.fetchall()
        
        logger.debug(f"Fetched data: {result}")

        return result
