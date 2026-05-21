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

from dataclasses import (
    dataclass
)
from typing import (
    ClassVar
)

@dataclass
class UserGroups(Document):

    table: ClassVar[str] = 'userGroupings'
    required_fields: ClassVar[set[str]] = {
        'accountID', 
        'name', 
        'modified_by'}
    optional_fields: ClassVar[set[str]] = {
        }
    columns: ClassVar[set[str]] = {
        "id",
        "accountID",
        "name",
        "created",
        "modified",
        "modified_by",
    }

    id: str
    accountID: str
    name: str
    created: datetime | None
    modified: datetime | None
    modified_by: str 
    

