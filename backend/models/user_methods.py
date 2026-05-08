from .base import BaseModel
from datetime import datetime
from dataclasses import dataclass
from typing import (
    Optional,
    ClassVar
)

@dataclass
class UserMethods(BaseModel):
    table: ClassVar[str] = 'userMethods'
    required_fields: ClassVar[set[str]] = {
        'id'
        'accountID', 
        'name', 
        'modified_by',
        'modified',
        'created'
        }
    optional_fields: ClassVar[set[str]] = {} 
    columns: ClassVar[tuple[str]] = (
        'id',
        'accountID',
        'name',
        'modified_by',
        'modified',
        'created'
    )

    id: str
    accountID: str
    name: str
    modified_by: str
    created: datetime
    modified: datetime
