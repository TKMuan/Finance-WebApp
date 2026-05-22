from flask import Blueprint, request, jsonify, make_response 
from flask_cors import CORS
from src.errors import MissingFieldError
from ..db import get_db_connection
from ..models import Account
from ..api import AccountAPI, JWTAuthAPI
from dotenv import load_dotenv
import os

env = load_dotenv()

JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900))  # in minutes
JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000))  # in minutes

auth = Blueprint('auth', __name__, url_prefix='/auth')

@auth.route('/cookie/active', methods=['POST'])
def check_active_login():
    print("request method:", request.method)
    try:
        access_token = request.cookies.get('access_token_cookie', "")
        refresh_token = request.cookies.get('refresh_token_cookie', "")

        with get_db_connection() as conn:
            response = JWTAuthAPI.check_active_login(conn, access_token, refresh_token)
        print("response: ", response)
        success = response.get('status', '')
        if not success:
            code = response.get('code', '')
            message = response.get('message', "Error validating login")
            return make_response({"status": False, "code": code.value, "error": message})
        
        code = response.get('code', "")
        data = response.get('data')

        access_token = data.pop('access_token', "") 
        res = make_response(
            {
                'status': True,
                'code': '200',
                'data': data,
            })

        # need to add validation of wheter token was properly updated before setting cookie
        if access_token:
            res.set_cookie(
                "access_token_cookie",
                access_token,
                max_age=JWT_ACCESS_TOKEN_EXPIRES,
                path='/',
                httponly=True,
                secure=False,
                samesite="Strict"
            )
        return res

    except Exception as e:
        return make_response({"status": False, "code": "500", "error": {"message": str(e)}})

@auth.route('/cookie/validate', methods=['POST'])
def validate_token_cookie():
    try:
        access_token = request.cookies.get('access_token_cookie', None)
        refresh_token = request.cookies.get('refresh_token_cookie', None)

        access_valid = JWTAuthAPI.validate_token(access_token)
        refresh_valid = JWTAuthAPI.validate_token(refresh_token)

        result = {
            "access_token_valid": access_valid.get('status', ''),
            "refresh_token_valid": refresh_valid.get('status', '')
            }
        
        errors = {
            "access_token_error": access_valid.get('error', {}) if not access_valid.get('status', '') else None,
            "refresh_token_error": refresh_valid.get('error', {}) if not refresh_valid.get('status', '') else None
        }

        response = make_response({"status": True, "code": 200, "data": result, "message": errors})
        return make_response(response)

    except Exception as e:
        return make_response({"status": False, "code": "500", "error": str(e)})

@auth.route('/login', methods=['POST'])
def login():
    try:
        with get_db_connection() as conn:
            data = request.json
            print("Login data received:", data)
            required_fields = {'email', 'password'}
            Account.check_required_fields(data=data, required_fields=required_fields)
            result = AccountAPI.validate_login(conn, data.get('email', ''), data.get('password', ''))
            if not result.get('status', ''):
                return make_response({"status" :False, "code": result.get('code', '').value, "message": result.get('message', '')})

            data = {
                'status': True,
                'code': '200',
                'data': {
                    'email': result.get('data', {}).get('email', ''),
                    'fname': result.get('data', {}).get('fname', ''),
                    'id': result.get('data', {}).get('id', '')
                }
            }

            response = make_response(data)
            access_token = result.get('data', {}).get('access_token', '')
            refresh_token = result.get('data', {}).get('refresh_token', '') 

            response.set_cookie(
                'refresh_token_cookie', 
                refresh_token,
                httponly=True, 
                secure=False,
                max_age=JWT_REFRESH_TOKEN_EXPIRES,  # 30 days
                samesite='Strict',
                path='/auth/cookie'
            )
            response.set_cookie(
                'access_token_cookie',
                access_token,
                httponly=True,
                secure=False,
                max_age=JWT_ACCESS_TOKEN_EXPIRES,  # 15 days
                samesite='Strict',
                path='/'
            )
            return response

    except MissingFieldError as mfe:
        response = make_response({"status": False, "code": "400", "error": {"message": str(mfe)}})
        return response

    except Exception as e:
        return make_response({"status": False, "code": "500", "error": {"message": str(e)}})