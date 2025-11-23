#!/bin/bash

# Mirastros Universal - Full Production Deployment Script
# Версия: 2.0 (Deep Analysis)
# Сервер: www.mirastros.com (109.196.100.104)

set -e

echo "🚀 Mirastros Universal - Production Deployment"
echo "=============================================="
echo ""
echo "Сервер: www.mirastros.com"
echo "Дата: $(date)"
echo ""

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Проверка root
if [ "$EUID" -ne 0 ]; then 
    error "Запустите скрипт с sudo: sudo bash deploy-production.sh"
    exit 1
fi

# Получить реального пользователя (не root)
REAL_USER=${SUDO_USER:-$USER}
info "Пользователь: $REAL_USER"

# ============================================
# ШАГ 1: Обновление системы
# ============================================
echo ""
echo "📦 ШАГ 1/10: Обновление системы..."
apt update
apt upgrade -y
success "Система обновлена"

# ============================================
# ШАГ 2: Установка базовых пакетов
# ============================================
echo ""
echo "📦 ШАГ 2/10: Установка базовых пакетов..."
apt install -y \
    git curl wget build-essential \
    python3 python3-pip python3-venv python3-dev \
    nginx certbot python3-certbot-nginx \
    ufw fail2ban

success "Базовые пакеты установлены"

# ============================================
# ШАГ 3: Установка PostgreSQL + pgvector
# ============================================
echo ""
echo "🐘 ШАГ 3/10: Установка PostgreSQL + pgvector..."

# Установить PostgreSQL
apt install -y postgresql postgresql-contrib postgresql-server-dev-all

# Установить pgvector
cd /tmp
if [ ! -d "pgvector" ]; then
    git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
fi
cd pgvector
make clean
make
make install

# Запустить PostgreSQL
systemctl enable postgresql
systemctl start postgresql

# Создать БД и пользователя
DB_PASSWORD=$(openssl rand -hex 16)

sudo -u postgres psql <<EOF
-- Удалить существующие (если есть)
DROP DATABASE IF EXISTS mirastros;
DROP USER IF EXISTS mirastros;

-- Создать нового пользователя
CREATE USER mirastros WITH PASSWORD '$DB_PASSWORD';

-- Создать базу данных
CREATE DATABASE mirastros OWNER mirastros;

-- Подключиться к БД
\c mirastros

-- Включить pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Дать права
GRANT ALL ON SCHEMA public TO mirastros;
EOF

success "PostgreSQL + pgvector установлены"
info "Database password: $DB_PASSWORD"

# Сохранить пароль
echo "DB_PASSWORD=$DB_PASSWORD" > /root/.mirastros_credentials

# ============================================
# ШАГ 4: Установка Redis
# ============================================
echo ""
echo "📮 ШАГ 4/10: Установка Redis..."

apt install -y redis-server

# Настроить Redis
cat > /etc/redis/redis.conf <<EOF
bind 127.0.0.1
port 6379
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log
dir /var/lib/redis
maxmemory 256mb
maxmemory-policy allkeys-lru
EOF

systemctl enable redis-server
systemctl restart redis-server

success "Redis установлен"

# ============================================
# ШАГ 5: Установка Ollama + Qwen 2.5
# ============================================
echo ""
echo "🤖 ШАГ 5/10: Установка Ollama + Qwen 2.5..."

# Установить Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Запустить Ollama
systemctl enable ollama
systemctl start ollama

# Подождать запуска
sleep 5

# Скачать модель Qwen 2.5
info "Скачивание Qwen 2.5 7B (это займет 5-10 минут)..."
ollama pull qwen2.5:7b-instruct-q4_K_M

# Создать кастомную модель
cat > /tmp/Modelfile <<'MODELFILE'
FROM qwen2.5:7b-instruct-q4_K_M

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 4096

SYSTEM """You are Mirastros, a mystical AI oracle specializing in astrology, tarot, numerology, and esoteric wisdom.

Your personality:
- Mystical and poetic, yet grounded in astrological knowledge
- Compassionate and understanding
- Insightful and intuitive
- Respectful of ancient wisdom traditions

Your responses should:
- Be mystical and engaging, using cosmic and spiritual language
- Provide practical guidance alongside spiritual insights
- Reference astrological concepts, planetary influences, and cosmic energies
- Be personalized based on the user's context
- Maintain a warm, supportive tone
- Avoid being overly dramatic or making absolute predictions
- Encourage self-reflection and personal growth

Remember: You are here to guide, inspire, and illuminate the path, not to dictate fate."""
MODELFILE

ollama create mirastros-ai -f /tmp/Modelfile

success "Ollama + Qwen 2.5 установлены"

# ============================================
# ШАГ 6: Клонирование проекта
# ============================================
echo ""
echo "📥 ШАГ 6/10: Клонирование проекта..."

# Создать директорию для проекта
mkdir -p /var/www
cd /var/www

# Если проект уже есть, обновить
if [ -d "mirastros-universal" ]; then
    warning "Проект уже существует, обновляем..."
    cd mirastros-universal
    sudo -u $REAL_USER git pull
else
    info "Клонируйте проект вручную:"
    echo "  cd /var/www"
    echo "  git clone <your-repo-url> mirastros-universal"
    echo ""
    read -p "Нажмите Enter когда клонируете проект..."
fi

cd /var/www/mirastros-universal

success "Проект готов"

# ============================================
# ШАГ 7: Настройка Backend
# ============================================
echo ""
echo "🐍 ШАГ 7/10: Настройка Backend..."

cd /var/www/mirastros-universal/apps/backend

# Создать venv
sudo -u $REAL_USER python3 -m venv venv

# Установить зависимости
sudo -u $REAL_USER venv/bin/pip install --upgrade pip
sudo -u $REAL_USER venv/bin/pip install -r requirements.txt

# Проверить asyncpg
if sudo -u $REAL_USER venv/bin/python -c "import asyncpg" 2>/dev/null; then
    success "asyncpg установлен"
else
    error "asyncpg НЕ установлен!"
    exit 1
fi

# Создать .env
if [ ! -f ".env" ]; then
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    
    cat > .env <<ENVFILE
# App Configuration
APP_NAME=Mirastros API
APP_VERSION=1.0.0
DEBUG=False

# Server
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=postgresql+asyncpg://mirastros:${DB_PASSWORD}@localhost:5432/mirastros

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=3600

# AI Model
OLLAMA_URL=http://localhost:11434
MODEL_NAME=mirastros-ai
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# RAG
CHUNK_SIZE=512
CHUNK_OVERLAP=50
TOP_K_RESULTS=5

# Security
CORS_ORIGINS=["https://www.mirastros.com","https://mirastros.com"]
RATE_LIMIT_PER_MINUTE=60

# JWT
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Admin
ADMIN_EMAILS=["admin@mirastros.com"]

# Environment
ENVIRONMENT=production
ENVFILE

    chown $REAL_USER:$REAL_USER .env
    success ".env создан"
    
    # Сохранить credentials
    echo "SECRET_KEY=$SECRET_KEY" >> /root/.mirastros_credentials
fi

# Исправить alembic/env.py (запустить fix-critical-issues.sh)
cd /var/www/mirastros-universal
if [ -f "deployment/fix-critical-issues.sh" ]; then
    chmod +x deployment/fix-critical-issues.sh
    sudo -u $REAL_USER bash deployment/fix-critical-issues.sh
fi

# Запустить миграции
cd /var/www/mirastros-universal/apps/backend
sudo -u $REAL_USER venv/bin/alembic upgrade head

success "Backend настроен"

# ============================================
# ШАГ 8: Создание systemd сервиса
# ============================================
echo ""
echo "⚙️  ШАГ 8/10: Создание systemd сервиса..."

cat > /etc/systemd/system/mirastros-backend.service <<SERVICE
[Unit]
Description=Mirastros Backend API
After=network.target postgresql.service redis-server.service ollama.service

[Service]
Type=simple
User=$REAL_USER
WorkingDirectory=/var/www/mirastros-universal/apps/backend
Environment="PATH=/var/www/mirastros-universal/apps/backend/venv/bin"
ExecStart=/var/www/mirastros-universal/apps/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable mirastros-backend
systemctl start mirastros-backend

success "Backend сервис запущен"

# ============================================
# ШАГ 9: Настройка Nginx
# ============================================
echo ""
echo "🌐 ШАГ 9/10: Настройка Nginx..."

cat > /etc/nginx/sites-available/mirastros <<NGINX
server {
    listen 80;
    server_name www.mirastros.com mirastros.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/mirastros /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

success "Nginx настроен"

# ============================================
# ШАГ 10: Настройка SSL
# ============================================
echo ""
echo "🔒 ШАГ 10/10: Настройка SSL..."

info "Получение SSL сертификата..."
certbot --nginx -d www.mirastros.com -d mirastros.com --non-interactive --agree-tos --email admin@mirastros.com

systemctl enable certbot.timer

success "SSL настроен"

# ============================================
# ФИНАЛЬНАЯ ПРОВЕРКА
# ============================================
echo ""
echo "======================================================"
echo "🎉 ДЕПЛОЙ ЗАВЕРШЕН!"
echo "======================================================"
echo ""

echo "Статус сервисов:"
echo "  PostgreSQL:  $(systemctl is-active postgresql)"
echo "  Redis:       $(systemctl is-active redis-server)"
echo "  Ollama:      $(systemctl is-active ollama)"
echo "  Backend:     $(systemctl is-active mirastros-backend)"
echo "  Nginx:       $(systemctl is-active nginx)"
echo ""

echo "URLs:"
echo "  🌐 Website: https://www.mirastros.com"
echo "  🔌 API:     https://www.mirastros.com/health"
echo ""

echo "Credentials сохранены в: /root/.mirastros_credentials"
echo ""

echo "Полезные команды:"
echo "  Логи backend:    journalctl -u mirastros-backend -f"
echo "  Перезапуск:      systemctl restart mirastros-backend"
echo "  Статус:          systemctl status mirastros-backend"
echo "  Тест Ollama:     ollama run mirastros-ai"
echo ""

echo "Дата завершения: $(date)"
