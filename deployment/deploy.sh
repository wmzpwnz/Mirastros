#!/bin/bash

# Mirastros Universal - Complete Deployment Script
# Task 14.7: Deploy applications
# Builds and deploys web, admin, and backend applications

set -e  # Exit on error

echo "=========================================="
echo "Mirastros Universal - Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# Configuration
SERVER="109.196.100.104"
USER="mirastros"
DEPLOY_PATH="/var/www/mirastros"
REPO_PATH="$(pwd)"

print_info "Deployment configuration:"
echo "  Server: $SERVER"
echo "  User: $USER"
echo "  Deploy path: $DEPLOY_PATH"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "Please run this script from the mirastros-universal root directory"
    exit 1
fi

# Build applications locally
print_info "Building applications locally..."
echo ""

# Install dependencies
print_info "Installing dependencies..."
npm install
print_status "Dependencies installed"
echo ""

# Build web application
print_info "Building web application..."
cd apps/web
npm run build
cd ../..
print_status "Web application built"
echo ""

# Build admin panel
print_info "Building admin panel..."
cd apps/admin
npm run build
cd ../..
print_status "Admin panel built"
echo ""

# Deploy web application
print_info "Deploying web application..."
ssh ${USER}@${SERVER} "mkdir -p ${DEPLOY_PATH}/web"
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next/cache' \
  apps/web/.next/ ${USER}@${SERVER}:${DEPLOY_PATH}/web/.next/
rsync -avz apps/web/package.json ${USER}@${SERVER}:${DEPLOY_PATH}/web/
rsync -avz apps/web/public/ ${USER}@${SERVER}:${DEPLOY_PATH}/web/public/ || true
print_status "Web application deployed"
echo ""

# Deploy admin panel
print_info "Deploying admin panel..."
ssh ${USER}@${SERVER} "mkdir -p ${DEPLOY_PATH}/admin"
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next/cache' \
  apps/admin/.next/ ${USER}@${SERVER}:${DEPLOY_PATH}/admin/.next/
rsync -avz apps/admin/package.json ${USER}@${SERVER}:${DEPLOY_PATH}/admin/
rsync -avz apps/admin/public/ ${USER}@${SERVER}:${DEPLOY_PATH}/admin/public/ || true
print_status "Admin panel deployed"
echo ""

# Deploy backend
print_info "Deploying backend..."
ssh ${USER}@${SERVER} "mkdir -p ${DEPLOY_PATH}/backend"
rsync -avz --delete \
  --exclude 'venv' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.pytest_cache' \
  --exclude 'test_*.py' \
  apps/backend/ ${USER}@${SERVER}:${DEPLOY_PATH}/backend/
print_status "Backend deployed"
echo ""

# Setup backend on server
print_info "Setting up backend on server..."
ssh ${USER}@${SERVER} << 'ENDSSH'
cd /var/www/mirastros/backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3.11 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations if .env exists
if [ -f ".env" ]; then
    alembic upgrade head
fi

deactivate
ENDSSH
print_status "Backend setup completed"
echo ""

# Install Node.js dependencies on server
print_info "Installing Node.js dependencies on server..."
ssh ${USER}@${SERVER} << 'ENDSSH'
cd /var/www/mirastros/web
npm install --production

cd /var/www/mirastros/admin
npm install --production
ENDSSH
print_status "Node.js dependencies installed"
echo ""

# Restart services
print_info "Restarting services..."
ssh root@${SERVER} << 'ENDSSH'
systemctl restart mirastros-web
systemctl restart mirastros-admin
systemctl restart mirastros-backend
ENDSSH
print_status "Services restarted"
echo ""

# Check service status
print_info "Checking service status..."
ssh root@${SERVER} << 'ENDSSH'
echo "Web service:"
systemctl status mirastros-web --no-pager | head -n 5
echo ""
echo "Admin service:"
systemctl status mirastros-admin --no-pager | head -n 5
echo ""
echo "Backend service:"
systemctl status mirastros-backend --no-pager | head -n 5
ENDSSH
echo ""

# Summary
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
print_status "Web application deployed and running"
print_status "Admin panel deployed and running"
print_status "Backend API deployed and running"
echo ""
print_info "Access your applications:"
echo "  Web: https://www.mirastros.com"
echo "  Admin: https://www.mirastros.com/admin"
echo "  API: https://www.mirastros.com/api"
echo ""
print_info "Check logs:"
echo "  Web: tail -f /var/log/mirastros/web.log"
echo "  Admin: tail -f /var/log/mirastros/admin.log"
echo "  Backend: tail -f /var/log/mirastros/backend.log"
echo ""
print_info "Service management:"
echo "  Status: systemctl status mirastros-{web,admin,backend}"
echo "  Restart: systemctl restart mirastros-{web,admin,backend}"
echo "  Logs: journalctl -u mirastros-{web,admin,backend} -f"
echo ""
