#!/bin/bash

# Setup PostgreSQL with pgvector for Mirastros
# Run this script on the VPS (31.130.145.75 / mirastros.com)

set -e

echo "🗄️  Setting up PostgreSQL with pgvector..."

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt update
sudo apt install -y postgresql postgresql-contrib postgresql-server-dev-all

# Install pgvector
echo "📦 Installing pgvector extension..."
cd /tmp
git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Start PostgreSQL
echo "🚀 Starting PostgreSQL service..."
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database and user
echo "👤 Creating database and user..."
sudo -u postgres psql <<EOF
-- Create user
CREATE USER mirastros WITH PASSWORD 'mirastros_secure_password_2024';

-- Create database
CREATE DATABASE mirastros OWNER mirastros;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mirastros TO mirastros;

-- Connect to database and enable pgvector
\c mirastros

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO mirastros;

EOF

echo "✅ PostgreSQL with pgvector setup complete!"
echo ""
echo "Database connection string:"
echo "postgresql+asyncpg://mirastros:mirastros_secure_password_2024@localhost:5432/mirastros"
echo ""
echo "⚠️  IMPORTANT: Update the password in production!"
echo "⚠️  Update DATABASE_URL in .env file"
