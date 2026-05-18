from flask import (
    Blueprint, 
    request, 
    make_response, 
    current_app
)
from src.db import (
    get_db_connection
)
from flask_jwt_extended import (
    jwt_required
)
from utils import (
    APIUtil
)
from enums import (
    SuccessCodes,
    ErrorCodes
)
import logging

logger = logging.getLogger(__name__)


UserGroupingBlueprint = Blueprint('ugroupings', __name__, url_prefix='/groupings')

@UserGroupingBlueprint.route('/', methods=['POST'])
def create_user_grouping():
    try:
        with get_db_connection() as conn:
            data = request.json
            logger.debug(f"data recieved: {data}")
            service = current_app.GroupsService
            user_group = service.create_grouping(conn, data)
            return APIUtil.success_response(SuccessCodes.BASE, {}, "success")
    except Exception as e:
        return APIUtil.error_response(ErrorCodes.BASE, str(e))

@UserGroupingBlueprint.route("/", methods=['PUT'])
def update_user_grouping():
    try:
        with get_db_connection() as conn:
            data = request.json
            logger.debug(f"data recieved: {data}")
            service = current_app.GroupsService
            user_group = service.update_grouping(conn, data)
            return APIUtil.success_response(SuccessCodes.BASE, {}, "success")
    except Exception as e:
        return APIUtil.error_response(ErrorCodes.BASE, str(e))

@UserGroupingBlueprint.route("/all", methods=['GET'])
def user_groupings():
    try:
        args = request.args.to_dict()

        with get_db_connection() as conn:
            service = current_app.GroupsService
            res = service.get_all_user_groups(conn, **args)
        
        logger.debug(f"Retrieved data: {res}")

        return APIUtil.success_response(SuccessCodes.BASE, res, "success")
        
    except Exception as e: 
        raise
        return APIUtil.error_response(ErrorCodes.BASE, str(e))

@UserGroupingBlueprint.route("/", methods=['GET'])
def user_grouping():
    try:
        with get_db_connection() as conn:
            uid = request.args.get('id')
            accountID = request.args.get('accountID')
            logger.debug(f"uid: {uid}")
            logger.debug(f"accountID: {accountID}")
            service = current_app.GroupsService
            res = service.get_user_group(conn, accountID, uid)

        return APIUtil.success_response(SuccessCodes.BASE, res, "success")
        
    except Exception as e: 
        return APIUtil.error_response(ErrorCodes.BASE, str(e))

@UserGroupingBlueprint.route("/", methods=['DELETE'])
def delete_grouping():
    try:
        with get_db_connection() as conn:
            args = request.args.to_dict()
            logger.debug(f"args: {args}")
            service = current_app.GroupsService

        return APIUtil.success_response(SuccessCodes.BASE, {}, "success")
        
    except Exception as e: 
        return APIUtil.error_response(ErrorCodes.BASE, str(e))