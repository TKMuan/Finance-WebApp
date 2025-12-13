from .document import Document

class TransactionMethods(Document):
    table: str = '"transactionMethods"'

    def __init__(
            self,
            id: str,
            transaction_id: str,
            method_id: str
            ):
        self.id: str = id
        self.transaction_id: str = transaction_id
        self.method_id: str = method_id
