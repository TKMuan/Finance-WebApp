from .document import (
    Document
)
from datetime import (
    datetime
)
from typing import (
    ClassVar
)
from dataclasses import (
    dataclass
)

@dataclass
class TransactionGroups(Document):
    table: ClassVar[str] = 'transactionGroups'
    required_fields: ClassVar[set[str]] = {
        'transactionID', 
        'groupID',
        }
       
    optional_fields: ClassVar[set[str]] = {
        'modified_by', 
        'modified',
        'created'
    } 
    columns: ClassVar[set[str]] = {
        'transactionID', 
        'groupID',
        'modified_by', 
        'modified',
        'created'
    }

    transactionID: str
    groupID: str
    created: datetime
    modified: datetime
    modified_by: str
