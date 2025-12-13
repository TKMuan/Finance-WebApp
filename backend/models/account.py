from datetime import (
    datetime,
)
from .base import (
    BaseModel
)
from dataclasses import (
    dataclass
)
from typing import (
    Optional,
    ClassVar
)

@dataclass
class Account(BaseModel):
    table: ClassVar[str] = 'account'
    required_fields: ClassVar[set[str]] = {
        'id', 
        'email', 
        'password', 
        'fname', 
        'lname', 
        'modified_by'
        }
    optional_fields: ClassVar[set[str]] = {
        'mname'
        }
    columns: ClassVar[tuple[str]] = (
        'id', 
        'email', 
        'password', 
        'fname', 
        'lname',
        'modified',
        'modified_by',
        'created',
        'mname'
    )

    id: str
    email: str
    password: str
    fname: str
    lname: str
    created: Optional[datetime]
    modified: Optional[datetime]
    mname: Optional[str] = ""
    modified_by: str = "" 