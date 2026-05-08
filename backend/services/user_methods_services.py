from psycopg2.extensions import (
    connection,
)
from psycopg2.extras import (
    RealDictCursor
)
from models import (
    UserMethods,
    Account
)
from repositories import (
    MethodsRepo,
    AccountRepo
)
from datetime import (
    datetime,
    timezone
)
from db import (
    transaction
)
from errors import (
    ValidationError,
    MissingFieldError,
    ExtraFieldError,
    MissingDocumentID,
)
from utils import (
    CryptoUtil
)
import logging

logger = logging.getLogger(__name__)

class MethodsService:
    def __init__(self, repo: MethodsRepo):
        self.repo: MethodsRepo = repo
    
    def get_user_methods(
            self,
            conn: connection,
            id: str,
            limit: int = None,
            offset: int = None) -> list[dict[str, str],]:

        return self.repo.get_user_methods(conn=conn, id=id, limit=limit, offset=offset)

    def create_user_method(
            self,
            conn: connection,
            accountID: str,
            name: str) -> dict[str, str]:

        current = datetime.now()

        method_data = {
            "id": CryptoUtil.generate_sha256_hash(str(datetime.today()) + name),
            "accountID": accountID,
            "name": name,
            "created": current,
            "modified": current,
            "modified_by": accountID
        }

        try:
            logger.debug(f"Recieved data: {method_data}")
            new_method = UserMethods(**method_data)
            logger.debug("Created method object")
            logger.debug(f"object attributes: {new_method.__dict__}" )
            with transaction(conn) as cur:
                created_method = self.repo.insert(cur, new_method)

            return created_method
        except Exception as e:
            logger.error(str(e))
            raise