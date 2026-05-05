from errors import (
    ExtraFieldError,
    MissingFieldError,
    MissingDocumentID
)
from errors import (
    MissingModifyingUser,
    UnauthorizedAccess
)
from dataclasses import (
    dataclass
)
from typing import (
    ClassVar,
    Type,
    Any
)

@dataclass
class BaseModel:
    table: ClassVar[str] = ""
    required_fields: ClassVar[set[str]] = set()
    optional_fields: ClassVar[set[str]] = set()
    columns: ClassVar[tuple[str]] = () 

    @classmethod
    def allowed_fields(cls: Type['BaseModel']) -> set:
        return cls.required_fields.union(cls.optional_fields)

    @classmethod
    def check_extra_fields(cls: Type['BaseModel'], data: dict[str, Any], allowed_fields: set[str] = None) -> None:
        if allowed_fields is None:
            allowed_fields = cls.allowed_fields()
        fields = set(data.keys()) - allowed_fields
        if fields:
            raise ExtraFieldError(fields=fields)

    @classmethod
    def check_required_fields(cls: Type['BaseModel'], data: dict[str, Any], required_fields: set[str] = None) -> None:
        if not required_fields:
            required_fields = cls.required_fields
        missing_fields = required_fields - set(data.keys())
        if missing_fields:
            raise MissingFieldError(fields=missing_fields)

