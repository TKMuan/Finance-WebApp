from flask import (
    Blueprint, 
    request, 
    jsonify, 
    make_response ,
    current_app
)
from flask_cors import (
    CORS
)
from src.db import (
    get_db_connection
)
from errors import (
    AuthError,
    MissingFieldError
)
from models import (
    Account
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

env = load_dotenv()

JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900))  # in minutes
JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000))  # in minutes

auth = Blueprint('auth', __name__, url_prefix='/auth')
cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
origins_list = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]
CORS(auth, supports_credentials=True, resources={r"/*": {"origins": origins_list}})

@auth.route('/cookie/active', methods=['POST'])
def check_active_login():
    try:
        access_token = request.cookies.get('access_token_cookie', "")
        refresh_token = request.cookies.get('refresh_token_cookie', "")

        with get_db_connection() as conn:
            response = current_app.account_service.check_active_login(conn, access_token, refresh_token)
        print("response: ", response)

        refreshed = response.pop('refreshed')
        tokens = response.pop('token', "") 
        res, code = APIUtil.success_response(
            code=SuccessCodes.ACCESS_REFRESHED,
            data=response
        )
        # need to add validation of wheter token was properly updated before setting cookie
        if refreshed:
            res.set_cookie(
                "access_token_cookie",
                tokens['access_token'],
                max_age=JWT_ACCESS_TOKEN_EXPIRES,
                path='/',
                httponly=True,
                secure=False,
                samesite="Strict"
            )
        return res, code

    except AuthError as ae:
        return APIUtil.error_response(
            code= ae.code, 
            messsage= str(e)
            )

    except Exception as e:
        return make_response(
            code = ErrorCodes.BAD_REQUEST, 
            message = str(e))


@auth.route('/login', methods=['POST'])
def login():
    try:
        with get_db_connection() as conn:
            data = request.json
            print("Login data received:", data)
            required_fields = {'email', 'password'}
            Account.check_required_fields(data=data, required_fields=required_fields)
            result = current_app.account_service.login(conn, data.get('email', ''), data.get('password', ''))
            print("result: ", result)
            tokens = result.pop('tokens')

            res, code = APIUtil.success_response(code=SuccessCodes.ACCESS_ACTIVE, data=result.get('user'))
            print("res: ", res)
            access_token = tokens.get('access_token')
            refresh_token = tokens.get('refresh_token') 

            res.set_cookie(
                'refresh_token_cookie', 
                refresh_token,
                httponly=True, 
                secure=False,
                max_age=JWT_REFRESH_TOKEN_EXPIRES,  # 30 days
                samesite='Strict',
                path='/auth/cookie'
            )
            res.set_cookie(
                'access_token_cookie',
                access_token,
                httponly=True,
                secure=False,
                max_age=JWT_ACCESS_TOKEN_EXPIRES,  # 15 days
                samesite='Strict',
                path='/'
            )
            return res, code

    except MissingFieldError as mfe:
        return APIUtil.error_response(code=mfe.code, message = str(mfe))
        

    except Exception as e:
        return APIUtil.error_response(code=ErrorCodes.BAD_REQUEST, message = str(e))

@auth.route('/new', methods=['POST'])
def create_account():
    try:

        with get_db_connection() as conn:
            data = request.json
            service = current_app.account_service
            account = service.create_account(conn, data)
            return APIUtil.success_response(SuccessCodes.BASE, account, 'Account Created')
    except Exception as e:
        return APIUtil.error_response(code=ErrorCodes.BAD_REQUEST, message = str(e))

@auth.route('/logout', methods=['POST'])
def auth_logout():
    #to be implemented
    pass

"""
to be checked later
@auth.route('/cookie/validate', methods=['POST'])
def validate_token_cookie():
    try:
        access_token = request.cookies.get('access_token_cookie', None)
        refresh_token = request.cookies.get('refresh_token_cookie', None)

        access_valid = auth_service.validate_token(access_token)
        refresh_valid = auth_service.validate_token(refresh_token)

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
"""