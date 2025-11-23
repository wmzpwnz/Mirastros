#!/bin/bash

# Complete setup script for Mirastros Backend on VPS
# Run this on 31.130.145.75 (mirastros.com)

set -e

echo "🌟 Mirastros Backend Complete Setup"
echo "===================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "⚠️  Please do not run as root. Run as mirastros user."
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
echo "🐍 Installing Python 3.11..."
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install system dependencies
echo "📦 Installing system dependencies..."
sudo apt install -y build-essential git curl wget

# Setup PostgreSQL with pgvector
echo ""
echo "🗄️  Setting up PostgreSQL with pgvector..."
bash setup_postgresql.sh

# Setup Redis
echo ""
echo "🔴 Setting up Redis..."
bash setup_redis.sh

# Setup Ollama and Qwen model
echo ""
echo "🤖 Setting up Ollama and Qwen 2.5 model..."
bash setup_ollama.sh

# Create Python virtual environment
echo ""
echo "🐍 Creating Python virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration!"
fi

# Run database migrations
echo ""
echo "🔄 Running database migrations..."
bash run_migrations.sh

# Create systemd service
echo ""
echo "⚙️  Creating systemd service..."
sudo cp mirastros-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mirastros-backend
sudo systemctl start mirastros-backend

echo ""
echo "✅ Mirastros Backend setup complete!"
echo ""
echo "Services status:"
echo "  PostgreSQL: $(sudo systemctl is-active postgresql)"
echo "  Redis:      $(sudo systemctl is-active redis-server)"
echo "  Ollama:     $(sudo systemctl is-active ollama)"
echo "  Backend:    $(sudo systemctl is-active mirastros-backend)"
echo ""
echo "Next steps:"
echo "  1. Update .env file with production credentials"
echo "  2. Configure Nginx reverse proxy"
echo "  3. Setup SSL with Certbot"
echo "  4. Test API: curl http://localhost:8000/health"
echo ""
echo "Useful commands:"
echo "  Check backend logs:  sudo journalctl -u mirastros-backend -f"
echo "  Restart backend:     sudo systemctl restart mirastros-backend"
echo "  Test Ollama:         ollama run mirastros-ai"
