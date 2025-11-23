#!/bin/bash

# Setup Redis (native, no Docker) for Mirastros
# Run this script on the VPS (31.130.145.75 / mirastros.com)

set -e

echo "🔴 Setting up Redis..."

# Install Redis
echo "📦 Installing Redis..."
sudo apt update
sudo apt install -y redis-server

# Configure Redis for production
echo "⚙️  Configuring Redis..."
sudo tee /etc/redis/redis.conf > /dev/null <<EOF
# Network
bind 127.0.0.1 ::1
protected-mode yes
port 6379

# General
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log

# Snapshotting
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis

# Replication
replica-serve-stale-data yes
replica-read-only yes

# Security
# requirepass your_redis_password_here

# Limits
maxmemory 256mb
maxmemory-policy allkeys-lru

# Append only mode
appendonly no
EOF

# Enable and start Redis
echo "🚀 Starting Redis service..."
sudo systemctl enable redis-server
sudo systemctl restart redis-server

# Check Redis status
echo "✅ Checking Redis status..."
sudo systemctl status redis-server --no-pager

# Test Redis connection
echo "🧪 Testing Redis connection..."
redis-cli ping

echo ""
echo "✅ Redis setup complete!"
echo ""
echo "Redis connection string:"
echo "redis://localhost:6379/0"
echo ""
echo "⚠️  IMPORTANT: For production, uncomment and set 'requirepass' in /etc/redis/redis.conf"
echo "⚠️  Update REDIS_URL in .env file if password is set"
