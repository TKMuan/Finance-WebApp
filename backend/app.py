from flask import Flask, render_template, request, redirect, url_for
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME").lower(),
        user=os.getenv("DB_USER").lower(),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )
    return conn

@app.route('/')
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
