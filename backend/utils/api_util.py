from flask import (
    make_response,
    Response
)
from enums import (
    SuccessCodes,
    ErrorCodes
)
from typing import (
    Any
)
class APIUtil:
    @staticmethod
    def success_response(code: SuccessCodes, data: Any, message: str="") -> tuple[Response, int]:
        return make_response({
            'status': True,
            'code': code.value,
            'data': data,
            'message': message
        }
        ), 200 
    @staticmethod
    def error_response(code: ErrorCodes, message: str) -> Response:
        return make_response({
            "status": False,
            'code': code.value,
            'message': message
        }
        ), code.http_status