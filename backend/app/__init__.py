from flask import Flask, jsonify, request
from flask_jwt_extended import jwt_required
from .config import DevelopmentConfig
from .extensions import jwt, cors
from routes import (
    auth_routes,
    method_routes,
    MethodBluePrint,
    UserGroupingBlueprint,
    TransactionsBlueprint
)
from services import (
    AccountService,
    MethodsService,
    UserGroupingService,
    TransactionsService
)
from repositories import (
    AccountRepo,
    MethodsRepo,
    UserGroupRepo,
    TransactionsRepo,
    TransactionsGroupRepo
)

from db import get_db_connection
from app.logger import setup_logging
import logging

def create_app(config_class=DevelopmentConfig):

    setup_logging() 

    logger = logging.getLogger(__name__)
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Init extensions
    jwt.init_app(app)
    cors.init_app(
        app, 
        supports_credentials=True,
        origins=['https://financewebapp-zwfz.onrender.com'],
    )
    
    # Register services as app attributes
    db_conn = get_db_connection

    account_repo = AccountRepo()
    methodsRepo = MethodsRepo()
    groupsRepo = UserGroupRepo()
    transactionsRepo = TransactionsRepo()
    transactionsGroupRepo = TransactionsGroupRepo()

    app.AccountService = AccountService(account_repo)
    app.MethodService = MethodsService(methodsRepo)
    app.GroupsService = UserGroupingService(groupsRepo)
    app.TransactionService = TransactionsService(transactionsRepo, transactionsGroupRepo)


    app.db_conn = db_conn

    # Register blueprints
    app.register_blueprint(auth_routes.auth)
    app.register_blueprint(MethodBluePrint)
    app.register_blueprint(UserGroupingBlueprint)
    app.register_blueprint(TransactionsBlueprint)

    """
    app.register_blueprint(account)
    app.register_blueprint(ugroupings)
    app.register_blueprint(tgroupings)
    app.register_blueprint(transactions)
    """
    
    # Global request handlers
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            response = jsonify()
            response.status_code = 200
            response.headers.add("Access-Control-Allow-Origin", "https://financewebapp-zwfz.onrender.com")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
            response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response
    
    # Debug route (move to blueprint later)
    @jwt_required()
    @app.route('/debug/tables')
    def debug_tables():
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT tablename
                FROM pg_tables
                WHERE schemaname = 'public';
            """)
            tables = [row[0] for row in cur.fetchall()]
            return jsonify(tables)
        finally:
            cur.close()
            conn.close()
    
    return app
