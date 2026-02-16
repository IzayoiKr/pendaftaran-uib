#!/bin/bash
set -e
echo "Running database migrations..."
migrate -path migrations -d "postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=$DB_SSLMODE" up
echo "Starting server..."
exec ./server

