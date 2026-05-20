from .document import Document
from dataclasses import (
    dataclass
)
from typing import (
    ClassVar,
    Optional
)
from datetime import (
    datetime
)

@dataclass
class Transactions(Document):    
    table: ClassVar[str] = 'transactions'
    required_fields: ClassVar[set[str]] = {
        'id', 
        'accountID', 
        'amount', 
        'transaction_time',
        'type', 
        'method',
        'modified_by',
        'modified'
        }
    optional_fields: ClassVar[set[str]] = {
        'description', 
        'groups'
        }
    columns: ClassVar[set[str]] = {
        'id', 
        'accountID', 
        'amount', 
        'transaction_time',
        'type', 
        'modified_by',
        'method',
        'modified',
        'created',
        'description', 
    }

    id: str 
    accountID: str
    amount: int
    description: str
    transaction_time: datetime
    type: bool
    method: str
    modified_by: str
    modified: datetime
    created: datetime