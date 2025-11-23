# Mirastros Universal - Deployment Guide

Complete guide for deploying Mirastros to production VPS.

## Production Server Information

**Server Access:**
```bash
ssh root@109.196.100.104
# Password: hqpQDEoEB5_hnt
```

**Server Details:**
- **IP**: 109.196.100.104
- **Domain**: www.mirastros.com
- **OS**: Ubuntu/Debian Linux
- **Specs**: Minimum 8GB RAM, 4 CPU cores for AI model

> 📋 **Quick Reference**: See [.kiro/specs/mirastros-universal-platform/SERVER_INFO.md](.kiro/specs/mirastros-universal-platform/SERVER_INFO.md) for quick access commands
> 
> 📖 **Detailed Guide**: See [.kiro/specs/mirastros-universal-platform/DEPLOYMENT_GUIDE.md](.kiro/specs/mirastros-universal-platform/DEPLOYMENT_GUIDE.md) for step-by-step deployment instructions

## Prerequisites

- VPS with Ubuntu 22.04+ (minimum 8GB RAM, 4 CPU cores for AI model)
- Domain name (www.mirastros.com) pointed to VPS IP (109.196.100.104)
- SSH access as root or sudo user

## Quick Deploy

### Option 1: Automated Deployment

```bash
# On VPS
git clone <your-repo-url> /home/mirastros/www/mirastros-universal
cd /home/mirastros/www/mirastros-universal
sudo bash deployment/deploy.sh
```

This will:
- Install all system dependencies
- Setup PostgreSQL + pgvector
- Setup Redis
- Build Web and Admin apps
- Install systemd services
- Configure Nginx
- Setup SSL with Let's Encrypt

### Option 2: Manual Deployment

#### 1. System Setup

```bash
# Create user
sudo adduser mirastros
sudo usermod -aG sudo mirastros

# Install dependencies
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx \
    nodejs npm postgresql postgresql-contrib redis-server \
    python3-pip python3-venv build-essential
```

#### 2. Database Setup

```bash
# PostgreSQL
sudo -u postgres psql
CREATE DATABASE mirastros;
CREATE USER mirastros WITH PASSWORD 'mirastros';
GRANT ALL PRIVILEGES ON DATABASE mirastros TO mirastros;
ALTER USER mirastros WITH SUPERUSER;
\q

# Enable pgvector
sudo -u postgres psql -d mirastros -c "CREATE EXTENSION vector;"
```

#### 3. Backend Setup

```bash
cd /home/mirastros/www/mirastros-universal/apps/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit configuration

# Run migrations
alembic upgrade head

# Download AI model
bash download_model.sh
```

#### 4. Frontend Setup

```bash
cd /home/mirastros/www/mirastros-universal

# Install dependencies
npm install

# Build applications
npx nx build web --configuration=production
npx nx build admin --configuration=production
```

#### 5. Systemd Services

```bash
# Copy service files
sudo cp deployment/systemd/*.service /etc/systemd/system/
sudo cp apps/backend/mirastros-backend.service /etc/systemd/system/

# Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable mirastros-web mirastros-admin mirastros-backend
sudo systemctl start mirastros-web mirastros-admin mirastros-backend

# Check status
sudo systemctl status mirastros-web
sudo systemctl status mirastros-admin
sudo systemctl status mirastros-backend
```

#### 6. Nginx Configuration

```bash
# Copy Nginx config
sudo cp deployment/nginx/mirastros.conf /etc/nginx/sites-available/mirastros
sudo ln -s /etc/nginx/sites-available/mirastros /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 7. SSL Certificate

```bash
# For www.mirastros.com domain
sudo certbot --nginx -d mirastros.com -d www.mirastros.com
```

#### 8. Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Post-Deployment

### Verify Services

```bash
# Check all services
sudo systemctl status mirastros-web
sudo systemctl status mirastros-admin
sudo systemctl status mirastros-backend

# Check logs
sudo journalctl -u mirastros-backend -f
```

### Test API

```bash
# Health check
curl https://mirastros.com/api/health

# AI prediction
curl -X POST https://mirastros.com/api/ai/predict \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What does Aries have in store today?",
    "service_type": "horoscope",
    "use_rag": false
  }'
```

### Upload RAG Documents

```bash
# Via API
curl -X POST https://mirastros.com/api/documents/upload \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Astrology Basics",
    "content": "...",
    "category": "horoscope"
  }'
```

## Maintenance

### Update Application

```bash
cd /home/mirastros/www/mirastros-universal
git pull
npm install
npx nx build web --configuration=production
npx nx build admin --configuration=production
sudo systemctl restart mirastros-web mirastros-admin
```

### Update Backend

```bash
cd /home/mirastros/www/mirastros-universal/apps/backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart mirastros-backend
```

### Database Backup

```bash
# Backup
sudo -u postgres pg_dump mirastros > mirastros_backup.sql

# Restore
sudo -u postgres psql mirastros < mirastros_backup.sql
```

### View Logs

```bash
# Backend
sudo journalctl -u mirastros-backend -f

# Web
sudo journalctl -u mirastros-web -f

# Admin
sudo journalctl -u mirastros-admin -f

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Service won't start

```bash
# Check logs
sudo journalctl -u mirastros-backend -n 50

# Check permissions
sudo chown -R mirastros:mirastros /home/mirastros/www
```

### Database connection issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
sudo -u postgres psql -d mirastros -c "SELECT 1;"
```

### AI model not loading

```bash
# Check model file exists
ls -lh /home/mirastros/models/

# Check .env configuration
cat /home/mirastros/www/mirastros-universal/apps/backend/.env | grep MODEL_PATH

# Check backend logs
sudo journalctl -u mirastros-backend -f
```

## Performance Optimization

### Nginx Caching

Already configured in `mirastros.conf` for static assets.

### Redis Monitoring

```bash
redis-cli
> INFO stats
> KEYS *
```

### PostgreSQL Tuning

Edit `/etc/postgresql/*/main/postgresql.conf`:

```ini
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
work_mem = 64MB
```

## Security

- All services run as non-root `mirastros` user
- UFW firewall enabled (only 22, 80, 443)
- SSL/TLS via Let's Encrypt
- Rate limiting on AI endpoints (60 req/min)
- CORS restricted to allowed origins

## Monitoring

Consider adding:
- Prometheus + Grafana for metrics
- Sentry for error tracking
- Uptime monitoring (UptimeRobot, Pingdom)
