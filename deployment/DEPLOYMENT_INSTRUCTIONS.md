# Mirastros Universal - Complete Deployment Instructions

## Server Information

- **Server IP**: 109.196.100.104
- **Domain**: www.mirastros.com
- **Root access**: Use SSH keys or credentials from your secure secret store (never commit passwords to the repo).
- **OS**: Ubuntu 22.04 LTS (recommended)

## Prerequisites

Before starting deployment, ensure you have:

1. SSH access to the server
2. Domain DNS configured to point to server IP
3. Local development environment with Node.js and npm
4. rsync installed on local machine

## Complete Deployment Process

### Step 1: Connect to Server

```bash
ssh root@109.196.100.104
# Use your SSH key or password from a secure store
```

### Step 2: Upload Deployment Scripts

From your local machine, upload all deployment scripts:

```bash
# Navigate to project root
cd mirastros-universal

# Upload deployment scripts
scp deployment/setup_vps.sh root@109.196.100.104:/root/
scp deployment/setup_ssl.sh root@109.196.100.104:/root/
scp deployment/setup_ollama.sh root@109.196.100.104:/root/
scp deployment/setup_database.sh root@109.196.100.104:/root/
scp deployment/nginx/mirastros.conf root@109.196.100.104:/root/
scp deployment/systemd/*.service root@109.196.100.104:/root/
```

### Step 3: Setup VPS Environment (Task 14.1)

On the server, run the VPS setup script:

```bash
chmod +x /root/setup_vps.sh
/root/setup_vps.sh
```

This script will:
- Update system packages
- Create `mirastros` user
- Install Node.js v20 LTS
- Install Python 3.11
- Install PostgreSQL 15
- Install Redis
- Install Nginx
- Configure UFW firewall
- Create application directories
- Install PM2

After completion, set a password for the mirastros user:

```bash
passwd mirastros
# Enter a secure password
```

### Step 4: Setup SSL Certificates (Task 14.2)

**Important**: Before running this step, ensure your domain DNS is configured:
- A record for `mirastros.com` → 109.196.100.104
- A record for `www.mirastros.com` → 109.196.100.104

Run the SSL setup script:

```bash
chmod +x /root/setup_ssl.sh
/root/setup_ssl.sh
```

This script will:
- Install Certbot
- Obtain SSL certificates for mirastros.com and www.mirastros.com
- Configure auto-renewal
- Create renewal hooks

### Step 5: Configure Nginx (Task 14.3)

Copy the Nginx configuration and enable the site:

```bash
# Copy configuration
cp /root/mirastros.conf /etc/nginx/sites-available/

# Enable site
ln -s /etc/nginx/sites-available/mirastros.conf /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Step 6: Setup Ollama and AI Model (Task 14.5)

Run the Ollama setup script:

```bash
chmod +x /root/setup_ollama.sh
/root/setup_ollama.sh
```

This script will:
- Install Ollama
- Download Qwen 2.5 7B Instruct model (~5.5GB)
- Create custom Mirastros AI model
- Configure Ollama service
- Enable and start the service

**Note**: This step may take 10-20 minutes depending on internet speed.

### Step 7: Configure Database (Task 14.6)

Run the database setup script:

```bash
chmod +x /root/setup_database.sh
/root/setup_database.sh
```

This script will:
- Install pgvector extension
- Create database and user
- Enable required extensions
- Configure PostgreSQL for production
- Generate and save credentials

**Important**: Save the database credentials displayed at the end. You'll need them for the backend configuration.

### Step 8: Setup systemd Services (Task 14.4)

Install and enable the systemd service files:

```bash
# Copy service files
cp /root/mirastros-web.service /etc/systemd/system/
cp /root/mirastros-admin.service /etc/systemd/system/
cp /root/mirastros-backend.service /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable services (don't start yet - apps not deployed)
systemctl enable mirastros-web
systemctl enable mirastros-admin
systemctl enable mirastros-backend
```

### Step 9: Configure Backend Environment

Create the backend .env file with database credentials:

```bash
# Switch to mirastros user
su - mirastros

# Create backend directory
mkdir -p /var/www/mirastros/backend

# Create .env file
cat > /var/www/mirastros/backend/.env << 'EOF'
# Database
DATABASE_URL=postgresql://mirastros:YOUR_PASSWORD_HERE@localhost:5432/mirastros

# Redis
REDIS_URL=redis://localhost:6379/0

# Ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=mirastros-ai

# JWT
SECRET_KEY=YOUR_SECRET_KEY_HERE
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=https://www.mirastros.com,https://mirastros.com

# Payment Gateways
YUKASSA_SHOP_ID=your_shop_id
YUKASSA_SECRET_KEY=your_secret_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Environment
ENVIRONMENT=production
EOF

# Generate a secure secret key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy the output and replace YOUR_SECRET_KEY_HERE in .env

# Replace YOUR_PASSWORD_HERE with the database password from Step 7
# Check /root/.mirastros_db_credentials for the password
exit
```

### Step 10: Deploy Applications (Task 14.7)

From your **local machine**, run the deployment script:

```bash
# Navigate to project root
cd mirastros-universal

# Make deploy script executable
chmod +x deployment/deploy.sh

# Run deployment
./deployment/deploy.sh
```

This script will:
- Build web and admin applications locally
- Deploy built files to server
- Deploy backend code
- Setup Python virtual environment
- Install dependencies
- Run database migrations
- Restart all services

### Step 11: Verify Deployment

Check that all services are running:

```bash
ssh root@109.196.100.104

# Check service status
systemctl status mirastros-web
systemctl status mirastros-admin
systemctl status mirastros-backend
systemctl status postgresql
systemctl status redis-server
systemctl status ollama
systemctl status nginx

# Check logs
tail -f /var/log/mirastros/web.log
tail -f /var/log/mirastros/admin.log
tail -f /var/log/mirastros/backend.log
```

### Step 12: Test Applications

Open your browser and test:

1. **Web Application**: https://www.mirastros.com
2. **Admin Panel**: https://www.mirastros.com/admin
3. **API Health**: https://www.mirastros.com/api/health
4. **API Docs**: https://www.mirastros.com/api/docs

## Post-Deployment Tasks

### 1. Setup Monitoring

Install monitoring tools:

```bash
# Install htop for system monitoring
apt install -y htop

# Install netdata for real-time monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

### 2. Setup Automated Backups

Create a backup script:

```bash
cat > /root/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/mirastros"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump mirastros | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/mirastros

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /root/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup.sh") | crontab -
```

### 3. Setup Log Rotation

Create log rotation config:

```bash
cat > /etc/logrotate.d/mirastros << 'EOF'
/var/log/mirastros/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 mirastros mirastros
    sharedscripts
    postrotate
        systemctl reload mirastros-web mirastros-admin mirastros-backend
    endscript
}
EOF
```

### 4. Configure Fail2Ban (Optional)

Add extra security:

```bash
apt install -y fail2ban

# Configure fail2ban for SSH
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

systemctl enable fail2ban
systemctl start fail2ban
```

## Maintenance Commands

### Update Applications

```bash
# From local machine
cd mirastros-universal
git pull
./deployment/deploy.sh
```

### Restart Services

```bash
ssh root@109.196.100.104
systemctl restart mirastros-web
systemctl restart mirastros-admin
systemctl restart mirastros-backend
```

### View Logs

```bash
# Real-time logs
journalctl -u mirastros-web -f
journalctl -u mirastros-admin -f
journalctl -u mirastros-backend -f

# Application logs
tail -f /var/log/mirastros/web.log
tail -f /var/log/mirastros/admin.log
tail -f /var/log/mirastros/backend.log
```

### Database Management

```bash
# Connect to database
sudo -u postgres psql mirastros

# Backup database
sudo -u postgres pg_dump mirastros > backup.sql

# Restore database
sudo -u postgres psql mirastros < backup.sql
```

### SSL Certificate Renewal

```bash
# Test renewal
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal
```

## Troubleshooting

### Services Won't Start

```bash
# Check service status
systemctl status mirastros-backend

# View detailed logs
journalctl -u mirastros-backend -n 100

# Check configuration
nginx -t
```

### Database Connection Issues

```bash
# Check PostgreSQL status
systemctl status postgresql

# Check database exists
sudo -u postgres psql -l

# Test connection
sudo -u postgres psql mirastros -c "SELECT version();"
```

### SSL Certificate Issues

```bash
# Check certificates
certbot certificates

# Check Nginx SSL configuration
nginx -t

# Renew certificates
certbot renew
```

### Ollama Not Responding

```bash
# Check Ollama status
systemctl status ollama

# Test Ollama
curl http://127.0.0.1:11434/api/generate -d '{
  "model": "mirastros-ai",
  "prompt": "Hello"
}'

# Restart Ollama
systemctl restart ollama
```

### High Memory Usage

```bash
# Check memory usage
free -h
htop

# Restart services to free memory
systemctl restart mirastros-backend
systemctl restart ollama
```

## Security Checklist

- [ ] Changed default root password
- [ ] Created and secured mirastros user
- [ ] Configured UFW firewall
- [ ] Installed SSL certificates
- [ ] Configured fail2ban (optional)
- [ ] Setup automated backups
- [ ] Configured log rotation
- [ ] Disabled password authentication for SSH (use keys)
- [ ] Updated all system packages
- [ ] Secured database with strong password
- [ ] Set secure JWT secret key
- [ ] Configured CORS properly
- [ ] Setup monitoring

## Support

For issues or questions:
- Check logs: `/var/log/mirastros/`
- Review systemd status: `systemctl status mirastros-*`
- Check Nginx error log: `/var/log/nginx/error.log`
- Review backend logs: `journalctl -u mirastros-backend -n 100`

## Summary

After completing all steps, you should have:
- ✅ Fully configured VPS environment
- ✅ SSL certificates installed and auto-renewing
- ✅ Nginx configured as reverse proxy
- ✅ PostgreSQL database with pgvector
- ✅ Redis cache server
- ✅ Ollama with Qwen 2.5 AI model
- ✅ All applications deployed and running
- ✅ Systemd services managing applications
- ✅ Automated backups configured
- ✅ Log rotation configured
- ✅ Monitoring tools installed

Your Mirastros Universal platform is now live at **https://www.mirastros.com**! 🎉
