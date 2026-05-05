import argparse
import psycopg2
import os
from dotenv import load_dotenv
from src.models import generate_sha256_hash, datetime, timezone, sql


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
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    ) as conn:
        try: 
            create_tables(conn, args.r)
            if args.r:
                created = datetime.now(timezone.utc) 
                admin_id = generate_sha256_hash(str(created) + "admin" + "user")
                hashed_password = generate_sha256_hash("adminpassword")
                with conn.cursor() as cur:
                    truncate_query = sql.SQL("TRUNCATE TABLE {} CASCADE;").format(
                        sql.SQL(', ').join([sql.Identifier('account'), sql.Identifier('user_info')])
                        )

                    cur.execute(truncate_query)

                    conn.commit()
                    account_insert_query = sql.SQL("""
                            INSERT INTO account (id, email, password, fname, lname, created, modified, modified_by)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                        """)

                    cur.execute(account_insert_query, (admin_id, 'admin@example.com', hashed_password, 'Admin', 'User', created, created, admin_id))

                    conn.commit()
        except Exception as _:
            conn.rollback()
            raise