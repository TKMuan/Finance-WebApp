from contextlib import contextmanager
from psycopg2.extensions import connection
import psycopg2
import os

def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )
    return conn

@contextmanager
def transaction(conn: connection):
    try: 
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise