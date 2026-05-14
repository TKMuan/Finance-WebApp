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
    UnauthorizedAccess,
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
            limit: int = 10,
            page: int = 0) -> list[dict[str, str],]:

        try:
            limit = int(limit)
            page = int(page)
            offset = page * limit
            logger.debug(f"Retrieving user methods for id: {id} with limit: {limit}  offset: {offset} page: {page}")
            data =  self.repo.get_user_methods(conn=conn, id=id, limit=limit, offset=offset)
            logger.debug(f"Recieved data: {data}")
            return {"data": data, "page": page, "limit": limit}

        except Exception as e:
            logger.debug(f"Encountered error: {str(e)}")
            raise

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
            with transaction(conn) as trans:
                created_method = self.repo.insert(trans, new_method)

            return new_method.__dict__
        except Exception as e:
            logger.error(str(e))
            raise
    
    def update_user_method(
            self,
            conn: connection,
            id: str,
            accountID: str,
            name: str):
        
        try: 

            logger.debug(f"Recieved details: id-{id} | accountID-{accountID} | name: {name}")
            self.repo.validate_owner(conn, accountID, id)

            success = self.repo.update_user_method(conn, name, accountID, id)

            if not success: 
                raise RuntimeError("Unable to update user method")

            return success
        
        except Exception as e:
            logger.error(str(e))
            raise
    
    def delete_user_method(self, conn: connection,  id: str, accountID: str):
        try: 

            self.repo.validate_owner(conn, accountID, id)
            success = self.repo.delete_user_method(conn, accountID, id)

            if not success: 
                raise RuntimeError("Unable to update user method")

            return success
        
        except Exception as e:
            logger.error(str(e))
            raise