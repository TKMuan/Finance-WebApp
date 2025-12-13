from .document import Document

class Transactions(Document):    
    table: str = 'transactions'
    required_fields: set[str] = {
        'id', 
        'account_id', 
        'amount', 
        'transaction_time',
        't_type', 
        'methods',
        'modified_by',
        'modified'
        }
    optional_fields: set[str] = {
        'description', 
        'groups'}

    def __init__(self, 
                 id:str = None,
                 account_id: str = None, 
                 amount: int = 0,
                 description: str = None,
                 transaction_time: str = None,
                 t_type: bool = None,
                 groups: list[str] = None,
                 methods: list[str] = None,
                 modified_by: str = None,
                 modification_date: str = None,
                 created: str = None
                 ): 
        self.id = id
        self.accountID = account_id
        self.amount = amount
        self.description = description 
        self.transaction_time = transaction_time
        self.type = t_type
        self.transaction_group = groups
        self.transaction_method = methods
        self.modified_by = modified_by
        self.modified = modification_date
        self.created = created
    
    def to_dict(self):
        return {
            "id": self.id,
            "accountID": self.accountID,
            "amount": self.amount, 
            "description": self.description, 
            "transaction_time": self.transaction_time, 
            "type": self.type,
            'created': self.created,
            'modified': self.modified,
            'modified_by': self.modified_by
        }
