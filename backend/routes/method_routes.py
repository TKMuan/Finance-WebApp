from flask import (
    Blueprint, 
    request, 
    jsonify, 
    make_response ,
    current_app
)
from src.db import (
    get_db_connection
)
from models import (
    UserMethods
)
from enums import (
    SuccessCodes,
    ErrorCodes
)
from dotenv import (
    load_dotenv
)
from utils import (
    APIUtil
)
import os
import logging

JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900))  # in minutes
JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000))  # in minutes

logger = logging.getLogger(__name__)

MethodBluePrint = Blueprint('method', __name__, url_prefix='/method')

@MethodBluePrint.route('/', methods=['POST'])
def create_method():
    try:
        logger.debug("Creating method")
        with get_db_connection() as conn:
            data = request.json
            logger.debug(f"Recieved data: {data}")
            service = current_app.MethodService
            new_method = service.create_user_method(conn, name=data['name'], accountID=data['accountID'])
            return APIUtil.success_response(SuccessCodes.BASE, new_method, 'Method Created')
    except Exception as e:
        logger.error(f"Error encountered: {str(e)}")
        return APIUtil.error_response(code=ErrorCodes.BAD_REQUEST, message = str(e))

@MethodBluePrint.route('/', methods=['PUT'])
def update_method():
    try: 
        with get_db_connection() as conn:
            data = request.json
            logger.debug(f"Recieved data: {data}")
            service = current_app.MethodService
            methods = service.update_user_method(conn, **data)
            logger.debug(f"Retrieved methods: {methods}")
            return APIUtil.success_response(SuccessCodes.BASE, methods, 'Method Updated')

    except Exception as e:
        logger.debug(f"Recieved error {str(e)}")
        return APIUtil.error_response(code=ErrorCodes.BAD_REQUEST, message=str(e)) 

@MethodBluePrint.route('/all', methods=['GET'])
def get_methods():
    try: 
        with get_db_connection() as conn:
            data = request.args.to_dict()
            logger.debug(f"Recieved data: {data}")
            service = current_app.MethodService
            method = service.get_user_methods(conn, **data)
            logger.debug(f"Retrieved method: {method}")
            return APIUtil.success_response(SuccessCodes.BASE, method, 'Method Retrieved')

    except Exception as e:
        logger.debug(f"Recieved error {str(e)}")
        return APIUtil.error_response(code=ErrorCodes.BAD_REQUEST, message=str(e)) 

@MethodBluePrint.route('/', methods=['GET'])
def get_method():
    try: 
        with get_db_connection() as conn:
            data = request.args.to_dict()
            logger.debug(f"Recieved data: {data}")
            service = current_app.MethodService
            methods = service.get_user_method(conn, **data)
            logger.debug(f"Retrieved methods: {methods}")
            return APIUtil.success_response(SuccessCodes.BASE, methods, 'Method Created')

    except Exception as e:
        logger.debug(f"Recieved error {str(e)}")
        return APIUtil.error_response(code=ErrorCodes.BAD_REQUEST, message=str(e)) 

@MethodBluePrint.route('/', methods=['DELETE'])
def delete_method():
    try: 
        with get_db_connection() as conn:
            data = request.args.to_dict()
            logger.debug(f"Recieved data: {data}")
            service = current_app.MethodService
            methods = service.delete_user_method(conn, **data)
            logger.debug(f"Retrieved methods: {methods}")
            return APIUtil.success_response(SuccessCodes.BASE, methods, 'Method Deleted')

    except Exception as e:
        logger.debug(f"Recieved error {str(e)}")
        return APIUtil.error_response(code=ErrorCodes.BAD_REQUEST, message=str(e)) 
