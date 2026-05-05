from enums import ErrorCodes

class TransactionError(Exception):
    def __init__(self, code: ErrorCodes, message: str = None):
        self.code = code 
        self.message = message or f"Transaction failed: {code.name}"
        super().__init__(self.message) 

class InvalidGroupError(TransactionError):
    def __init__(self, message: str = None):
        if not message or message is None:
            message = "Transaction Group does not exist for current user"
        super().__init__(ErrorCodes.INVALID_USER_GROUPING, message) 

class InvalidMethodError(TransactionError):
    def __init__(self, message: str = None):
        if not message or message is None:
            message = "Transaction method does not exist for current user"
        super().__init__(ErrorCodes.INVALID_USER_GROUPING, message) 

