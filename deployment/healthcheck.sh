#!/bin/bash
# Mirastros Health Check Script
# Проверяет работоспособность всех компонентов

echo "========================================="
echo "Mirastros Health Check"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend API
echo -n "Backend API: "
BACKEND_STATUS=$(curl -s http://localhost:8000/health | jq -r '.status' 2>/dev/null)
if [ "$BACKEND_STATUS" == "healthy" ]; then
    echo -e "${GREEN}✅ HEALTHY${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

# Frontend
echo -n "Frontend: "
FRONTEND_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ OK (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}❌ FAILED (HTTP $FRONTEND_STATUS)${NC}"
fi

# HTTPS
echo -n "HTTPS: "
HTTPS_STATUS=$(curl -s -o /dev/null -w '%{http_code}' https://www.mirastros.com)
if [ "$HTTPS_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ OK (HTTP $HTTPS_STATUS)${NC}"
else
    echo -e "${RED}❌ FAILED (HTTP $HTTPS_STATUS)${NC}"
fi

echo ""
echo "Services:"

# Backend Service
echo -n "  mirastros-backend: "
if systemctl is-active --quiet mirastros-backend; then
    echo -e "${GREEN}✅ RUNNING${NC}"
else
    echo -e "${RED}❌ STOPPED${NC}"
fi

# Frontend Service
echo -n "  mirastros-web: "
if systemctl is-active --quiet mirastros-web; then
    echo -e "${GREEN}✅ RUNNING${NC}"
else
    echo -e "${RED}❌ STOPPED${NC}"
fi

# Nginx
echo -n "  nginx: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ RUNNING${NC}"
else
    echo -e "${RED}❌ STOPPED${NC}"
fi

# PostgreSQL
echo -n "  postgresql: "
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ RUNNING${NC}"
else
    echo -e "${RED}❌ STOPPED${NC}"
fi

# Redis
echo -n "  redis: "
if systemctl is-active --quiet redis-server; then
    echo -e "${GREEN}✅ RUNNING${NC}"
else
    echo -e "${RED}❌ STOPPED${NC}"
fi

# Ollama
echo -n "  ollama: "
if systemctl is-active --quiet ollama; then
    echo -e "${GREEN}✅ RUNNING${NC}"
else
    echo -e "${RED}❌ STOPPED${NC}"
fi

echo ""
echo "Resources:"

# Disk
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
echo -n "  Disk: "
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ ${DISK_USAGE}% used${NC}"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠️  ${DISK_USAGE}% used${NC}"
else
    echo -e "${RED}❌ ${DISK_USAGE}% used${NC}"
fi

# Memory
MEM_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
echo -n "  Memory: "
if [ "$MEM_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ ${MEM_USAGE}% used${NC}"
elif [ "$MEM_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠️  ${MEM_USAGE}% used${NC}"
else
    echo -e "${RED}❌ ${MEM_USAGE}% used${NC}"
fi

# Load Average
LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
echo "  Load: $LOAD"

# SSL Certificate
echo -n "  SSL: "
SSL_EXPIRY=$(openssl s_client -connect www.mirastros.com:443 -servername www.mirastros.com </dev/null 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$SSL_EXPIRY" ]; then
    echo -e "${GREEN}✅ Valid until $SSL_EXPIRY${NC}"
else
    echo -e "${YELLOW}⚠️  Could not check${NC}"
fi

echo ""
echo "========================================="
echo "Health Check Complete"
echo "========================================="
