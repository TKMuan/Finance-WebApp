from psycopg2.extensions import (
    connection,
)
from psycopg2.extras import (
    RealDictCursor
)
from psycopg2 import (
    sql,
)
from errors.auth_errors import (
    InvalidToken,
    MissingToken,
    ExpiredToken,
    AuthError,
    AuthForbiddenError,
    InvalidCredentials
)
from errors import (
    ValidationError,
    MissingFieldError,
    ExtraFieldError,
    MissingDocumentID,
)
from errors import (
    UnauthorizedAccess
)
from models import (
    BaseModel,
    Account
)
from repositories import (
    BaseRepo,
    AccountRepo 
)
from typing import (
    Type
)
from utils import (
    CryptoUtil,
    AuthUtil
)
from datetime import (
    datetime,
    timezone
)
from db import (
    transaction
)
import jwt


class TransactionGroupService:
    def __init__(self, transaction_group_repo):
        self.transaction_group_repo = transaction_group_repo

    def create_transaction_group(self, conn: connection, account_id: str, name: str, description: str = ""):
        with transaction(conn) as cur:
            return self.transaction_group_repo.create_transaction_group(cur, account_id, name, description)