# Quick Deploy Cheatsheet

## Server Access
```bash
ssh root@109.196.100.104
# Password: hqpQDEoEB5_hnt
```

## First Time Setup (Run Once)

```bash
# 1. Connect and update
ssh root@109.196.100.104
apt update && apt upgrade -y

# 2. Install everything
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs python3 python3-pip python3-venv postgresql postgresql-contrib redis-server nginx certbot python3-certbot-nginx git

# 3. Setup Ollama
curl -fsSL https://ollama.com/install.sh | sh
systemctl enable ollama

# 4. Create user and directories
useradd -m -s /bin/bash mirastros
mkdir -p /home/mirastros/www /home/mirastros/models
chown -R mirastros:mirastros /home/mirastros

# 5. Setup database
sudo -u postgres psql << EOF
CREATE DATABASE mirastros;
CREATE USER mirastros WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mirastros TO mirastros;
\c mirastros
CREATE EXTENSION vector;
EOF

# 6. Clone project
su - mirastros
cd /home/mirastros/www
git clone YOUR_REPO_URL mirastros-universal
cd mirastros-universal

# 7. Install dependencies
npm install

# 8. Setup backend
cd apps/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql+asyncpg://mirastros:your_password@localhost/mirastros
REDIS_URL=redis://localhost:6379
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mirastros-ai
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://www.mirastros.com,https://mirastros.com
EOF

# Run migrations
alembic upgrade head
cd ../..

# 9. Download AI model
cd /home/mirastros/models
wget https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q4_k_m.gguf -O qwen.gguf

cat > Modelfile << 'EOF'
FROM ./qwen.gguf
PARAMETER temperature 0.7
PARAMETER stop "User:"
PARAMETER stop "\n\n"
SYSTEM You are Mirastros, a mystical AI oracle specializing in astrology, tarot, and esoteric wisdom.
EOF

ollama create mirastros-ai -f Modelfile

# 10. Build frontend
cd /home/mirastros/www/mirastros-universal
npx nx build web --prod
npx nx build admin --prod

# 11. Exit to root
exit

# 12. Setup systemd services (copy from deployment/systemd/)
# See DEPLOYMENT_GUIDE.md for service files

# 13. Setup Nginx
cp /home/mirastros/www/mirastros-universal/deployment/nginx/mirastros.conf /etc/nginx/sites-available/mirastros
ln -s /etc/nginx/sites-available/mirastros /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# 14. Get SSL certificate
certbot --nginx -d mirastros.com -d www.mirastros.com

# 15. Setup firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# 16. Start services
systemctl daemon-reload
systemctl enable mirastros-backend mirastros-web mirastros-admin
systemctl start mirastros-backend mirastros-web mirastros-admin
```

## Regular Deployment (Updates)

```bash
# 1. Connect
ssh root@109.196.100.104

# 2. Switch to mirastros user
su - mirastros

# 3. Pull changes
cd /home/mirastros/www/mirastros-universal
git pull

# 4. Install dependencies
npm install

# 5. Build frontend
npx nx build web --prod
npx nx build admin --prod

# 6. Update backend
cd apps/backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head

# 7. Exit to root
exit

# 8. Restart services
systemctl restart mirastros-backend
systemctl restart mirastros-web
systemctl restart mirastros-admin

# 9. Check status
systemctl status mirastros-backend
systemctl status mirastros-web
systemctl status mirastros-admin
```

## Quick Checks

```bash
# Check all services
systemctl status mirastros-backend mirastros-web mirastros-admin postgresql redis-server ollama nginx

# View logs
journalctl -u mirastros-backend -f
journalctl -u mirastros-web -f
journalctl -u mirastros-admin -f

# Test endpoints
curl http://localhost:8000/health
curl https://www.mirastros.com
```

## Troubleshooting

```bash
# Restart everything
systemctl restart mirastros-backend mirastros-web mirastros-admin nginx

# Check logs
journalctl -u mirastros-backend -n 100
tail -f /var/log/nginx/error.log

# Check ports
netstat -tulpn | grep -E '3000|3001|8000'

# Test Ollama
ollama list
ollama run mirastros-ai "Test"
```

## Important Paths

- **Project**: `/home/mirastros/www/mirastros-universal`
- **Backend env**: `/home/mirastros/www/mirastros-universal/apps/backend/.env`
- **AI Model**: `/home/mirastros/models/qwen.gguf`
- **Nginx config**: `/etc/nginx/sites-available/mirastros`
- **SSL certs**: `/etc/letsencrypt/live/mirastros.com/`
- **Systemd services**: `/etc/systemd/system/mirastros-*.service`

## Useful Commands

```bash
# Backup database
sudo -u postgres pg_dump mirastros > backup_$(date +%Y%m%d).sql

# Restore database
sudo -u postgres psql mirastros < backup_20250123.sql

# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# Monitor logs in real-time
tail -f /var/log/nginx/access.log
journalctl -u mirastros-backend -f
```

---

**Server**: 109.196.100.104  
**Domain**: www.mirastros.com  
**User**: root / mirastros  
**Password**: hqpQDEoEB5_hnt
