#!/bin/bash

# Activate the virtual environment
source backend_env/bin/activate

# Run the Flask application
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
