from .base_repo import (
    BaseRepo
)
from models import (
    Transactions,
    TransactionGroups
)
from psycopg2.extensions import (
    connection,
)
from psycopg2 import (
    sql
)
from psycopg2.extras import (
    RealDictCursor
)
from typing import (
    Any
)
from datetime import (
    datetime
)

import logging

logger = logging.getLogger(__name__)

class TransactionsRepo(BaseRepo):
    def _get_table(self):
        return Transactions.table
    
    def _get_columns(self):
        return Transactions.columns
    
    def _get_required_fields(self):
        return Transactions.required_fields
    
    def _get_optional_fields(self):
        return Transactions.optional_fields

    def update_transactions(self, trans: connection, data: dict[str, Any]):
        transID = data.pop("id")
        query, params = self.sql_update(data, key_column='id', key_column_value=transID)

        logger.debug(f"query: {query.as_string(trans)}")
        logger.debug(f"params: {params}")

        with trans.cursor() as cursor:
            cursor.execute(query, params)
            res = cursor.rowcount

        return res
    
    def delete_transactions(self, trans: connection, transID: str):

        query, params = self.sql_delete(where_conditions={"transactionID": transID})

        with trans.cursor() as cursor:
            cursor.execute(query, params)
            res = cursor.rowcount
        
        return res
    
    def get_user_transaction(self, conn: connection, accountID: str, transID: str):

        params = []
        """
        SELECT trans.id, trans.description, trans.transaction_time, trans.accountID, trans.amount, trans.type, trans.method, methods.id, methods.name
        FROM "transactions" LEFT JOIN "userMethods" 
        on trans.accountID = methods.accountID """
        select_query = sql.SQL("""
            SELECT {trans}.{id}, {trans}.{desc}, {trans}.{ttime}, {trans}.{aid}, {trans}.{amount}, {trans}.{type}, {trans}.{method}, {methods}.{name}
            FROM {trans} LEFT JOIN {methods} 
            ON {trans}.{aid} = {methods}.{aid} 
            WHERE"""
        ).format(
            trans=sql.Identifier("transactions"),
            id=sql.Identifier("id"),
            desc=sql.Identifier("description"),
            ttime=sql.Identifier("transaction_time"),
            aid=sql.Identifier("accountID"),
            type=sql.Identifier("type"),
            method=sql.Identifier("method"),
            methods=sql.Identifier("userMethods"),
            name=sql.Identifier("name"),
            amount=sql.Identifier('amount'),
        )
        where_query = sql.SQL(" AND ").join([
            sql.SQL("{trans}.{cond} = %s").format(trans=sql.Identifier("transactions"),cond=sql.Identifier("accountID")),
            sql.SQL("{trans}.{cond} = %s").format(trans=sql.Identifier("transactions"), cond=sql.Identifier("id"))
        ])
        params = [accountID, transID]
        query = sql.SQL(" ").join([select_query, where_query])

        logger.debug(f"query: {query.as_string(conn)}")
        logger.debug(f"params: {params}")
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            res = dict(cursor.fetchone())
        
        logger.debug(f"result: {res}") 
        return res
    
    def get_all_user_transactions(
            self, 
            conn:connection,
            columns: list[list[str]] = None, 
            accountID: str = None,
            from_date: datetime = None,
            to_date: datetime = None,
            desc: str = None,
            from_amount: int = None,
            to_amount: int = None,
            tType: str = bool,
            method: str = None,
            group: list[str] = None,
            page: int = 1,
            limit: int = 20
            ):

        where_clause = [
            sql.SQL("{trans}.{accountID} = %s").format(
                trans=sql.Identifier("transactions"),
                accountID=sql.Identifier("accountID")
            )
            ]
        params = [accountID]

        if from_date:
            where_clause.append(
                sql.SQL("{trans}.{tTime} >= %s").format(
                    trans=sql.Identifier("transactions"),
                    tTime=sql.Identifier("transaction_time")
                )
                )
            params.append(from_date)
        if to_date:
            where_clause.append(
                sql.SQL("{trans}.{tTime} <= %s").format(
                    trans=sql.Identifier("transactions"),
                    tTime=sql.Identifier("transaction_time")
                )
                )
            params.append(to_date)
        if from_amount:
            where_clause.append(
                sql.SQL("{trans}.{amt} >= %s::money").format(
                    trans=sql.Identifier("transactions"),
                    amt=sql.Identifier("amount")
                )
                )
            params.append(from_amount)
        if to_amount:
            where_clause.append(
                sql.SQL("{trans}.{amt} <= %s::money").format(
                    trans=sql.Identifier("transactions"),
                    amt=sql.Identifier("amount")
                )
                )
            params.append(to_amount)

        if tType is not None:
            where_clause.append(
                sql.SQL("{trans}.{type} = %s").format(
                    trans=sql.Identifier("transactions"),
                    type=sql.Identifier("type")
                )
                )
            params.append(tType)

        if desc:
            where_clause.append(
                sql.SQL("{trans}.{desc} LIKE %s").format(
                    trans=sql.Identifier("transactions"),
                    desc=sql.Identifier("description")
                )
                )
            params.append(f"%{desc}%")


        if method is not None:
            where_clause.append(
                sql.SQL("{trans}.{method} >= %s").format(
                    trans=sql.Identifier("transactions"),
                    method=sql.Identifier("method")
                )
                )
            params.append(method)
        if group:
            sub_query = sql.SQL("""
                SELECT {tid} 
                FROM {tgroup} 
                WHERE {gid} = ANY(%s)
            """).format(
                tid=sql.Identifier("transactionID"),
                tgroup=sql.Identifier("transactionGroups"),
                gid=sql.Identifier("groupID")
            ) 
            where_clause.append(
                sql.SQL("{trans}.{id} = ANY({sub_query})").format(
                    trans=sql.Identifier("transactions"),
                    id=sql.Identifier("id"),
                    sub_query=sub_query
                )
            )
            params.append(group)

        if columns: 
            select_columns = sql.SQL(", ").join([
                sql.SQL("{table}.{col}").format(table=table, col=col) for table, col in columns
            ])
        else: 
            select_columns = sql.SQL("{trans}.*, {method}.{id} as {mid}, {method}.{name} as {mname}").format(
                trans=sql.Identifier("transactions"),
                method=sql.Identifier("userMethods"),
                id=sql.Identifier("id"),
                name=sql.Identifier("name"),
                mname=sql.Identifier("methodName"),
                mid=sql.Identifier("methodID")
            )

        select_query = sql.SQL("""
            SELECT {col_query}
            FROM {trans}
            LEFT JOIN {methods} 
            ON {trans}.{method} = {methods}.{id} 
            WHERE"""
        ).format(
            col_query=select_columns,
            trans=sql.Identifier("transactions"),
            methods=sql.Identifier("userMethods"),
            method=sql.Identifier("method"),
            id=sql.Identifier('id')
        )

        where_query = sql.SQL(" AND ").join(
            where_clause
        )
        query = sql.SQL(" ").join([
            select_query,
            where_query,
            sql.SQL("LIMIT %s"),
            sql.SQL("OFFSET %s"),
        ])
        params.extend([limit, page * limit])

        logger.debug(f"query: {query.as_string(conn)}")
        logger.debug(f"params: {params}")

        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            res = cursor.fetchall()
        
        return res

class TransactionsGroupRepo(BaseRepo):
    def _get_table(self):
        return TransactionGroups.table
    
    def _get_columns(self):
        return TransactionGroups.columns
    
    def _get_required_fields(self):
        return TransactionGroups.required_fields
    
    def _get_optional_fields(self):
        return TransactionGroups.optional_fields
    
    def update_transaction_group(self, trans: connection, transID: str, groupID: str, newGroupID: str):
        updates = {'transactionID': transID, "groupID": newGroupID}
        query, params = self.sql_update(updates=updates, where_conditions={'transactionID': transID, "groupID": groupID})

        logger.debug(f"query: {query.as_string(trans)}")
        logger.debug(f"params: {params}")
    
    def delete_transaction_group(self, trans: connection, where_conditions: dict[str, Any]):
        query, params = self.sql_delete(where_conditions=where_conditions)

        logger.debug(f"query: {query.as_string(trans)}")
        logger.debug(f"params: {params}")

        with trans.cursor() as cursor:
            cursor.execute(query, params)
            res = cursor.rowcount

        return res
    
    def get_transaction_group(self, conn: connection, where_conditions: dict[str, Any]):
        params = []
        select_query = sql.SQL("""
            SELECT {userG}.{id}, {userG}.{name} 
            FROM {transG} LEFT JOIN {userG}
            ON {transG}.{gid} = {userG}.{id}
            WHERE""").format(
                userG=sql.Identifier("userGroupings"),
                id=sql.Identifier("id"),
                name=sql.Identifier("name"),
                transG=sql.Identifier("transactionGroups"),
                gid=sql.Identifier("groupID"),
            )
        
        transID = where_conditions.pop("transactionID")

        where_clause = [
            sql.SQL("{table}.{col} = %s").format(
                table=sql.Identifier("transactionGroups"),
                col=sql.Identifier("transactionID")),
        ]
        params.extend([transID])

        if where_conditions:
            where_clause.extend([sql.SQL("{} = %s").format(sql.Identifier(col)) for col in where_conditions])
            params.extend(where_conditions.values())

        where_query = sql.SQL(" AND ").join(where_clause)

        query = sql.SQL(" ").join([select_query, where_query]) 

        logger.debug(f"query: {query.as_string(conn)}")
        logger.debug(f"params: {params}")

        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            res = cursor.fetchall()
        
        return res

