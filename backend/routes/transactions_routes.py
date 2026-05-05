from flask import (
    Blueprint, 
    request, 
    make_response 
)
from src.db import (
    get_db_connection
)
from models import (
    BaseModel
)
from services import (
    transaction_services
)
from flask_jwt_extended import (
    jwt_required, 
    get_jwt_identity
)
from flask_cors import (
    CORS
)
from os import (
    getenv
)
from dotenv import (
    load_dotenv
)

load_dotenv()

transactions = Blueprint('transactions', __name__, url_prefix='/transactions')

@transactions.route("/", methods=['POST'])
@jwt_required(locations=['cookies'])
def create_transaction():
    with get_db_connection() as conn:
        data = request.get_json()
        user_id = get_jwt_identity()
        res = transaction_services.create_transaction(conn, user_id, data)
        print(res)
        return make_response({
            "status": res.get("status", False), 
            "code": res.get("code", "").value, 
            "data": res.get("data", {}), 
            "message": res.get("message", "")})


