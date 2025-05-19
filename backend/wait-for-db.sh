#!/bin/sh
# Wait for PostgreSQL
until pg_isready -h db -p 5432 -U admin; do
  echo "Waiting for database connection..."
  sleep 2
done

# Run migrations
alembic upgrade head

# Start application
exec "$@"