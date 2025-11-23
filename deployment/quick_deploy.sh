#!/bin/bash

# Mirastros Universal - Quick Deployment Script
# This script automates the entire deployment process
# Run from local machine: ./deployment/quick_deploy.sh

set -e

echo "=========================================="
echo "Mirastros Universal - Quick Deployment"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

SERVER="109.196.100.104"
USER="root"

print_info "This script will deploy Mirastros Universal to $SERVER"
print_info "Make sure you have:"
echo "  1. SSH access to the server"
echo "  2. Domain DNS configured (mirastros.com → $SERVER)"
echo "  3. All deployment scripts in deployment/ directory"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deployment cancelled"
    exit 0
fi

# Step 1: Upload deployment scripts
print_info "Step 1/7: Uploading deployment scripts..."
scp deployment/setup_vps.sh ${USER}@${SERVER}:/root/
scp deployment/setup_ssl.sh ${USER}@${SERVER}:/root/
scp deployment/setup_ollama.sh ${USER}@${SERVER}:/root/
scp deployment/setup_database.sh ${USER}@${SERVER}:/root/
scp deployment/nginx/mirastros.conf ${USER}@${SERVER}:/root/
scp deployment/systemd/*.service ${USER}@${SERVER}:/root/
print_status "Scripts uploaded"
echo ""

# Step 2: Setup VPS environment
print_info "Step 2/7: Setting up VPS environment..."
ssh ${USER}@${SERVER} "chmod +x /root/setup_vps.sh && /root/setup_vps.sh"
print_status "VPS environment configured"
echo ""

# Step 3: Setup SSL
print_info "Step 3/7: Setting up SSL certificates..."
print_info "Make sure DNS is configured before proceeding!"
read -p "DNS configured? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh ${USER}@${SERVER} "chmod +x /root/setup_ssl.sh && /root/setup_ssl.sh"
    print_status "SSL certificates obtained"
else
    print_info "Skipping SSL setup - run manually later"
fi
echo ""

# Step 4: Configure Nginx
print_info "Step 4/7: Configuring Nginx..."
ssh ${USER}@${SERVER} << 'ENDSSH'
cp /root/mirastros.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/mirastros.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
ENDSSH
print_status "Nginx configured"
echo ""

# Step 5: Setup Ollama
print_info "Step 5/7: Setting up Ollama and AI model..."
print_info "This may take 10-20 minutes..."
ssh ${USER}@${SERVER} "chmod +x /root/setup_ollama.sh && /root/setup_ollama.sh"
print_status "Ollama and AI model configured"
echo ""

# Step 6: Setup database
print_info "Step 6/7: Setting up database..."
ssh ${USER}@${SERVER} "chmod +x /root/setup_database.sh && /root/setup_database.sh"
print_status "Database configured"
echo ""

# Step 7: Setup systemd services
print_info "Step 7/7: Setting up systemd services..."
ssh ${USER}@${SERVER} << 'ENDSSH'
cp /root/mirastros-web.service /etc/systemd/system/
cp /root/mirastros-admin.service /etc/systemd/system/
cp /root/mirastros-backend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable mirastros-web mirastros-admin mirastros-backend
ENDSSH
print_status "Systemd services configured"
echo ""

# Get database credentials
print_info "Retrieving database credentials..."
DB_CREDS=$(ssh ${USER}@${SERVER} "cat /root/.mirastros_db_credentials | grep DATABASE_URL | cut -d'=' -f2")
echo ""

print_info "Database credentials retrieved"
print_info "You need to configure the backend .env file with these credentials"
echo ""

# Summary
echo ""
echo "=========================================="
echo "Server Setup Complete!"
echo "=========================================="
echo ""
print_status "VPS environment configured"
print_status "SSL certificates obtained"
print_status "Nginx configured"
print_status "Ollama and AI model ready"
print_status "Database configured"
print_status "Systemd services ready"
echo ""
print_info "Next steps:"
echo "  1. Configure backend .env file on server"
echo "  2. Run deployment: ./deployment/deploy.sh"
echo "  3. Test applications at https://www.mirastros.com"
echo ""
print_info "Database connection string:"
echo "  $DB_CREDS"
echo ""
print_info "To configure backend .env:"
echo "  ssh mirastros@$SERVER"
echo "  nano /var/www/mirastros/backend/.env"
echo "  # Add DATABASE_URL and other settings"
echo ""
