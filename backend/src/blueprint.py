from flask import Blueprint, request, jsonify
from src.api import AccountAPI
from src.db import get_db_connection

account = Blueprint('account', __name__, url_prefix='/account')

@account.route('/', methods=['POST'])
def create_account():
    conn = get_db_connection()
    data = request.json
    account = AccountAPI.create_account(conn, data)
    return jsonify(account)

@account.route('/<string:id>', methods=['GET'])
def get_account(id):
    conn = get_db_connection()
    result = AccountAPI.get_account(conn, id)
    return jsonify(result)
