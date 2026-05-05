from enum import Enum
from typing import Type, Union

class ErrorCodes:
    class BASE(Enum):
        ERROR = "400"

    class JWT(Enum):
        REQUIRE_REFRESH = "401"
        REQUIRE_RE_AUTH = "402"
        EXPIRED_TOKEN = "403"
        MISSING_TOKEN = "404"
        INVALID_TOKEN = "405"

    class DOCUMENT(Enum):
        RECORD_NOT_FOUND = '401'
        MISSING_MODIFYING_USER = '402'
        UNAUTHORIZED_ACCESS = '403'

    class ACCOUNT(Enum):
        INVALID_CREDENTIALS = "404"


class SuccessCodes:
    class BASE(Enum):
        SUCCESS = "200"

    class JWT(Enum):
        ACCESS_REFRESHED = "201"
        ACCESS_ACTIVE = '202'
        VALID_TOKEN = '203'
        REFRESH_SUCCESS = '204'

    class DOCUMENT(Enum):
        UPDATED = "201"

SuccessTypes = Union[SuccessCodes.JWT, SuccessCodes.DOCUMENT, SuccessCodes.BASE]
ErrorTypes = Union[ErrorCodes.DOCUMENT, ErrorCodes.JWT, ErrorCodes.ACCOUNT, ErrorCodes.BASE]

class JWTError(Exception):
    def __init__(self, message: str=None, code: Union[ErrorCodes.JWT, ErrorCodes.BASE]=None):
        if code is None:
            code = ErrorCodes.BASE.ERROR
        if message is None:
            message = "An error occurred with JWT processing."
        super().__init__(message)
        self.code = code

class MissingFieldError(ValueError):
    def __init__(self, message=None, fields=None):
        if message is None:
            message = f"Required field(s) {fields}  are missing."
        super().__init__(message)


class AuthenticationError(Exception):
    def __init__(self, message=None):
        if message is None:
            message = "An authentication error occurred."
        super().__init__(message)

class AccountError(Exception):
    def __init__(self, message=None):
        if message is None:
            message = "An error occurred with account processing."
        super().__init__(message)

class PermissionError(Exception):
    def __init__(self, message=None):
        if message is None:
            message = "Permission denied."
        super().__init__(message)    

class MissingModifyingUser(AccountError):
    def __init__(self, message=None):
        if message is None:
            message = "Modifying user information is required."
        super().__init__(message)
        self.code = ErrorCodes.DOCUMENT.MISSING_MODIFYING_USER

class DocumentError(Exception):
    def __init__(self, message=None):
        if message is None:
            message = "An error occurred with document processing."
        super().__init__(message)

class MissingDocumentID(DocumentError):
    def __init__(self, message=None):
        if message is None:
            message = "Valid DOCUMENT ID is required."
        super().__init__(message)

class UnauthorizedAccess(PermissionError):
    def __init__(self, message=None):
        if message is None:
            message = "Unauthorized access."
        super().__init__(message)

class MissingJWTToken(JWTError):
    def __init__(self, message=None):
        if message is None:
            message = "JWT token is missing."
        super().__init__(message)

class ExpiredJWTToken(JWTError):
    def __init__(self, message=None):
        if message is None:
            message = "JWT token has expired."
        super().__init__(message)

class ExpiredRefreshToken(JWTError):
    def __init__(self, message=None):
        if message is None:
            message = "Refresh token has expired."
        super().__init__(message)

class InvalidJWTToken(JWTError):
    def __init__(self, message=None):
        if message is None:
            message = "JWT token is invalid."
        super().__init__(message)

class InvalidCredentials(AuthenticationError):
    def __init__(self, message=None):
        if message is None:
            message = "Invalid credentials provided."
        super().__init__(message)
