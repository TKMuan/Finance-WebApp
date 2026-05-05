from enums import ErrorCodes

class ModificationError(Exception):
    def __init__(self, code: ErrorCodes, message: str = None):
        self.code = code 
        self.message = message or f"Modification failed: {code.name}"
        super().__init__(self.message) 

class PermissionDenied(ModificationError):
    def __init__(self, message: str = None):
        if not message or message is None:
            message = "Permission Denied"
        super().__init__(ErrorCodes.UNAUTHORIZED_ACCESS, message)
