#!/bin/bash

# Run Alembic migrations for Mirastros backend

set -e

echo "🔄 Running database migrations..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run migrations
alembic upgrade head

echo "✅ Migrations complete!"
