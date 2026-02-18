#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"; do
    sleep 2
done

echo "Running database migrations..."
migrate -path /root/migrations -database "postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=$DB_SSLMODE" up
echo "Starting server..."
exec "$@"

