from flask import (
    Blueprint, 
    request, 
    current_app
)
from src.db import (
    get_db_connection
)
from models import (
    BaseModel
)
from services import (
    transaction_services
)
from flask_jwt_extended import (
    jwt_required, 
    get_jwt_identity
)
from utils import (
    APIUtil
)
from enums import (
    ErrorCodes,
    SuccessCodes
)
from db import (
    transaction
)
import json
import logging

logger = logging.getLogger(__name__)

TransactionsBlueprint = Blueprint('transactions', __name__, url_prefix='/transactions')

@TransactionsBlueprint.route("/", methods=['POST'])
def create_transaction():
    try: 
        data = request.json
        service = current_app.TransactionService
        logger.debug(f"recieved data:{data}")

        with get_db_connection() as conn:
            with transaction(conn) as trans:
                res = service.create_transaction(trans, data)
        
        return APIUtil.success_response(SuccessCodes.CREATED, res, "Created Transaction")
    except Exception as e:
        logger.error(str(e))
        return APIUtil.error_response(ErrorCodes.BASE, str(e))
        
@TransactionsBlueprint.route("/", methods=['PUT'])
def update_transaction():
    try: 
        data = request.json
        service = current_app.TransactionService
        logger.debug(f"recieved data:{data}")

        with get_db_connection() as conn:
            with transaction(conn) as trans:
                res = service.update_transaction(trans, data)
        
        return APIUtil.success_response(SuccessCodes.UPDATED, res, "Updated Transaction")
    except Exception as e:
        logger.error(str(e))
        return APIUtil.error_response(ErrorCodes.BASE, str(e))
        
@TransactionsBlueprint.route("/", methods=['DELETE'])
def delete_transaction():
    try: 
        with get_db_connection() as conn:
            with transaction(conn) as trans:
                data = request.args.to_dict()
                logger.debug(f"Recieved data: {data}")
                service = current_app.TransactionService
                methods = service.delete_transaction(conn, **data)
                logger.debug(f"Deleted transaction: {methods}")
            return APIUtil.success_response(SuccessCodes.BASE, methods, 'Method Deleted')

    except Exception as e:
        logger.debug(f"Recieved error {str(e)}")
        return APIUtil.error_response(code=ErrorCodes.BAD_REQUEST, message=str(e)) 


@TransactionsBlueprint.route("/", methods=['GET'])
def get_user_transaction():

    try: 
        data = request.args.to_dict()
        service = current_app.TransactionService
        logger.debug(f"recieved data:{data}")

        with get_db_connection() as conn:
                res = service.get_user_transaction(conn, **data)
        
        return APIUtil.success_response(SuccessCodes.RETRIEVED, res, "Retrieved Transaction")
    except Exception as e:
        logger.error(str(e))
        raise
        return APIUtil.error_response(ErrorCodes.BASE, str(e))

@TransactionsBlueprint.route("/all", methods=['GET'])
def get_all_user_transactions():
    try: 
        data = request.args.to_dict()
        service = current_app.TransactionService

        logger.debug(f"RETRIEVING USER TRANSACTIONS")
        logger.debug(f"recieved data:{data}")
        
        with get_db_connection() as conn:
                res = service.get_all_user_transaction(conn, **data)
        
        return APIUtil.success_response(SuccessCodes.RETRIEVED, {"data": res, "page": int(data["page"]), "size": data['limit']}, "Retrieved Transaction")
    except Exception as e:
        logger.error(str(e))
        raise
        return APIUtil.error_response(ErrorCodes.BASE, str(e))


@TransactionsBlueprint.route("/dashboard", methods=['GET'])
def get_transaction_dashboard():
    try: 
        data = request.args.to_dict()
        service = current_app.TransactionService

        logger.debug(f"RETRIEVING USER TRANSACTIONS")
        logger.debug(f"recieved data:{data}")
        
        with get_db_connection() as conn:
                res = service.get_dashboard_stats(conn, **data)
        
        return APIUtil.success_response(SuccessCodes.RETRIEVED, {"data": res}, "Retrieved Dashboard Stats")
    except Exception as e:
        logger.error(str(e))
        raise
        return APIUtil.error_response(ErrorCodes.BASE, str(e))



