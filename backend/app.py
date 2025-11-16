from flask import Flask, render_template, request, redirect, url_for
from src.blueprint import account
from src.db import get_db_connection
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.register_blueprint(account)


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
