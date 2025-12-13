from psycopg2.extensions import (
    connection
)
from models import (
    BaseModel,
    UserGroups
)
from enums import (
    ErrorCodes
)
from errors import (
    ValidationError,
    MissingChildValue
)

def create_grouping(conn: connection, data: dict):
    children = data.pop('children', [])

    if not children:
        raise MissingChildValue("Parent Grouping needs to have at least one child")

    UserGroups.check_required_fields(data, UserGroups.required_fields - {"id"})
    UserGroups.check_extra_fields(data, UserGroups.allowed_fields())

    new_group = UserGroups(**data)
    UserGroups.validate_parent_group(conn, new_group.parent)
    new_group.create_id()            

    new_group.insert(conn)
    for child in children:
        child['parent'] = new_group.id
        child['accountID'] = new_group.accountID
        child['modified_by'] = new_group.modified_by
        child_obj = UserGroups(**child) 
        child_obj.insert(conn)
        child_obj.save(conn)

    return new_group.to_dict()



def get_user_groups(conn: connection, account_id: str, page_size=10, page_number=1):
    try:
        offset = (page_number - 1) * page_size
        query = sql.SQL("""
            SELECT p.id, p.name,
                COALESCE(
                    array_agg(json_build_object('id', c.id, 'name', c.name)) FILTER (WHERE c.id IS NOT NULL),
                    '{{}}'
                    ) AS children
            FROM {table_p} p
            LEFT JOIN {table_c} c ON c.parent = p.id
            WHERE p."accountID" = %s AND p.parent is null
            GROUP BY p.id, p.name
            LIMIT %s OFFSET %s;
        """).format(
            table_p=sql.Identifier(UserGroups.table),
            table_c=sql.Identifier(UserGroups.table)
        )
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute(query, (account_id, page_size + 1, offset))
            rows = cur.fetchall()

        result = {
            'data': rows[:page_size],
            'page': page_number,
            'nextPage': len(rows) > page_size,
            'pageSize': page_size
        }
        return APIResponse.success(code=SuccessCodes.GROUPINGS.RETRIEVED, data=result, message="Successfully retrieved user groups")
    except Exception as e:
        return APIResponse.error(code=ErrorCodes.BASE.ERROR, message=str(e))


def get_parent_groups(conn: connection, account_id: str):
    try:
        query = sql.SQL("SELECT id, name FROM {table} WHERE parent is null AND \"accountID\" = %s").format(
            table=sql.Identifier(UserGroups.table)
        )
        print("query: ", query.as_string(conn))
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute(query, (account_id, ))
            rows = cur.fetchall()
            print("rows: ", rows)

            return APIResponse.success(code=SuccessCodes.BASE.SUCCESS, data=rows) 

    except Exception as e:
        return APIResponse.error(code=ErrorCodes.BASE.ERROR, message=str(e))


def get_children(conn: connection, parent_id):
    try:
        key_column = {"parent": parent_id}
        fields = {"id", "name"}
        query = UserGroups.sql_select(key_column=key_column, req_fields=fields)
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute(query, (parent_id, ))
            rows = cur.fetchall()
        return APIResponse.success(code=SuccessCodes.BASE.SUCCESS, data=rows) 
    except Exception as e:
        return APIResponse.error(code=ErrorCodes.BASE.ERROR, message=str(e))
