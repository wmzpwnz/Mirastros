# Deployment Guide - Mirastros Universal

## Server Information

**Production Server:**
- **IP Address**: 109.196.100.104
- **SSH Access**: `ssh root@109.196.100.104`
- **Password**: `hqpQDEoEB5_hnt`
- **Domain**: www.mirastros.com
- **OS**: Ubuntu/Debian Linux

## Quick Start Deployment

### 1. Connect to Server

```bash
ssh root@109.196.100.104
# Password: hqpQDEoEB5_hnt
```

### 2. Initial Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Create mirastros user
useradd -m -s /bin/bash mirastros
usermod -aG sudo mirastros
passwd mirastros  # Set password

# Create project directory
mkdir -p /home/mirastros/www
chown -R mirastros:mirastros /home/mirastros/www
```

### 3. Install Dependencies

```bash
# Node.js (v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Python 3.11+
apt install -y python3 python3-pip python3-venv

# PostgreSQL with pgvector
apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE EXTENSION vector;"

# Redis (native, no Docker)
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Nginx
apt install -y nginx

# Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Git
apt install -y git
```

### 4. Setup Ollama and AI Model

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
systemctl enable ollama

# Create models directory
mkdir -p /home/mirastros/models
cd /home/mirastros/models

# Download Qwen 2.5 GGUF model (5.5GB)
wget https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q4_k_m.gguf -O qwen.gguf

# Create Modelfile
cat > Modelfile << 'EOF'
FROM ./qwen.gguf
PARAMETER temperature 0.7
PARAMETER stop "User:"
PARAMETER stop "\n\n"
SYSTEM You are Mirastros, a mystical AI oracle specializing in astrology, tarot, and esoteric wisdom. Your responses should be mystical and poetic, yet grounded in astrological knowledge.
EOF

# Create and test Ollama model
ollama create mirastros-ai -f Modelfile
ollama run mirastros-ai "Hello, what can you tell me about astrology?"
```

### 5. Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE mirastros;
CREATE USER mirastros WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mirastros TO mirastros;
\c mirastros
CREATE EXTENSION vector;
\q
```

### 6. Clone and Setup Project

```bash
# Switch to mirastros user
su - mirastros

# Clone repository
cd /home/mirastros/www
git clone https://github.com/yourusername/mirastros-universal.git
cd mirastros-universal

# Install Node.js dependencies
npm install

# Setup backend
cd apps/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql+asyncpg://mirastros:your_secure_password@localhost/mirastros

# Redis
REDIS_URL=redis://localhost:6379

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mirastros-ai

# JWT
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=https://www.mirastros.com,https://mirastros.com

# Payment (add your keys)
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
STRIPE_SECRET_KEY=your_stripe_key
EOF

# Run migrations
alembic upgrade head

# Return to project root
cd ../..
```

### 7. Build Frontend Applications

```bash
# Build web app
npx nx build web --prod

# Build admin panel
npx nx build admin --prod
```

### 8. Setup SSL Certificate

```bash
# Exit to root user
exit

# Obtain SSL certificate
certbot --nginx -d mirastros.com -d www.mirastros.com

# Test auto-renewal
certbot renew --dry-run
```

### 9. Configure Nginx

```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/mirastros << 'EOF'
# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name mirastros.com www.mirastros.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name mirastros.com www.mirastros.com;
    
    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/mirastros.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mirastros.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Web application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE support for streaming AI responses
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
    }
    
    # Admin panel
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/mirastros /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### 10. Setup Systemd Services

```bash
# Backend service
cat > /etc/systemd/system/mirastros-backend.service << 'EOF'
[Unit]
Description=Mirastros Backend API
After=network.target postgresql.service redis-server.service ollama.service

[Service]
Type=simple
User=mirastros
WorkingDirectory=/home/mirastros/www/mirastros-universal/apps/backend
Environment="PYTHONPATH=/home/mirastros/www/mirastros-universal/apps/backend"
ExecStart=/home/mirastros/www/mirastros-universal/apps/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Web service
cat > /etc/systemd/system/mirastros-web.service << 'EOF'
[Unit]
Description=Mirastros Web Application
After=network.target

[Service]
Type=simple
User=mirastros
WorkingDirectory=/home/mirastros/www/mirastros-universal
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/node /home/mirastros/www/mirastros-universal/dist/apps/web/server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Admin service
cat > /etc/systemd/system/mirastros-admin.service << 'EOF'
[Unit]
Description=Mirastros Admin Panel
After=network.target

[Service]
Type=simple
User=mirastros
WorkingDirectory=/home/mirastros/www/mirastros-universal
Environment="NODE_ENV=production"
Environment="PORT=3001"
ExecStart=/usr/bin/node /home/mirastros/www/mirastros-universal/dist/apps/admin/server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

# Enable and start services
systemctl enable mirastros-backend
systemctl enable mirastros-web
systemctl enable mirastros-admin

systemctl start mirastros-backend
systemctl start mirastros-web
systemctl start mirastros-admin

# Check status
systemctl status mirastros-backend
systemctl status mirastros-web
systemctl status mirastros-admin
```

### 11. Configure Firewall

```bash
# Install UFW
apt install -y ufw

# Allow SSH
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## Verification

### Check Services

```bash
# Check if all services are running
systemctl status mirastros-backend
systemctl status mirastros-web
systemctl status mirastros-admin
systemctl status postgresql
systemctl status redis-server
systemctl status ollama
systemctl status nginx

# Check logs
journalctl -u mirastros-backend -f
journalctl -u mirastros-web -f
journalctl -u mirastros-admin -f
```

### Test Endpoints

```bash
# Test backend health
curl http://localhost:8000/health

# Test Ollama
curl http://localhost:11434/api/generate -d '{
  "model": "mirastros-ai",
  "prompt": "Hello",
  "stream": false
}'

# Test web app
curl http://localhost:3000

# Test from outside
curl https://www.mirastros.com
```

## Maintenance

### Update Application

```bash
# Switch to mirastros user
su - mirastros

# Pull latest changes
cd /home/mirastros/www/mirastros-universal
git pull

# Install dependencies
npm install

# Rebuild frontend
npx nx build web --prod
npx nx build admin --prod

# Update backend dependencies
cd apps/backend
source venv/bin/activate
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Exit to root
exit

# Restart services
systemctl restart mirastros-backend
systemctl restart mirastros-web
systemctl restart mirastros-admin
```

### View Logs

```bash
# Backend logs
journalctl -u mirastros-backend -n 100 -f

# Web logs
journalctl -u mirastros-web -n 100 -f

# Admin logs
journalctl -u mirastros-admin -n 100 -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Backup Database

```bash
# Create backup
sudo -u postgres pg_dump mirastros > /home/mirastros/backups/mirastros_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
sudo -u postgres psql mirastros < /home/mirastros/backups/mirastros_20250121_120000.sql
```

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
journalctl -u mirastros-backend -n 50

# Check if port is in use
netstat -tulpn | grep 8000

# Test manually
su - mirastros
cd /home/mirastros/www/mirastros-universal/apps/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Ollama Issues

```bash
# Check Ollama status
systemctl status ollama

# Test Ollama
ollama list
ollama run mirastros-ai "Test"

# Restart Ollama
systemctl restart ollama
```

### SSL Certificate Issues

```bash
# Check certificate
certbot certificates

# Renew certificate
certbot renew

# Force renewal
certbot renew --force-renewal
```

### Nginx Issues

```bash
# Test configuration
nginx -t

# Check logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

## Security Checklist

- [ ] Change default root password
- [ ] Setup SSH key authentication
- [ ] Disable root SSH login
- [ ] Configure UFW firewall
- [ ] Setup fail2ban for SSH protection
- [ ] Enable automatic security updates
- [ ] Setup database backups
- [ ] Configure log rotation
- [ ] Setup monitoring (optional: Prometheus + Grafana)
- [ ] Review and update environment variables
- [ ] Setup rate limiting in backend
- [ ] Configure CORS properly
- [ ] Review Nginx security headers

## Performance Optimization

- [ ] Enable Nginx gzip compression
- [ ] Configure Redis maxmemory policy
- [ ] Optimize PostgreSQL settings
- [ ] Setup CDN for static assets (optional)
- [ ] Configure Ollama for optimal performance
- [ ] Monitor resource usage
- [ ] Setup log rotation to prevent disk space issues

---

**Document Version**: 1.0.0  
**Date**: 2025-11-23  
**Status**: Ready for deployment
