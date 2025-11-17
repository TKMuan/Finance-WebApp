import os
from flask import Flask, render_template, request, redirect, url_for
from flask_jwt_extended import JWTManager, jwt_required
from src.blueprints.account import account
from src.blueprints.auth import auth
from src.db import get_db_connection
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

app = Flask(__name__)
app.register_blueprint(account)
app.register_blueprint(auth)


app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

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
