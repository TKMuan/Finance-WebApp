from contextlib import contextmanager
from psycopg2.extensions import connection

@contextmanager
def transaction(conn: connection):
    try: 
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise