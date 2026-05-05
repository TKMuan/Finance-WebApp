from typing import Protocol
from psycopg2.extensions import connection

class AccountServiceProtocol(Protocol):
    def login(self, conn: connection, email: str, password: str) -> dict: ...