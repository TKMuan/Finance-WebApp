from flask import (
    Blueprint, 
    request, 
    make_response,
    current_app
)
from src.db import get_db_connection
from services import (
    account_service
)
from os import getenv

account = Blueprint('account', __name__, url_prefix='/account')


@account.route('/<string:id>', methods=['GET'])
def get_account(id):
    with get_db_connection() as conn:
        result = account_service.get_account(conn, id)
        return make_response(result)
