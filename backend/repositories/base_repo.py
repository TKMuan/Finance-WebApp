# repositories/base_repo.py
from psycopg2.extensions import (
    connection,
)
from psycopg2.extras import (
    RealDictCursor
)
from psycopg2 import (
    sql
)
import hashlib
from abc import (
    ABC, 
    abstractmethod
)
from typing import (
    Type, 
    Dict, 
    Any, 
    Optional, 
    List
)
from models import (
    BaseModel
)
from errors import (
    MissingDocumentID
)

class BaseRepo(ABC):

    @abstractmethod
    def _get_table(self) -> str:
        """Model-specific table name."""
        raise NotImplementedError
    
    @abstractmethod
    def _get_columns(self) -> tuple:
        """Model-specific columns."""
        raise NotImplementedError

    def sql_insert(self, columns: list[str]) -> sql.SQL:

        columns_sql = sql.SQL(', ').join(map(sql.Identifier, columns))
        placeholders = sql.SQL(', ').join(sql.Placeholder() * len(columns))

        query = sql.SQL("INSERT INTO {table} ({columns}) VALUES ({placeholders})").format(
            table=sql.Identifier(self._get_table()),
            columns=columns_sql,
            placeholders=placeholders
        )
        return query

    def sql_update(self, updates: dict[str, Any], key_column: str = 'id') -> sql.SQL:

        set_clause = sql.SQL(', ').join(
            sql.SQL("{} = %s").format(sql.Identifier(k)) for k in updates
        )
        where_clause = sql.SQL("{} = %s").format(sql.Identifier(key_column))

        query = sql.SQL("UPDATE {table} SET {set_clause} WHERE {where_clause}").format(
            table=sql.Identifier(self._get_table()),
            set_clause=set_clause,
            where_clause=where_clause
        )
        return query

    def sql_select(self, columns: list[str] | None = None, 
                where_conditions: dict[str, Any] | None = None,
                key_column: str = 'id',
                key_column_value: str = None,
                limit: int | None = None,
                offset: int | None = None) -> tuple[sql.SQL, list[str]]:
        """Build safe SELECT query with pagination."""
        # SELECT clause
        if columns is None:
            select_fields = sql.SQL('*')
        else:
            select_fields = sql.SQL(', ').join(map(sql.Identifier, columns))
        
        # FROM clause
        from_clause = sql.SQL("FROM {table}").format(
            table=sql.Identifier(self._get_table())
        )
        
        # WHERE clause
        where_clauses = []
        params = []
        
        if where_conditions:
            where_clauses.extend(
                sql.SQL("{} = %s").format(sql.Identifier(col)) for col in where_conditions
            )
            params.extend(where_conditions.values())
        
        elif key_column:
            where_clauses.append(sql.SQL("{} = %s").format(sql.Identifier(key_column)))
            params.append(key_column_value)  # Passed separately
        
        if where_clauses:
            where_clause = sql.SQL(" AND ").join(where_clauses)
        else:
            where_clause = None
        
        # Build base query
        query_parts = [sql.SQL("SELECT {fields} {from_clause}").format(
            fields=select_fields,
            from_clause=from_clause
        )]
        query_params = [select_fields, from_clause]
        
        if where_clause:
            query_parts.append(sql.SQL("WHERE {where_clause}").format(
                where_clause=where_clause
            ))
            query_params.append(where_clause)
        
        # Add pagination
        if limit is not None:
            query_parts.append(sql.SQL("LIMIT %s"))
            params.append(limit)
        
        if offset is not None:
            query_parts.append(sql.SQL("OFFSET %s"))
            params.append(offset)
        query = sql.SQL(" ").join(query_parts)

        return query, params 

    def insert(self, conn: connection, model: BaseModel, columns: Optional[list[str]] = None) -> None:
        """Generic INSERT for any model."""
        if columns is None:
            columns = list(self._get_columns())

        values = [getattr(model, col) for col in columns]
        query = self.sql_insert(columns)

        with conn.cursor() as curr:
            curr.execute(query, values)

    def update(self, conn: connection, model: BaseModel, key_column: str = 'id') -> None:
        """Generic UPDATE."""
        
        updates = {col: getattr(model, col) for col in self._get_columns() if col != key_column} 
        query = self.sql_update(updates, key_column)
        
        with conn.cursor() as cur:
            cur.execute(query, list[updates.values()] + [getattr(model, key_column)])
    
    def get_by_id(self, conn: connection, model_cls: Type['BaseModel'], id: str) -> Optional[BaseModel]:
        """Generic SELECT by ID."""
        table = model_cls.table
        columns = model_cls.columns
        
        query = f"SELECT {', '.join(columns)} FROM {table} WHERE id = %s"
        with conn.cursor() as cur:
            cur.execute(query, (id,))
            row = cur.fetchone()
            if row:
                return model_cls(*row)
            return None

    def record_exists(self, conn: connection, record_id: str):

        query = sql.SQL("SELECT EXISTS(SELECT 1 FROM {table} WHERE id = %s)").format(
                table=sql.Identifier(self._get_table())
                )

        with conn.cursor() as cur:
            cur.execute(query, (record_id, ))
            result = cur.fetchone()

        if not result:
            raise MissingDocumentID("Record with given id does not exist")
        
        return bool(result)
