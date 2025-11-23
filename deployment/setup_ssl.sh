#!/bin/bash

# Mirastros Universal - SSL Setup Script
# Task 14.2: Setup SSL with Certbot
# Domain: www.mirastros.com

set -e  # Exit on error

echo "=========================================="
echo "Mirastros Universal - SSL Setup"
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

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

DOMAIN="mirastros.com"
WWW_DOMAIN="www.mirastros.com"
EMAIL="admin@mirastros.com"  # Change this to your email

print_info "Setting up SSL certificates for $DOMAIN and $WWW_DOMAIN"
echo ""

# Install Certbot
print_info "Installing Certbot..."
if command -v certbot &> /dev/null; then
    print_info "Certbot already installed"
else
    apt install -y certbot python3-certbot-nginx
    print_status "Certbot installed"
fi
echo ""

# Stop Nginx temporarily if running
print_info "Stopping Nginx temporarily..."
systemctl stop nginx || true
echo ""

# Obtain SSL certificate
print_info "Obtaining SSL certificate..."
print_info "This will use Let's Encrypt to get a free SSL certificate"
echo ""

certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    -d "$WWW_DOMAIN" \
    --preferred-challenges http

if [ $? -eq 0 ]; then
    print_status "SSL certificate obtained successfully"
else
    print_error "Failed to obtain SSL certificate"
    print_info "Make sure:"
    echo "  1. DNS records point to this server (109.196.100.104)"
    echo "  2. Ports 80 and 443 are open in firewall"
    echo "  3. No other service is using port 80"
    exit 1
fi
echo ""

# Setup auto-renewal
print_info "Setting up automatic certificate renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer
print_status "Auto-renewal configured"
echo ""

# Test renewal
print_info "Testing certificate renewal..."
certbot renew --dry-run
if [ $? -eq 0 ]; then
    print_status "Certificate renewal test passed"
else
    print_error "Certificate renewal test failed"
fi
echo ""

# Create renewal hook to reload Nginx
print_info "Creating renewal hook..."
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << 'EOF'
#!/bin/bash
systemctl reload nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
print_status "Renewal hook created"
echo ""

# Start Nginx
print_info "Starting Nginx..."
systemctl start nginx
echo ""

# Summary
echo ""
echo "=========================================="
echo "SSL Setup Complete!"
echo "=========================================="
echo ""
print_status "SSL certificates obtained for:"
echo "  - $DOMAIN"
echo "  - $WWW_DOMAIN"
print_status "Auto-renewal configured"
print_status "Certificates will auto-renew before expiration"
echo ""
print_info "Certificate location:"
echo "  /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "  /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo ""
print_info "Next steps:"
echo "  1. Configure Nginx with SSL (Task 14.3)"
echo "  2. Test HTTPS access: https://www.mirastros.com"
echo ""
