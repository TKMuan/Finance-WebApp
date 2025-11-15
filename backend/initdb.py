import argparse
import psycopg2
import os
from dotenv import load_dotenv


def create_tables(conn, r):
    with conn.cursor() as cur:
        if r:
            file = open('droptables.sql', 'r')
            sql = file.read()
            file.close()
            cur.execute(sql)
        file = open('finance-db.sql', 'r')
        sql = file.read()
        file.close()
        cur.execute(sql)
        conn.commit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="python script to initialize the database")

    parser.add_argument('-r', action='store_true', help="Recreate the database tables by deleting")

    args = parser.parse_args()
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    
    with psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME").lower(),
        user=os.getenv("DB_USER").lower(),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    ) as conn:
        create_tables(conn, args.r)