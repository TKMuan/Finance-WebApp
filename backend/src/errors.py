class MissingFieldError(ValueError):
    def __init__(self, message=None, fields=None):
        if message is None:
            message = f"Required field(s) {fields}  are missing."
        super().__init__(message)

class JWTError(Exception):
    def __init__(self, message=None):
        if message is None:
            message = "An error occurred with JWT processing."
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

class DocumentError(Exception):
    def __init__(self, message=None):
        if message is None:
            message = "An error occurred with document processing."
        super().__init__(message)

class MissingDocumentID(DocumentError):
    def __init__(self, message=None):
        if message is None:
            message = "Valid Document ID is required."
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
