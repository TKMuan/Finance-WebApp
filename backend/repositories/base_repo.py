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
import logging

logger = logging.getLogger(__name__)

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

    def sql_update(self, 
                   updates: dict[str, Any], 
                   key_column: str = 'id',
                   key_column_value: str = "",
                   where_conditions: dict[str, Any] = None,
                   null_conditions: list[str] = None
                   ) -> sql.SQL:

        set_clause = sql.SQL(', ').join(
            sql.SQL("{} = %s").format(sql.Identifier(k)) for k in updates
        )

        where_clauses = []
        params = []
        params.extend(updates.values())
        logger.debug(f"where conditions: {where_conditions}\n\n") 

        if null_conditions:
            where_clauses.extend(
                sql.SQL("{} is NULL").format(sql.Identifier(col)) for col in null_conditions
            )

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

        update_query = sql.SQL("UPDATE {table} SET {set_clause} WHERE ").format(
            table=sql.Identifier(self._get_table()),
            set_clause=set_clause,
        )
        query = sql.SQL(" ").join([update_query, where_clause])

        return query, params

    def sql_delete(self, where_conditions: dict[str, Any], null_conditions: list[str] = None):
        where_clauses = []
        params = []
        logger.debug(f"Recieved where conditions: {where_conditions}")
        where_clauses.extend(
            sql.SQL("{} = %s").format(sql.Identifier(col)) for col in where_conditions
        )
        if null_conditions:
            where_clauses.extend(
                sql.SQL("{} is NULL").format(sql.Identifier(col)) for col in null_conditions
            )
        logger.debug(f"where clauses: {where_clauses}")
        where_clause = sql.SQL(" AND ").join(where_clauses)
        params.extend(where_conditions.values())

        from_clause = sql.SQL("DELETE FROM {table}").format(
            table=sql.Identifier(self._get_table())
        )

        query = sql.SQL(" ").join([from_clause, sql.SQL(" WHERE {where}").format(
            where=where_clause)])

        return query, params

    def sql_select(self, columns: list[str] | None = None, 
                where_conditions: dict[str, Any] | None = None,
                like_condition: dict[str, Any] = None,
                null_conditions: list[str] = None,
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
        logger.debug(f"where conditions: {where_conditions}\n\n") 

        if null_conditions:
            where_clauses.extend(
                sql.SQL("{} is NULL").format(sql.Identifier(col)) for col in null_conditions
            )
        
        if like_condition:
            where_clauses.extend(
                sql.SQL("{} LIKE %s").format(sql.Identifier(col)) for col in like_condition
            )
            params.extend([f"%{val}%" for val in like_condition.values()] )
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

        logger.debug(f"Query: {query.as_string(conn)}")
        logger.debug(f"Values: {values}")
        with conn.cursor() as curr:
            curr.execute(query, values)
            result = curr.rowcount
        
        return result

    def update(self, conn: connection, model: BaseModel, key_column: str = 'id') -> None:
        """Generic UPDATE."""
        
        updates = {col: getattr(model, col) for col in self._get_columns() if col != key_column} 
        query = self.sql_update(updates, key_column)
        
        with conn.cursor() as cur:
            cur.execute(query, list[updates.values()] + [getattr(model, key_column)])
    
    def get_by_id(self, conn: connection, model_cls: Type['BaseModel'], id: str, columns: list[str] = None) -> Optional[BaseModel]:
        """Generic SELECT by ID."""
        table = model_cls.table

        if columns is None:
            select_fields = sql.SQL('*')
        else:
            select_fields = sql.SQL(', ').join(map(sql.Identifier, columns))

        logger.debug("GENERATING QUERY")
        query = sql.SQL("SELECT {select_fields} FROM {table} WHERE {id} = %s").format(
            select_fields=select_fields,
            table=sql.Identifier(table),
            id=sql.Identifier("id")
        )

        logger.debug("Retrieving by id") 
        logger.debug(f"Query: {query.as_string(conn)}")

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, (id,))
            row = cur.fetchone()
            logger.debug(f"Retrieved details: {row}")
            if row:
                return model_cls(**row)
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
