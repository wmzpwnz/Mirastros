#!/bin/bash

# Mirastros Universal - Database Setup Script
# Task 14.6: Configure database
# Creates PostgreSQL database, installs pgvector, runs migrations

set -e  # Exit on error

echo "=========================================="
echo "Mirastros Universal - Database Setup"
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

DB_NAME="mirastros"
DB_USER="mirastros"
DB_PASSWORD=$(openssl rand -base64 32)  # Generate random password

print_info "Setting up PostgreSQL database..."
echo ""

# Install pgvector extension
print_info "Installing pgvector extension..."
apt install -y postgresql-15-pgvector
print_status "pgvector extension installed"
echo ""

# Create database and user
print_info "Creating database and user..."
sudo -u postgres psql << EOF
-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to database and enable extensions
\c $DB_NAME

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO $DB_USER;

EOF

if [ $? -eq 0 ]; then
    print_status "Database and user created successfully"
else
    print_error "Failed to create database"
    exit 1
fi
echo ""

# Save database credentials
print_info "Saving database credentials..."
cat > /root/.mirastros_db_credentials << EOF
# Mirastros Database Credentials
# Generated: $(date)

DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Connection string
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
EOF

chmod 600 /root/.mirastros_db_credentials
print_status "Credentials saved to /root/.mirastros_db_credentials"
echo ""

# Configure PostgreSQL for production
print_info "Configuring PostgreSQL for production..."

# Backup original config
cp /etc/postgresql/15/main/postgresql.conf /etc/postgresql/15/main/postgresql.conf.backup

# Update PostgreSQL configuration
cat >> /etc/postgresql/15/main/postgresql.conf << 'EOF'

# Mirastros Production Settings
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
EOF

# Restart PostgreSQL
systemctl restart postgresql
print_status "PostgreSQL configured and restarted"
echo ""

# Test database connection
print_info "Testing database connection..."
sudo -u postgres psql -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Database connection test passed"
else
    print_error "Database connection test failed"
    exit 1
fi
echo ""

# Run migrations (if backend is deployed)
if [ -d "/var/www/mirastros/backend" ]; then
    print_info "Running database migrations..."
    cd /var/www/mirastros/backend
    
    # Create .env file with database credentials
    cat > .env << EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
EOF
    
    # Run migrations as mirastros user
    sudo -u mirastros bash << 'MIGRATIONS'
    source venv/bin/activate
    alembic upgrade head
MIGRATIONS
    
    if [ $? -eq 0 ]; then
        print_status "Database migrations completed"
    else
        print_error "Database migrations failed"
    fi
    echo ""
else
    print_info "Backend not deployed yet, skipping migrations"
    print_info "Run migrations manually after deploying backend:"
    echo "  cd /var/www/mirastros/backend"
    echo "  source venv/bin/activate"
    echo "  alembic upgrade head"
    echo ""
fi

# Summary
echo ""
echo "=========================================="
echo "Database Setup Complete!"
echo "=========================================="
echo ""
print_status "PostgreSQL database created: $DB_NAME"
print_status "Database user created: $DB_USER"
print_status "pgvector extension enabled"
print_status "uuid-ossp extension enabled"
print_status "PostgreSQL configured for production"
echo ""
print_info "Database credentials:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
print_info "Connection string:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
print_info "Credentials saved to: /root/.mirastros_db_credentials"
echo ""
print_info "Add to backend .env file:"
echo "  DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
