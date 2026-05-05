import os
from flask import Flask, render_template, request, redirect, url_for
from flask_jwt_extended import JWTManager, jwt_required
from src.blueprints.account import account
from routes.auth_routes import auth
from src.db import get_db_connection
from dotenv import load_dotenv
from datetime import timedelta
from flask_cors import CORS
load_dotenv()

app = Flask(__name__)
cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
origins_list = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": origins_list,
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
    }
})
# instantiate repositories and services and attach to app
from repositories.account_repo import AccountRepo
from services.account_service import AccountService

app.account_repo = AccountRepo()
app.account_service = AccountService(app.account_repo)

app.register_blueprint(account)
app.register_blueprint(auth)


app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900)))  # in seconds
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(seconds=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000)))  # in seconds

jwt = JWTManager(app)

@jwt_required()
@app.route('/debug/tables')
def index():
    conn = get_db_connection()


    @jwt_required()
    @app.route('/debug/tables')
    def index():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public';
    """)
        tables = cur.fetchall()
        cur.close()
        conn.close()
        return tables


if __name__ == '__main__':
    app.run(debug=True)
