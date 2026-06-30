#!/bin/bash
# Generate initial TypeORM migration from the current database schema
# Run after: docker compose up -d && npm run build
cd "$(dirname "$0")/.."
npm run migration:generate -- src/migrations/InitialSchema
echo "Migration generated in src/migrations/"
