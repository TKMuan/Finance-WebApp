from enums import ErrorCodes

class AuthError(Exception):
    def __init__(self, code: ErrorCodes, message: str = None):
        self.code = code 
        self.message = message or f"Authentication failed: {code.name}"
        super().__init__(self.message) 

class InvalidCredentials(AuthError):
    def __init__(self, message: str = ""):
        if not message:
            message = "Invalid credentials"
        super().__init__(ErrorCodes.INVALID_CREDENTIALS, message)

class ExpiredToken(AuthError):
    def __init__(self, message: str = ""):
        if not message:
            message = "Token has expired"
        super().__init__(ErrorCodes.EXPIRED_TOKEN, message)

class MissingToken(AuthError):
    def __init__(self, message: str = ""):
        if not message:
            message = "No valid token"
        super().__init__(ErrorCodes.MISSING_TOKEN, message)

class InvalidToken(AuthError):
    def __init__(self, message: str = ""):
        if not message:
            message = "Given token is invalid"
        super().__init__(ErrorCodes.INVALID_TOKEN, message)

class MissingModifyingUser(AuthError):
    def __init__(self, message: str = ""):
        if not message:
            message = "Modifying user does not exist"
        super().__init__(ErrorCodes.MISSING_MODIFYING_USER, message)

class UnauthorizedAccess(AuthError):
    def __init__(self, message: str = ""):
        if not message:
            message = "User does not have access to current data"
        super().__init__(ErrorCodes.UNAUTHORIZED_ACCESS, message)

class AuthForbiddenError(AuthError):  
    def __init__(self, message: str = "User lacks permission"):
        super().__init__(ErrorCodes.AUTH_FORBIDDEN, message)