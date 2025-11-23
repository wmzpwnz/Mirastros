#!/bin/bash

# Mirastros Universal - VPS Environment Setup Script
# Task 14.1: Setup VPS environment
# Server: 109.196.100.104
# Domain: www.mirastros.com

set -e  # Exit on error

echo "=========================================="
echo "Mirastros Universal - VPS Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

print_info "Starting VPS environment setup..."
echo ""

# Update system packages
print_info "Updating system packages..."
apt update && apt upgrade -y
print_status "System packages updated"
echo ""

# Install essential tools
print_info "Installing essential tools..."
apt install -y curl wget git build-essential software-properties-common ufw
print_status "Essential tools installed"
echo ""

# Create mirastros user
print_info "Creating mirastros user..."
if id "mirastros" &>/dev/null; then
    print_info "User 'mirastros' already exists"
else
    useradd -m -s /bin/bash mirastros
    usermod -aG sudo mirastros
    print_status "User 'mirastros' created and added to sudo group"
fi
echo ""

# Install Node.js (v20 LTS)
print_info "Installing Node.js v20 LTS..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_info "Node.js already installed: $NODE_VERSION"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    print_status "Node.js installed: $(node -v)"
fi
echo ""

# Install Python 3.11+
print_info "Installing Python 3.11..."
if command -v python3.11 &> /dev/null; then
    PYTHON_VERSION=$(python3.11 --version)
    print_info "Python 3.11 already installed: $PYTHON_VERSION"
else
    add-apt-repository -y ppa:deadsnakes/ppa
    apt update
    apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
    print_status "Python 3.11 installed: $(python3.11 --version)"
fi
echo ""

# Install PostgreSQL 15
print_info "Installing PostgreSQL 15..."
if command -v psql &> /dev/null; then
    POSTGRES_VERSION=$(psql --version)
    print_info "PostgreSQL already installed: $POSTGRES_VERSION"
else
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    apt update
    apt install -y postgresql-15 postgresql-contrib-15
    systemctl enable postgresql
    systemctl start postgresql
    print_status "PostgreSQL 15 installed and started"
fi
echo ""

# Install Redis
print_info "Installing Redis..."
if command -v redis-server &> /dev/null; then
    REDIS_VERSION=$(redis-server --version)
    print_info "Redis already installed: $REDIS_VERSION"
else
    apt install -y redis-server
    systemctl enable redis-server
    systemctl start redis-server
    print_status "Redis installed and started"
fi
echo ""

# Install Nginx
print_info "Installing Nginx..."
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1)
    print_info "Nginx already installed: $NGINX_VERSION"
else
    apt install -y nginx
    systemctl enable nginx
    print_status "Nginx installed and enabled"
fi
echo ""

# Configure UFW firewall
print_info "Configuring UFW firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
print_status "UFW firewall configured"
echo ""

# Create application directories
print_info "Creating application directories..."
mkdir -p /var/www/mirastros
mkdir -p /var/log/mirastros
chown -R mirastros:mirastros /var/www/mirastros
chown -R mirastros:mirastros /var/log/mirastros
print_status "Application directories created"
echo ""

# Install PM2 for Node.js process management
print_info "Installing PM2..."
if command -v pm2 &> /dev/null; then
    print_info "PM2 already installed"
else
    npm install -g pm2
    pm2 startup systemd -u mirastros --hp /home/mirastros
    print_status "PM2 installed"
fi
echo ""

# Summary
echo ""
echo "=========================================="
echo "VPS Environment Setup Complete!"
echo "=========================================="
echo ""
print_status "System packages updated"
print_status "User 'mirastros' created"
print_status "Node.js $(node -v) installed"
print_status "Python $(python3.11 --version | cut -d' ' -f2) installed"
print_status "PostgreSQL installed and running"
print_status "Redis installed and running"
print_status "Nginx installed and enabled"
print_status "UFW firewall configured"
print_status "Application directories created"
print_status "PM2 process manager installed"
echo ""
print_info "Next steps:"
echo "  1. Set password for mirastros user: passwd mirastros"
echo "  2. Configure PostgreSQL database (Task 14.6)"
echo "  3. Setup SSL certificates (Task 14.2)"
echo "  4. Configure Nginx (Task 14.3)"
echo "  5. Setup Ollama and AI model (Task 14.5)"
echo ""
print_info "Server: 109.196.100.104"
print_info "Domain: www.mirastros.com"
echo ""
