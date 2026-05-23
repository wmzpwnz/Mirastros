#!/bin/bash

# Mirastros Universal - Dev Deployment Script
# Deploys to dev.mirastros.com (Parallel Environment)

set -e

# Configuration
SERVER="109.196.100.104"
USER="root"
DEPLOY_PATH="/var/www/mirastros-dev"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }

echo "🚀 Deploying to DEV Environment (dev.mirastros.com)..."
echo "Server: $SERVER"
echo "Path: $DEPLOY_PATH"
echo ""

# 1. Create directory
info "Creating directory..."
ssh ${USER}@${SERVER} "mkdir -p ${DEPLOY_PATH}"

# 2. Upload files
info "Uploading files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude 'venv' \
  --exclude '__pycache__' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '*.pyc' \
  --exclude '.DS_Store' \
  ./ ${USER}@${SERVER}:${DEPLOY_PATH}/

success "Files uploaded."

# 3. Run setup script on server
info "Running setup script on server..."
ssh ${USER}@${SERVER} << 'ENDSSH'
cd /var/www/mirastros-dev
chmod +x deployment/setup-dev-server.sh
bash deployment/setup-dev-server.sh
ENDSSH

success "Dev deployment completed!"
