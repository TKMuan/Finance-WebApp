#!/bin/bash
set -a
source .env
set +a

psql -U $DB_USER -d $DB_NAME -h $DB_HOST -W