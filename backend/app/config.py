import os
from dotenv import load_dotenv
from datetime import timedelta
load_dotenv()

class Config:
    SECRET_KEY=os.getenv('SECRET_KEY')
    JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000)))
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_SECURE = os.getenv('JWT_COOKIE_SECURE', 'False').lower() == 'true'
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_COOKIE_CSRF_PROTECT = os.getenv('JWT_COOKIE_CSRF_PROTECT', 'False').lower() == 'true'
    CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False