import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logging():
    os.makedirs('logs', exist_ok=True)
    
    # Root logger
    root = logging.getLogger()
    log_level = getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper(), logging.INFO)

    root.setLevel(log_level)  # Accept all levels
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Console: INFO+ only
    console = logging.StreamHandler()
    console.setLevel(log_level)
    console.setFormatter(formatter)
    root.addHandler(console)
    
    # File: DEBUG+ with rotation
    file_handler = RotatingFileHandler(
        'logs/app.log', maxBytes=10**6, backupCount=5, delay=True
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    #root.addHandler(file_handler)
    
    # Optional: Errors-only file
    error_handler = RotatingFileHandler(
        'logs/errors.log', maxBytes=10**6, backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)
    root.addHandler(error_handler)
