from enum import Enum, auto

class ErrorCodes (Enum):
    BAD_REQUEST = 4001 #Invalid JSON, missing required fields
    MISSING_FIELDS = 4002
    MISSING_CHILD_VALUE = 4003
    EXTRA_FIELDS = 4004 

    UNAUTHORIZED = 4101 #Invalid/Missing Auth Token
    UNAUTHORIZED_ACCESS = 4102
    INVALID_CREDENTIALS = 4103
    INVALID_USER_GROUPING = 4104
    REQUIRE_REFRESH = 4105
    REQUIRE_RE_AUTH = 4106
    EXPIRED_TOKEN = 4107
    MISSING_TOKEN = 4108
    INVALID_TOKEN = 4109

    FORBIDDEN = 4301 #Valid auth but no permission
    AUTH_FORBIDDEN = 4302

    NOT_FOUND = 4401 #Resource doesn't exist
    RECORD_NOT_FOUND = 4402 
    MISSING_MODIFYING_USER = 4403
    MISSING_DOCUMENT_ID = 4404

    INTERNAL_SERVER_ERROR = 5000 # Unhandled Exception, DB crash

    NOT_IMPLEMENTED = 5100 # Feature not built yet

    @property
    def http_status(self) -> int:
        """Simple mapping for your structure."""
        base = self.value // 100
        if base == 40: return 400    # 4000-4099 → 400
        if base == 41: return 401    # 4100-4199 → 400
        if base == 43: return 403    # 4300-4399 → 403  
        if base == 44: return 404    # 4400-4499 → 404
        if base == 50: return 500    # 4400-4499 → 404
        if base == 51: return 501    # 4400-4499 → 404



    


