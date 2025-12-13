from .document import Document

class UserMethods(Document):
    table: str = '"userMethods"'
    required_fields: set[str] = {'account_id', 'name', 'modifying_user'}
    optional_fields: set[str] = {'description'} 


    def __init__(
            self,
            id: str = "",
            account_id: str = "",
            name: str = "",
            description: str = ""
            ):
        self.id: str = id
        self.account_id: str = account_id
        self.name: str = name
        self.description: str = description
