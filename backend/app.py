import os
from flask import Flask, render_template, request, redirect, url_for
from flask_jwt_extended import JWTManager, jwt_required
from src.blueprints.account import account
from src.blueprints.auth import auth
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
        "origins": origins_list
    }
})
app.register_blueprint(account)
app.register_blueprint(auth)


app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900)))  # in seconds
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(seconds=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000)))  # in seconds

jwt = JWTManager(app)

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


# Routes for create, update, delete would similarly open connection, perform SQL queries, then close connection

if __name__ == '__main__':
    app.run(debug=True)
