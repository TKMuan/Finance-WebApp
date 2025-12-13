from flask import Blueprint, request, make_response 
from src.db import get_db_connection
from services import (
    user_grouping_services,
    transaction_groups_services
)
from flask_jwt_extended import jwt_required
from flask_cors import CORS
from os import getenv
from dotenv import load_dotenv

load_dotenv()

cors_origins = getenv('CORS_ALLOWED_ORIGINS', '')
origins_list = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]

ugroupings = Blueprint('ugroupings', __name__, url_prefix='/groupings/user')
tgroupings = Blueprint('tgroupings', __name__, url_prefix='/groupings/transaction')

CORS(ugroupings, supports_credentials=True, resources={
    r"/*": {
        "origins": origins_list
    }
})

@ugroupings.route('/', methods=['POST'])
@jwt_required()
def create_user_grouping():
    with get_db_connection() as conn:
        data = request.json
        print("data: ", data)
        user_group = user_grouping_services.create_grouping(conn, data)
        return make_response({
            "status": user_group.get("status", False), 
            "code": user_group.get("code", "").value, 
            "data": user_group.get("data", {}), 
            "message": user_group.get("message", "")})

@ugroupings.route("/groups", methods=['GET'])
@jwt_required()
def user_groupings():
    with get_db_connection() as conn:
        uid = request.args.get('id')
        page_size = int(request.args.get('page_size', 10))
        page = int(request.args.get('page', 1))
        res = user_grouping_services.get_user_groups(conn, uid, page_size, page)
        return make_response({
            'status': res.get('status'), 
            "code": res.get('code').value, 
            "data": res.get('data'),
            'message': res.get('message')})

@ugroupings.route('/parents', methods=['GET'])
@jwt_required()
def user_group_parents():
    uid = request.args.get('id')
    if not uid:
        return make_response({"message": "failed, no id"})
    with get_db_connection() as conn:
        res = user_grouping_services.get_parent_groups(conn, uid)
        return make_response({
            "status": res.get("status"),
            "data": res.get('data', ""),
            "code": res.get('code').value,
            "message": res.get("message")})

@ugroupings.route('/children', methods=['GET'])
@jwt_required()
def group_children():
    pid = request.args.get('pid')
    if not pid:
        return make_response({"message": "failed, no id"})
    with get_db_connection() as conn:
        res = user_grouping_services.get_children(conn, pid)
        print("res: ", res)
        return make_response({
            "status": res.get("status", ""),
            "data": res.get('data', ""),
            "code": res.get('code').value,
            "message": res.get("message", "")})
