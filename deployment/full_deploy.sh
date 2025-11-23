#!/bin/bash

# Mirastros Universal - Full Deployment Script
# Server: 109.196.100.104
# Domain: www.mirastros.com
# Password: hqpQDEoEB5_hnt

set -e  # Exit on error

echo "🚀 Starting Mirastros Universal Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Server details
SERVER_IP="109.196.100.104"
SERVER_USER="root"
SERVER_PASSWORD="hqpQDEoEB5_hnt"
DOMAIN="www.mirastros.com"
PROJECT_DIR="/home/mirastros/www/mirastros-universal"

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "  Server: $SERVER_IP"
echo "  Domain: $DOMAIN"
echo "  User: mirastros"
echo ""

# Function to run command on server
run_remote() {
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "$1"
}

# Function to copy file to server
copy_to_server() {
    sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no "$1" $SERVER_USER@$SERVER_IP:"$2"
}

echo -e "${GREEN}✓ Step 1: Checking server connection...${NC}"
if run_remote "echo 'Connected'"; then
    echo -e "${GREEN}  ✓ Server connection successful${NC}"
else
    echo -e "${RED}  ✗ Failed to connect to server${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Step 2: Installing system dependencies...${NC}"
run_remote "apt update && apt upgrade -y"
run_remote "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
run_remote "apt install -y nodejs python3 python3-pip python3-venv postgresql postgresql-contrib redis-server nginx certbot python3-certbot-nginx git sshpass"

echo ""
echo -e "${GREEN}✓ Step 3: Setting up Ollama...${NC}"
run_remote "curl -fsSL https://ollama.com/install.sh | sh"
run_remote "systemctl enable ollama"
run_remote "systemctl start ollama"

echo ""
echo -e "${GREEN}✓ Step 4: Creating mirastros user...${NC}"
run_remote "id -u mirastros &>/dev/null || useradd -m -s /bin/bash mirastros"
run_remote "mkdir -p /home/mirastros/www /home/mirastros/models /var/log/mirastros"
run_remote "chown -R mirastros:mirastros /home/mirastros /var/log/mirastros"

echo ""
echo -e "${GREEN}✓ Step 5: Setting up PostgreSQL database...${NC}"
run_remote "sudo -u postgres psql -tc \"SELECT 1 FROM pg_database WHERE datname = 'mirastros'\" | grep -q 1 || sudo -u postgres psql -c \"CREATE DATABASE mirastros;\""
run_remote "sudo -u postgres psql -tc \"SELECT 1 FROM pg_user WHERE usename = 'mirastros'\" | grep -q 1 || sudo -u postgres psql -c \"CREATE USER mirastros WITH PASSWORD 'mirastros_secure_2024';\""
run_remote "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE mirastros TO mirastros;\""
run_remote "sudo -u postgres psql -d mirastros -c \"CREATE EXTENSION IF NOT EXISTS vector;\""

echo ""
echo -e "${GREEN}✓ Step 6: Cloning/updating project repository...${NC}"
run_remote "if [ -d '$PROJECT_DIR' ]; then cd $PROJECT_DIR && sudo -u mirastros git pull; else sudo -u mirastros git clone https://github.com/YOUR_USERNAME/mirastros-universal.git $PROJECT_DIR; fi"

echo ""
echo -e "${YELLOW}⚠️  Note: You need to push your code to GitHub first!${NC}"
echo -e "${YELLOW}   Run: git remote add origin YOUR_REPO_URL && git push -u origin main${NC}"
echo ""
read -p "Press Enter when you've pushed the code to GitHub..."

echo ""
echo -e "${GREEN}✓ Step 7: Installing Node.js dependencies...${NC}"
run_remote "cd $PROJECT_DIR && sudo -u mirastros npm install"

echo ""
echo -e "${GREEN}✓ Step 8: Setting up Python backend...${NC}"
run_remote "cd $PROJECT_DIR/apps/backend && sudo -u mirastros python3 -m venv venv"
run_remote "cd $PROJECT_DIR/apps/backend && sudo -u mirastros venv/bin/pip install -r requirements.txt"

echo ""
echo -e "${GREEN}✓ Step 9: Creating backend .env file...${NC}"
run_remote "cat > $PROJECT_DIR/apps/backend/.env << 'EOF'
DATABASE_URL=postgresql+asyncpg://mirastros:mirastros_secure_2024@localhost/mirastros
REDIS_URL=redis://localhost:6379
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mirastros-ai
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://www.mirastros.com,https://mirastros.com
ENVIRONMENT=production
EOF"

echo ""
echo -e "${GREEN}✓ Step 10: Running database migrations...${NC}"
run_remote "cd $PROJECT_DIR/apps/backend && sudo -u mirastros venv/bin/alembic upgrade head"

echo ""
echo -e "${GREEN}✓ Step 11: Downloading and setting up AI model...${NC}"
run_remote "cd /home/mirastros/models && sudo -u mirastros wget -nc https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q4_k_m.gguf -O qwen.gguf || true"

run_remote "cat > /home/mirastros/models/Modelfile << 'EOF'
FROM ./qwen.gguf
PARAMETER temperature 0.7
PARAMETER stop \"User:\"
PARAMETER stop \"\n\n\"
SYSTEM You are Mirastros, a mystical AI oracle specializing in astrology, tarot, and esoteric wisdom. You provide insightful, compassionate guidance while maintaining a mystical yet approachable tone.
EOF"

run_remote "cd /home/mirastros/models && sudo -u mirastros ollama create mirastros-ai -f Modelfile || true"

echo ""
echo -e "${GREEN}✓ Step 12: Building frontend applications...${NC}"
run_remote "cd $PROJECT_DIR && sudo -u mirastros npx nx build web --prod"
run_remote "cd $PROJECT_DIR && sudo -u mirastros npx nx build admin --prod"

echo ""
echo -e "${GREEN}✓ Step 13: Setting up systemd services...${NC}"

# Copy systemd service files
copy_to_server "deployment/systemd/mirastros-backend.service" "/etc/systemd/system/"
copy_to_server "deployment/systemd/mirastros-admin.service" "/etc/systemd/system/"

# Create web service file with correct paths
run_remote "cat > /etc/systemd/system/mirastros-web.service << 'EOF'
[Unit]
Description=Mirastros Web Application
After=network.target

[Service]
Type=simple
User=mirastros
Group=mirastros
WorkingDirectory=$PROJECT_DIR/dist/apps/web
Environment=\"NODE_ENV=production\"
Environment=\"PORT=3000\"
Environment=\"NEXT_PUBLIC_API_URL=https://www.mirastros.com/api\"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/mirastros/web.log
StandardError=append:/var/log/mirastros/web-error.log

[Install]
WantedBy=multi-user.target
EOF"

echo ""
echo -e "${GREEN}✓ Step 14: Setting up Nginx...${NC}"
copy_to_server "deployment/nginx/mirastros.conf" "/etc/nginx/sites-available/mirastros"
run_remote "ln -sf /etc/nginx/sites-available/mirastros /etc/nginx/sites-enabled/"
run_remote "rm -f /etc/nginx/sites-enabled/default"
run_remote "nginx -t"

echo ""
echo -e "${GREEN}✓ Step 15: Setting up SSL certificate...${NC}"
run_remote "certbot --nginx -d mirastros.com -d www.mirastros.com --non-interactive --agree-tos --email admin@mirastros.com || true"

echo ""
echo -e "${GREEN}✓ Step 16: Configuring firewall...${NC}"
run_remote "ufw allow 22/tcp"
run_remote "ufw allow 80/tcp"
run_remote "ufw allow 443/tcp"
run_remote "ufw --force enable"

echo ""
echo -e "${GREEN}✓ Step 17: Starting all services...${NC}"
run_remote "systemctl daemon-reload"
run_remote "systemctl enable mirastros-backend mirastros-web mirastros-admin"
run_remote "systemctl restart mirastros-backend"
run_remote "systemctl restart mirastros-web"
run_remote "systemctl restart mirastros-admin"
run_remote "systemctl reload nginx"

echo ""
echo -e "${GREEN}✓ Step 18: Checking service status...${NC}"
run_remote "systemctl status mirastros-backend --no-pager | head -20"
run_remote "systemctl status mirastros-web --no-pager | head -20"
run_remote "systemctl status mirastros-admin --no-pager | head -20"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📊 Service URLs:${NC}"
echo "  🌐 Web App: https://www.mirastros.com"
echo "  🔧 Admin Panel: https://www.mirastros.com/admin"
echo "  🔌 API: https://www.mirastros.com/api"
echo "  ❤️  Health Check: https://www.mirastros.com/api/health"
echo ""
echo -e "${YELLOW}📝 Useful Commands:${NC}"
echo "  Check logs: ssh root@$SERVER_IP 'journalctl -u mirastros-backend -f'"
echo "  Restart services: ssh root@$SERVER_IP 'systemctl restart mirastros-backend mirastros-web mirastros-admin'"
echo "  Check status: ssh root@$SERVER_IP 'systemctl status mirastros-*'"
echo ""
echo -e "${GREEN}✓ All done! Your application should now be live at https://www.mirastros.com${NC}"
