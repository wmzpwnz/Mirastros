#!/bin/bash

# Mirastros Universal - Landing Page Deployment Script
# Deploys landing page to both DEV and PRODUCTION environments

set -e

# Configuration
SERVER="109.196.100.104"
USER="root"
PASSWORD="hqpQDEoEB5_hnt"
PROD_PATH="/var/www/mirastros-universal"
DEV_PATH="/var/www/mirastros-dev"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

echo "🚀 Mirastros Universal - Landing Page Deployment"
echo "================================================"
echo ""
echo "Server: $SERVER"
echo "Production: $PROD_PATH"
echo "Development: $DEV_PATH"
echo ""

# Function to deploy to environment
deploy_to_env() {
    local ENV_NAME=$1
    local DEPLOY_PATH=$2
    local PORT=$3
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    info "Deploying to $ENV_NAME environment..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 1. Upload source files
    info "Step 1/5: Uploading source files..."
    sshpass -p "$PASSWORD" rsync -avz --delete \
      --exclude 'node_modules' \
      --exclude 'venv' \
      --exclude '__pycache__' \
      --exclude '.next' \
      --exclude '.git' \
      --exclude '*.pyc' \
      --exclude '.DS_Store' \
      --exclude '*.log' \
      "$PROJECT_ROOT/" ${USER}@${SERVER}:${DEPLOY_PATH}/
    success "Source files uploaded"
    
    # 2. Install dependencies
    info "Step 2/5: Installing npm dependencies..."
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} << ENDSSH
cd ${DEPLOY_PATH}
if [ ! -d "node_modules" ]; then
    npm install
else
    npm ci
fi
ENDSSH
    success "Dependencies installed"
    
    # 3. Build Next.js app
    info "Step 3/5: Building Next.js application..."
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} << ENDSSH
cd ${DEPLOY_PATH}
export NODE_ENV=production
npx nx build web --prod 2>&1 | tail -20
ENDSSH
    success "Build completed"
    
    # 4. Set permissions
    info "Step 4/5: Setting permissions..."
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} << ENDSSH
chown -R root:root ${DEPLOY_PATH}/apps/web/.next 2>/dev/null || true
chmod -R 755 ${DEPLOY_PATH}/apps/web/.next 2>/dev/null || true
ENDSSH
    success "Permissions set"
    
    # 5. Restart service
    info "Step 5/5: Restarting ${ENV_NAME} web service..."
    if [ "$ENV_NAME" == "PRODUCTION" ]; then
        SERVICE_NAME="mirastros-web"
    else
        SERVICE_NAME="mirastros-dev-web"
    fi
    
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} << ENDSSH
systemctl restart ${SERVICE_NAME}
sleep 2
systemctl status ${SERVICE_NAME} --no-pager | head -10
ENDSSH
    success "${ENV_NAME} web service restarted"
    
    echo ""
    success "✅ $ENV_NAME deployment completed!"
}

# Deploy to PRODUCTION
deploy_to_env "PRODUCTION" "$PROD_PATH" "3000"

# Deploy to DEV
deploy_to_env "DEVELOPMENT" "$DEV_PATH" "3001"

# Final verification
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "Final verification..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} << 'ENDSSH'
echo "=== Service Status ==="
systemctl is-active mirastros-web mirastros-dev-web && echo "✅ All services active" || echo "⚠️  Some services inactive"

echo ""
echo "=== Ports ==="
ss -tlnp | grep -E ':3000|:3001' | grep LISTEN || echo "⚠️  Ports not listening"

echo ""
echo "=== Build Check ==="
echo "Production build:"
ls -lh /var/www/mirastros-universal/apps/web/.next/BUILD_ID 2>/dev/null && echo "✅ Production build exists" || echo "❌ Production build missing"

echo "Dev build:"
ls -lh /var/www/mirastros-dev/apps/web/.next/BUILD_ID 2>/dev/null && echo "✅ Dev build exists" || echo "❌ Dev build missing"
ENDSSH

echo ""
success "🎉 Landing page deployment completed!"
echo ""
info "Production: https://mirastros.com"
info "Development: https://dev.mirastros.com (if configured)"

