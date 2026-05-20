from enum import Enum, auto

class SuccessCodes(Enum):
    #BASE
    BASE = 200 

    #JWT
    ACCESS_REFRESHED = auto()
    ACCESS_ACTIVE = auto()
    VALID_TOKEN = auto()
    REFRESH_SUCCESS = auto()

    #DOCUMENT
    UPDATED = auto()

    #GROUPINGS 
    CREATED = auto()
    RETRIEVED = auto()
    DELETED = auto()
