from .document import (
    Document
)
from models import (
    user_groups
)
from datetime import (
    datetime
)
from psycopg2 import (
    sql
)
from psycopg2.extensions import (
    connection
)
from errors import (
    InvalidUserGrouping
)
class TransactionGroups(Document):
    table: str = 'transactionGroups'
    required_fields: set[str] = {'id','transaction_id', 'group_id','modified_by', 'modified'}
    optional_fields: set[str] = {} 

    def __init__(self, 
                 id: str = None, 
                 transaction_id: str = "", 
                 group_id: str = "",
                 modified_by: str = "",
                 created: datetime = None,
                 modified: datetime = None,
                 ):
        self.id = id
        self.transaction_id = transaction_id
        self.group_id = group_id
        self.created = created
        self.modified = modified
        self.modified_by = modified_by

    def validate_user_grouping(self, conn: connection):
        query = sql.SQL("SELECT EXISTS (SELECT 1 FROM {table} WHERE id = %s AND accountID = %s)").format(
            table=sql.Identifier(user_groups.table)
        )

        with conn.cursor() as cur:
            cur.execute(query, (self.group_id, self.modified_by))
            valid = cur.fetchone()[0]
        
        if not valid:
            raise InvalidUserGrouping()

    def to_dict(self):
        return {
            "transactionID": self.transaction_id,
            "groupID": self.group_id,
            "created": self.created,
            "modified": self.modified,
            "modified_by": self.modified_by,
        }
