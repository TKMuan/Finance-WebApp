from datetime import datetime, timezone
from psycopg2 import sql 
from psycopg2.extensions import connection
import hashlib


def generate_sha256_hash(input_string):
    sha256_hash = hashlib.sha256()
    sha256_hash.update(input_string.encode('utf-8'))
    return sha256_hash.hexdigest()

class MissingModifyingUser(Exception):
    def __init__(self, message=None):
        if message is None:
            message = "Modifying user information is required."
        super().__init__(message)

class MissingDocumentID(Exception):
    def __init__(self, message=None):
        if message is None:
            message = "Valid Document ID is required."
        super().__init__(message)

class Document:
    created: datetime
    modified: datetime
    modified_by: str

    @staticmethod
    def primary_key_exists(conn, table, key_column, key_value):
        query = f"SELECT EXISTS(SELECT 1 FROM {table} WHERE {key_column} = %s)"
        with conn.cursor() as cur:
            cur.execute(query, (key_value,))
            exists = cur.fetchone()[0]
        return exists

    @staticmethod
    def validate_modifying_user(conn, modifying_user: str):
        if not Document.primary_key_exists(conn, 'account', 'id', modifying_user):
            raise MissingModifyingUser(f"Modifying user with id {modifying_user} does not exist.")

    def create_id(self):
        self.id = generate_sha256_hash(str(self.created) + self.modified_by)
    
    def insert(self, conn: connection, modifying_user: str):
        try:
            self.created = datetime.now(timezone.utc)
            self.modified = self.created
            Document.validate_modifying_user(conn, modifying_user)

            self.modified_by = modifying_user
            self.create_id()

            current_data = self.to_dict()
            columns = ', '.join(current_data.keys()) 
            placeholder = ', '.join(["%s"] * len(current_data))
            values = list(current_data.values())

            query = f"""INSERT INTO {self.table} ({columns}) VALUES ({placeholder})"""

            with conn.cursor() as cur:
                cur.execute(query, values)

        except Exception as _:
            conn.rollback()
            raise


    def update(self, conn: connection, updates: dict, key_column: str, key_value):
        try:
            if not updates:
                return  # nothing to update

            if not self.id:
                raise MissingDocumentID("Document ID is required for update.")

            if not Document.primary_key_exists(conn, self.table, key_column, key_value):
                raise MissingDocumentID(f"Document with {key_column}={key_value} does not exist in {self.table}.")
            
            Document.validate_modifying_user(conn, updates.get("modified_by", ""))

            # build SQL safe identifiers for columns
            set_clause = sql.SQL(', ').join(
                sql.SQL("{} = %s").format(sql.Identifier(k)) for k in updates.keys()
            )

            query = sql.SQL("UPDATE {table} SET {set_clause} WHERE {key_column} = %s").format(
                table=sql.Identifier(self.table),
                set_clause=set_clause,
                key_column=sql.Identifier(key_column),
            )

            values = list(updates.values())
            values.append(key_value)

            with conn.cursor() as cur:
                cur.execute(query, values)

        except Exception as _:
            conn.rollback()
            raise
    
    def save(self, conn: connection):
        conn.commit()


class Account(Document):
    table: str = 'account'
    id: str
    email: str
    password: str
    fname: str
    mname: str
    lname: str
    required_fields = {'email', 'password', 'fname', 'lname', 'modifying_user'}
    optional_fields = {'mname'}

    @staticmethod
    def from_dict(data: dict):
        account = Account()
        account.id = data.get("id", "")
        account.email = data.get("email", "")
        account.fname = data.get("fname", "")
        account.mname = data.get("mname", "")
        account.lname = data.get("lname", "")
        account.password = data.get("password", "")
        return account

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "password": self.password,
            "fname": self.fname,
            "mname": self.mname,
            "lname": self.lname,
            "created": self.created,
            "modified": self.modified,
            "modified_by": self.modified_by,
        }

class transaction(Document):
    id: str
    account_id: str
    amount: float
    description: str
    transaction_date: datetime
    type: bool

