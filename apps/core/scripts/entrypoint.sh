#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  DB_DIR=$(dirname "$DATABASE_URL")
  mkdir -p "$DB_DIR"
  chown -R deno:deno "$DB_DIR"
fi

if [ "$1" = "migrate" ]; then
  echo "Running database migrations..."
  exec su deno -c "deno run --allow-all /usr/src/app/scripts/migrate.ts"
else
  echo "Starting server..."
  exec su deno -c "deno run --allow-all /usr/src/app/dist/index.js"
fi
