from .document import Document

from datetime import (
    datetime
)

from psycopg2.extensions import (
    connection
)

from errors import (
    MissingFieldError
)

class UserGroups(Document):
    table: str = 'userGroupings'
    required_fields: set[str] = {'accountID', 'name', 'modified_by'}
    optional_fields: set[str] = {'parent'}
    def __init__(self, 
                 id: str = None, 
                 account_id: str = "", 
                 name: str = "", 
                 parent: str = None,
                 created: datetime = None,
                 modified: datetime = None,
                 modified_by: str = "",
                 ):
        self.id: str = id
        self.accountID: str = account_id
        self.name: str = name
        self.parent: str | None = parent
        self.created: datetime | None = created
        self.modified: datetime | None = modified
        self.modified_by: str = modified_by
    
    def to_dict(self):
        return {
            "id": self.id,
            "accountID": self.accountID,
            "name": self.name,
            "parent": self.parent,
            "created": self.created,
            "modified": self.modified,
            "modified_by": self.modified_by,
        }
    
    @classmethod
    def validate_parent_group(cls, conn: connection, parent_id: str):
        if parent_id and not Document.primary_key_exists(conn, cls.table, 'id', parent_id):
            raise MissingFieldError(f"Parent group with id {parent_id} does not exist.", fields={'parent'})

