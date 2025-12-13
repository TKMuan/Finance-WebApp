from enums import ErrorCodes

class ValidationError(Exception):
    def __init__(self, code: ErrorCodes = ErrorCodes.BAD_REQUEST, message: str = None):
        self.code = code 
        self.message = message or f"Validation failed: {code.name}"
        super().__init__(self.message) 

class MissingFieldError(ValidationError):
    def __init__(self, fields=list[str], message=None):
        self.fields = fields
        if not message or message is None:
            message = f"Following fields are missing: {fields}"
        super().__init__(ErrorCodes.MISSING_FIELDS, message)

class ExtraFieldError(ValidationError):
    def __init__(self, fields=list[str], message=None):
        self.fields = fields
        if not message or message is None:
            message = f"Following fields are extra: {fields}"
        super().__init__(ErrorCodes.EXTRA_FIELDS, message)

class MissingDocumentID(ValidationError):
    def __init__(self, fields=list[str], message=None):
        self.fields = fields
        if not message or message is None:
            message = "Document does not exist"
        super().__init__(ErrorCodes.MISSING_DOCUMENT_ID, message)

class InvalidUserGrouping(ValidationError):
    def __init__(self, fields=list[str], message=None):
        self.fields = fields
        if not message or message is None:
            message = "User grouping does not exist"
        super().__init__(ErrorCodes.INVALID_USER_GROUPING, message)

class MissingChildValue(ValidationError):
    def __init__(self, 
                 message: str = "Parent grouping requires at least one child"
                 ):
        super().__init__(ErrorCodes.MISSING_CHILD_VALUE, message)


