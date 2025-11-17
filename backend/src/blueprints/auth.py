from flask import Blueprint, request, jsonify
from src.errors import MissingFieldError
from ..db import get_db_connection
from ..models import Account
from ..api import AccountAPI, JWTAuthAPI

auth = Blueprint('auth', __name__, url_prefix='/auth')

@auth.route('/active', methods=['POST'])
def check_active_login():
    try:
        access_token = request.headers.get('Authorization', "").replace("Bearer ", "")
        refresh_token = request.cookies.get('refresh_token_cookie', None)

        response = JWTAuthAPI.check_active_login(access_token, refresh_token)
        success = response.get('status', '')
        if success:
            return jsonify({"status": "success", "code": "200", "message": "Active login validated successfully."})
        code = response.get('code', '')
        message = response.get('error', {}).get('message', '')
        return jsonify({"status": "error", "code": code, "error": message})

    except Exception as e:
        return jsonify({"status": "error", "code": "500", "error": {"message": str(e)}})

@auth.route('/login', methods=['POST'])
def login():
    try:
        conn = get_db_connection()
        data = request.json
        required_fields = {'email', 'password'}
        Account.check_required_fields(data=data, required_fields=required_fields)
        response = AccountAPI.validate_login(conn, data.get('email', ''), data.get('password', ''))
        return jsonify(response)

    except MissingFieldError as mfe:
        return jsonify({"status": "error", "code": "400", "error": {"message": str(mfe)}})

    except Exception as e:
        return jsonify({"status": "error", "code": "500", "error": {"message": str(e)}})