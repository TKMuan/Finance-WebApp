from errors import (
    ExtraFieldError,
    MissingFieldError,
    MissingDocumentID
)
from errors import (
    MissingModifyingUser,
    UnauthorizedAccess
)
from dataclasses import (
    dataclass
)
from typing import (
    ClassVar,
    Type,
    Any
)

@dataclass
class Document:
    table: ClassVar[str] = ""
    required_fields: ClassVar[set[str]] = set()
    optional_fields: ClassVar[set[str]] = set()
    columns: ClassVar[tuple[str]] = () 

    @classmethod
    def allowed_fields(cls: Type['Document']) -> set:
        return cls.required_fields.union(cls.optional_fields)

    @classmethod
    def check_extra_fields(cls: Type['Document'], data: dict[str, Any], allowed_fields: set[str] = None) -> None:
        if allowed_fields is None:
            allowed_fields = cls.allowed_fields()
        fields = set(data.keys()) - allowed_fields
        if fields:
            raise ExtraFieldError(fields=fields)

    @classmethod
    def check_required_fields(cls: Type['Document'], data: dict[str, Any], required_fields: set[str] = None) -> None:
        if not required_fields:
            required_fields = cls.required_fields
        missing_fields = required_fields - set(data.keys())
        if missing_fields:
            raise MissingFieldError(fields=missing_fields)

    """"
    @staticmethod
    def primary_key_exists(conn: connection, table, key_column, key_value):
        query = sql.SQL("SELECT EXISTS(SELECT 1 FROM {table} WHERE {key_column} = %s)").format(
            table=sql.Identifier(table),
            key_column=sql.Identifier(key_column)
        )
        with conn.cursor() as cur:
            cur.execute(query, (key_value,))
            exists = cur.fetchone()[0]
        if not exists:
            raise MissingDocumentID(f"Document with id {key_value} does not exist on table {table}")
        return True

    @staticmethod
    def validate_modifying_user(conn: connection, modifying_user: str):
        if not Document.primary_key_exists(conn, 'account', 'id', modifying_user):
            raise MissingModifyingUser(f"Modifying user with id {modifying_user} does not exist.")


    @classmethod
    def sql_insert(cls, data: dict) -> sql.SQL:
        insert_columns = [col for col in cls.columns if col in data]
        columns = sql.SQL(', ').join(map(sql.Identifier, insert_columns))
        placeholders = sql.SQL(', ').join(sql.Placeholder() * len(data))
        query = sql.SQL("INSERT INTO {table} ({columns}) VALUES ({placeholders})").format(
            table=sql.Identifier(cls.table),
            columns=columns,
            placeholders=placeholders
        )
        return query

    @classmethod
    def sql_update(cls, updates: dict, key_column: dict) -> sql.SQL:
        set_clause = sql.SQL(', ').join(
            sql.SQL("{} = %s").format(sql.Identifier(k)) for k in updates.keys()
        )
        where_clause = sql.SQL(" AND ").join(
            sql.SQL("{} = %s").format(sql.Identifier(k)) for k in key_column.keys()
        )
        query = sql.SQL("UPDATE {table} SET {set_clause} WHERE {where_clause}").format(
            table=sql.Identifier(cls.table),
            set_clause=set_clause,
            where_clause=where_clause
        )
        return query

    @classmethod
    def sql_select(cls, key_column: dict = None, req_fields: set = None):
        if req_fields is None:
            fields = sql.SQL("*") 
        else:
            fields = sql.SQL(",").join(sql.Identifier(k) for k in req_fields)
        
        if key_column is None:
            query = sql.SQL("SELECT {fields} FROM {table}").format(
                fields=fields,
                table=sql.Identifier(cls.table),
            )
        else: 
            where_clause = sql.SQL(" AND ").join(
                sql.SQL("{} = %s").format(sql.Identifier(k)) for k in key_column.keys()
            )
            query = sql.SQL("SELECT {fields} FROM {table} WHERE {where_clause}").format(
                fields=fields,
                table=sql.Identifier(cls.table),
                where_clause=where_clause 
            )
        return query

    def validate_authorization(self, conn, user_id: str):
        if not Document.primary_key_exists(conn, 'account', 'id', user_id) or self.accountID != user_id:
            raise UnauthorizedAccess(f"User with id {user_id} is not authorized.")


    def create_id(self):
        self.id = generate_sha256_hash(str(self.created) + self.modified_by)
    
    def insert(self, conn: connection):
        try:
            self.created = datetime.now(timezone.utc)
            self.modified = self.created
            Document.validate_modifying_user(conn, self.modified_by)

            self.create_id()

            current_data = self.to_dict()
            print("current data: ",current_data)
            values = list(current_data.values())
            query = self.__class__.sql_insert(current_data)

            print('query: ', query.as_string(conn))
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
                set_clause=sql.Literal(set_clause),
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
"""