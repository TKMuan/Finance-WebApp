from psycopg2 import (
    sql
)
from psycopg2.extensions import (
    connection
)
from models import (
    BaseModel,
    UserGroups
)
from repositories import (
    UserGroupRepo 
)
from enums import (
    ErrorCodes
)
from errors import (
    ValidationError,
    MissingChildValue
)
from db import (
    transaction
)
from datetime import (
    datetime
)
from utils import (
    CryptoUtil
)
from typing import (
    Any
)
import logging

logger = logging.getLogger(__name__)

class UserGroupingService:
    def __init__(self, repo: UserGroupRepo):
        self.repo = repo

    def validate_creation_fields(self, input_fields: set[str]):
        UserGroups.check_required_fields(input_fields)

    def create_grouping(self, conn: connection, data: dict):

        logger.debug(f"Recieved data: {data}") 

        logger.debug(f"parent: {data}")
        
        data["created"] = datetime.now()
        data["modified"] = data["created"]
        data['modified_by'] = data['accountID']
        data['id'] = CryptoUtil.generate_sha256_hash(str(data['created']) + data['name'])

        parent_group = UserGroups(**data)
        logger.debug(f"parent information: {parent_group.__dict__}")

        with transaction(conn) as trans:
            self.repo.insert(trans, parent_group)

    def update_grouping(self, conn: connection, data: dict):
        logger.debug(f"Recieved data: {data}") 

        logger.debug(f"parent: {data}")

        with transaction(conn) as trans:
            res = self.repo.update_user_group(trans, data['accountID'], data['name'], data['id'])

        return res
    
    def get_user_group(self, conn: connection, accountID: str, id: str):

        data = self.repo.get_user_group(conn, accountID, id)
        logger.debug(f"recieved data: {data}")

        return data

    def get_all_user_groups(self, conn: connection, accountID: str, limit: int, page: int, name: str = None):

        logger.debug(f"accountID: {accountID}")
        logger.debug(f"limit: {limit}")
        logger.debug(f"page: {page}")
        
        limit = int(limit)
        page = int(page)

        data = self.repo.get_all_user_groups(conn, accountID, limit, page * limit, name)

        logger.debug(f"retrieved data: {data}")

        logger.debug(f"recieved data: {data}")

        return data

    def delete_user_grouping(self, conn: connection,  id: str, accountID: str):
        logger.debug("DELETING USER GROUPING")
        logger.debug(f"accountID: {accountID}")
        logger.debug(f"id: {id}")
        try: 
            success = self.repo.delete_user_group(conn, accountID, id)
            if not success: 
                raise RuntimeError("Unable to delete user group")
            return success
        
        except Exception as e:
            logger.error(str(e))
            raise