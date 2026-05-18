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
        children = data.pop('children', [])

        if not children:
            raise MissingChildValue("Parent Grouping needs to have at least one child")

        logger.debug(f"parent: {data}")
        logger.debug(f"children: {children}")
        
        data["created"] = datetime.now()
        data["modified"] = data["created"]
        data['modified_by'] = data['accountID']
        data['parent'] = None
        data['id'] = CryptoUtil.generate_sha256_hash(str(data['created']) + data['name'])

        parent_group = UserGroups(**data)
        logger.debug(f"parent information: {parent_group.__dict__}")

        with transaction(conn) as trans:
            self.repo.insert(trans, parent_group)
            logger.debug("Parent inserted")
            child_created = datetime.now()
            for child in children:
                child['id'] = CryptoUtil.generate_sha256_hash(str(child_created) + child['name'])
                child['parent'] = data['id']
                child["created"] = child_created
                child["modified"] = child_created
                child['modified_by'] = data['accountID']
                child['accountID'] = data['accountID']

                logger.debug(f"child data: {child}")
                tempChild = UserGroups(**child)
                logger.debug(f"child information: {tempChild.__dict__}")
                self.repo.insert(trans, tempChild)
                logger.debug("Child inserted")

    def update_grouping(self, conn: connection, data: dict):
        logger.debug(f"Recieved data: {data}") 
        children = data.pop('children', [])
        deletions = data.pop('deletions', [])

        if not children:
            raise MissingChildValue("Parent Grouping needs to have at least one child")


        logger.debug(f"parent: {data}")
        logger.debug(f"children: {children}")

        with transaction(conn) as trans:
            self.repo.update_user_group(trans, data['accountID'], data['name'], data['id'])

            child_time = datetime.now()
            for child in children:
                cid = child.get("id", None)
                if not cid:
                    child['id'] = CryptoUtil.generate_sha256_hash(str(child_time) + child['name'])
                    child['created'] = child_time
                    child['modified'] = child_time
                    child['modified_by'] = data['accountID']
                    child['accountID'] = data['accountID']
                    child['parent'] = data['id']

                    logger.debug(f"Child record: {child}")
                    childObj = UserGroups(**child)
                    self.repo.insert(trans, childObj)
                else:
                    self.repo.update_user_group(trans, data['accountID'], child['name'], child['id'])
            
            for cid in deletions:
                self.repo.delete_user_group(conn, data['accountID'], cid)

        return
    
    def get_user_group(self, conn: connection, accountID: str, id: str):

        data = self.repo.get_user_group(conn, accountID, id)

        children = self.repo.get_children(conn, accountID, data['id'])
        if children:
            data['children'] = children
        logger.debug(f"recieved data: {data}")

        return data

    def get_all_user_groups(self, conn: connection, accountID: str, limit: int, page: int):

        logger.debug(f"accountID: {accountID}")
        logger.debug(f"limit: {limit}")
        logger.debug(f"page: {page}")
        
        limit = int(limit)
        page = int(page)

        data = self.repo.get_all_user_groups(conn, accountID, limit, page * limit)

        logger.debug(f"retrieved data: {data}")
        for record in data:
            children = self.repo.get_children(conn, accountID, record['id'])
            logger.debug(f"retrieved child: {children}")
            if children:
                record['children'] = children

        logger.debug(f"recieved data: {data}")

        return data

    def delete_user_grouping(self, conn: connection,  id: str, accountID: str):
        try: 
            success = self.repo.delete_user_group(conn, accountID, id)
            if not success: 
                raise RuntimeError("Unable to delete user group")
            return success
        
        except Exception as e:
            logger.error(str(e))
            raise