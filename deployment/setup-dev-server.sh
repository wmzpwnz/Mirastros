#!/bin/bash

# Mirastros Universal - Dev Server Setup
# Runs ON THE SERVER to configure the Dev environment

set -e

# Configuration
APP_DIR="/var/www/mirastros-dev"
BACKEND_PORT=8001
FRONTEND_PORT=3001
DB_NAME="mirastros_dev"
DOMAIN="dev.mirastros.com"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }

# Ensure we are in the right directory
cd $APP_DIR

# ==========================================
# 1. Database Setup
# ==========================================
info "Setting up Database ($DB_NAME)..."

# Get DB password from existing credentials or generate new
if [ -f "/root/.mirastros_credentials" ]; then
    source /root/.mirastros_credentials
else
    DB_PASSWORD=$(openssl rand -hex 16)
fi

sudo -u postgres psql <<EOF
-- Create Dev Database if not exists
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL ON DATABASE $DB_NAME TO mirastros;
\c $DB_NAME
CREATE EXTENSION IF NOT EXISTS vector;
GRANT ALL ON SCHEMA public TO mirastros;
EOF

success "Database ready."

# ==========================================
# 2. Backend Setup
# ==========================================
info "Setting up Backend (Port $BACKEND_PORT)..."
cd $APP_DIR/apps/backend

# Venv
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Install deps
venv/bin/pip install --upgrade pip
venv/bin/pip install -r requirements.txt

# Create .env
cat > .env <<ENVFILE
APP_NAME=Mirastros Dev
DEBUG=True
HOST=0.0.0.0
PORT=$BACKEND_PORT
DATABASE_URL=postgresql+asyncpg://mirastros:${DB_PASSWORD}@localhost:5432/${DB_NAME}
REDIS_URL=redis://localhost:6379/1
OLLAMA_URL=http://localhost:11434
MODEL_NAME=mirastros-ai
SECRET_KEY=dev_secret_key_change_me_in_prod
CORS_ORIGINS=["https://${DOMAIN}", "http://localhost:${FRONTEND_PORT}"]
ENVFILE

# Systemd Service
cat > /etc/systemd/system/mirastros-dev-backend.service <<SERVICE
[Unit]
Description=Mirastros Dev Backend
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/apps/backend
Environment="PATH=$APP_DIR/apps/backend/venv/bin"
ExecStart=$APP_DIR/apps/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $BACKEND_PORT --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable mirastros-dev-backend
systemctl restart mirastros-dev-backend

success "Backend setup complete."

# ==========================================
# 3. Frontend Setup
# ==========================================
info "Setting up Frontend (Port $FRONTEND_PORT)..."

# Install deps at ROOT (Nx Monorepo)
cd $APP_DIR
info "Installing dependencies..."
npm install --legacy-peer-deps

# Build
info "Building Next.js app..."
# We use npx to run nx from local node_modules
npx nx run web:build

# Systemd Service
cat > /etc/systemd/system/mirastros-dev-web.service <<SERVICE
[Unit]
Description=Mirastros Dev Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/apps/web
# Use next binary from root node_modules
ExecStart=$APP_DIR/node_modules/.bin/next start -p $FRONTEND_PORT
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_API_URL=https://${DOMAIN}/api

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable mirastros-dev-web
systemctl restart mirastros-dev-web

success "Frontend setup complete."

# ==========================================
# 4. Nginx Setup
# ==========================================
info "Setting up Nginx for $DOMAIN..."

cat > /etc/nginx/sites-available/mirastros-dev <<NGINX
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:$FRONTEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Swagger UI
    location /docs {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/docs;
    }
    
    location /openapi.json {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/openapi.json;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/mirastros-dev /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# SSL
info "Setting up SSL..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@mirastros.com --redirect || echo "SSL setup failed (DNS might not be propagated yet)"

success "Dev Environment Ready: https://$DOMAIN"
