from flask import Blueprint, request, jsonify
from src.db import get_db_connection
from ..api import AccountAPI

account = Blueprint('account', __name__, url_prefix='/account')

@account.route('/', methods=['POST'])
def create_account():
    with get_db_connection() as conn:
        data = request.json
        account = AccountAPI.create_account(conn, data)
        return jsonify(account)

@account.route('/<string:id>', methods=['GET'])
def get_account(id):
    with get_db_connection() as conn:
        result = AccountAPI.get_account(conn, id)
        return jsonify(result)
