from psycopg2.extensions import (
    connection,
)
from db import (
    transaction
)
from models import (
    Transactions,
    TransactionGroups
)
from repositories import (
    TransactionsRepo,
    TransactionsGroupRepo
)
from .transaction_groups_services import (
    TransactionGroupService
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
from datetime import (
    datetime,
    timezone
)
from typing import (
    Any
)
import logging

logger = logging.getLogger(__name__)

class TransactionsService:
    def __init__(self, repo: TransactionsRepo, groupRepo: TransactionsGroupRepo):
        self.repo: TransactionsRepo = repo
        self.groupRepo: TransactionsGroupRepo = groupRepo
    
    def create_transaction_group(self, trans: connection, accountID: str, transactionID: str, groupsData: list[str]):

        time = datetime.now()
        for group in groupsData:
            group_data = {
                "groupID": group,
                "transactionID": transactionID,
                "modified": time,
                "created": time,
                "modified_by": accountID
            }
            logger.debug("")
            gData = TransactionGroups(**group_data)
            logger.debug(f"Grouping data: {gData.__dict__}")
            self.groupRepo.insert(trans, gData)
            logger.debug(f"INSERTED GROUPING")
                
    
    def create_transaction(self, trans:connection,  data: dict[str, Any]):
        logger.debug(f"Recieved data: {data}")  
        tGroups = data.pop("groups", [])

        timing = datetime.now(tz=timezone.utc)
        data['id'] = CryptoUtil.generate_sha256_hash(str(timing) + data['accountID'])
        data['created'] = timing
        data['modified'] = timing
        data['modified_by'] = data['accountID']
        data['transaction_time'] = datetime.fromisoformat(data['transaction_time'].replace('Z', '+00:00'))
        new_transaction = Transactions(**data)
        logger.debug(f"transaction data: {new_transaction.__dict__}")

        result = self.repo.insert(trans, new_transaction)

        if tGroups:
            self.create_transaction_group(trans, data['accountID'], data['id'], tGroups)

        return result 

    
    def update_transaction(self, trans: connection, data: dict[str, Any]):
        logger.debug(f"Recieved data: {data}")
        groups = data.pop("groups")

        time = datetime.now()
        data['modified'] = time
        transID = data['id']
        result = self.repo.update_transactions(trans, data)

        where_conditions = {"transactionID": transID} 
        self.groupRepo.delete_transaction_group(trans, where_conditions)

        for group in groups:
            tgData = {
                "transactionID": transID,
                "groupID": group,
                "created": time,
                "modified": time,
                "modified_by": data['accountID']
            }
            transGroup = TransactionGroups(**tgData)
            self.groupRepo.insert(trans, transGroup)

        return result
    
    def delete_transaction(self, trans: connection, transID: str):

        res1 = self.groupRepo.delete_transaction_group(trans, {"transactionID": transID})

        res2 = self.repo.delete_transactions(trans, transID)

        return res1 and res2
    
    def get_user_transaction(self, conn: connection, accountID: str, transID: str):

        transaction = self.repo.get_user_transaction(conn, accountID, transID)

        transaction_groups = self.groupRepo.get_transaction_group(conn, {"transactionID": transID}) 

        transaction['groups'] = transaction_groups

        return transaction

    def get_all_user_transaction(
            self, 
            conn: connection, 
            accountID: str,
            from_date: str = None,
            to_date: str = None,
            desc: str = None,
            from_amount: str = None,
            to_amount: str = None,
            tType: str = None,
            method: str = None,
            group: str = None,
            limit: str = None,
            page: str = None 
            ):


        if group:
            group = group.split(",")
        if tType:
            tType = True if tType.lower() == "true" else False
        if from_amount:
            from_amount = int(from_amount)
        if to_amount:
            to_amount = int(to_amount)
        if from_date:
            from_date = datetime.fromisoformat(from_date)
        if to_date:
            to_date = datetime.fromisoformat(to_date)
        
        if limit is not None:
            limit = int(limit)
        if page is not None:
            page = int(page)

        logger.debug(f"accountID: {accountID}")
        logger.debug(f"from_date: {from_date}")
        logger.debug(f"to_date: {to_date}")
        logger.debug(f"desc: {desc}")
        logger.debug(f"from_amount: {from_amount}")
        logger.debug(f"to_amount: {to_amount}")
        logger.debug(f"tType: {tType}")
        logger.debug(f"method: {method}")
        logger.debug(f"group: {group}")
        logger.debug(f"limit: {limit}")
        logger.debug(f"page: {page}")
        logger.debug(f"offset: {limit * page}")

        res = self.repo.get_all_user_transactions(
            conn,
            desc=desc,
            accountID=accountID,
            from_date=from_date,
            to_date=to_date,
            from_amount=from_amount,
            to_amount=to_amount,
            tType=tType,
            method=method,
            group=group,
            limit=limit,
            page=page
            )
        for record in res:
            groups = self.groupRepo.get_transaction_group(conn, {"transactionID": record['id']})
            record['groups'] = groups
        return res
    
    def get_dashboard_stats(self, conn: connection, accountID: str):

        data = self.repo.dashboard_stats(conn, accountID)

        return data

    def get_balance(self, conn: connection, accountID: str):

        return self.repo.get_balance(conn, accountID)
