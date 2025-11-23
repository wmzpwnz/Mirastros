#!/bin/bash

# Mirastros Backend Setup Script for VPS
# Run as: sudo bash setup_backend.sh

set -e

echo "🚀 Setting up Mirastros Backend on VPS..."

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install PostgreSQL
echo "🐘 Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

# Install Redis
echo "📮 Installing Redis..."
apt-get install -y redis-server

# Install Python dependencies
echo "🐍 Installing Python build dependencies..."
apt-get install -y python3-pip python3-venv python3-dev build-essential libpq-dev

# Create database and user
echo "💾 Setting up PostgreSQL database..."
sudo -u postgres psql << EOF
CREATE DATABASE mirastros;
CREATE USER mirastros WITH PASSWORD 'mirastros';
GRANT ALL PRIVILEGES ON DATABASE mirastros TO mirastros;
ALTER USER mirastros WITH SUPERUSER;
EOF

# Enable pgvector extension
echo "🔌 Installing pgvector..."
sudo -u postgres psql -d mirastros -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Create models directory
echo "📁 Creating models directory..."
mkdir -p /home/mirastros/models
chown -R mirastros:mirastros /home/mirastros/models

# Install Python packages in virtual environment
echo "📦 Setting up Python virtual environment..."
cd /home/mirastros/www/mirastros-universal/apps/backend
sudo -u mirastros python3 -m venv venv
sudo -u mirastros venv/bin/pip install --upgrade pip
sudo -u mirastros venv/bin/pip install -r requirements.txt

# Copy environment file
echo "⚙️ Setting up environment variables..."
sudo -u mirastros cp .env.example .env

# Run database migrations
echo "🗄️ Running database migrations..."
sudo -u mirastros venv/bin/alembic upgrade head

echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Download Qwen 2.5 model to /home/mirastros/models/"
echo "2. Update .env file with correct MODEL_PATH"
echo "3. Start the backend with: systemctl start mirastros-backend"
