#!/bin/bash

# Mirastros Universal - Умный деплой
# Автоматически определяет, что нужно установить

set -e

echo "🚀 Mirastros Universal - Умный деплой"
echo "======================================"
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${YELLOW}ℹ️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Проверка root
if [ "$EUID" -ne 0 ]; then 
    error "Запустите с sudo: sudo bash smart-deploy.sh"
    exit 1
fi

# Функция проверки сервиса
check_service() {
    if systemctl is-active --quiet $1; then
        success "$1 уже работает"
        return 0
    else
        info "$1 не установлен, устанавливаем..."
        return 1
    fi
}

# Функция проверки команды
check_command() {
    if command -v $1 &> /dev/null; then
        success "$1 уже установлен"
        return 0
    else
        info "$1 не установлен, устанавливаем..."
        return 1
    fi
}

echo "📋 Проверка системы..."
echo ""

# 1. PostgreSQL
if ! check_service postgresql; then
    apt update
    apt install -y postgresql postgresql-contrib postgresql-server-dev-all
    systemctl enable postgresql
    systemctl start postgresql
    
    # Установить pgvector
    cd /tmp
    git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
    cd pgvector
    make && make install
    
    # Создать БД
    DB_PASS=$(openssl rand -hex 16)
    sudo -u postgres psql <<EOF
CREATE DATABASE mirastros;
CREATE USER mirastros WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE mirastros TO mirastros;
\c mirastros
CREATE EXTENSION IF NOT EXISTS vector;
EOF
    echo "DB_PASSWORD=$DB_PASS" > /root/.mirastros_db_pass
    success "PostgreSQL установлен (пароль: $DB_PASS)"
else
    DB_PASS=$(cat /root/.mirastros_db_pass 2>/dev/null | cut -d'=' -f2 || echo "mirastros_2024")
fi

# 2. Redis
if ! check_service redis-server; then
    apt install -y redis-server
    systemctl enable redis-server
    systemctl start redis-server
fi

# 3. Nginx
if ! check_service nginx; then
    apt install -y nginx certbot python3-certbot-nginx
    systemctl enable nginx
    systemctl start nginx
fi

# 4. Python
if ! check_command python3; then
    apt install -y python3 python3-pip python3-venv
fi

# 5. Ollama
if ! check_command ollama; then
    curl -fsSL https://ollama.com/install.sh | sh
    systemctl enable ollama
    systemctl start ollama
    sleep 5
    
    info "Скачивание AI модели (5-10 минут)..."
    ollama pull qwen2.5:7b-instruct-q4_K_M
    
    cat > /tmp/Modelfile <<'EOF'
FROM qwen2.5:7b-instruct-q4_K_M
PARAMETER temperature 0.7
SYSTEM You are Mirastros, a mystical AI oracle specializing in astrology, tarot, and esoteric wisdom.
EOF
    ollama create mirastros-ai -f /tmp/Modelfile
fi

echo ""
echo "📦 Настройка проекта..."
echo ""

# Проверить, есть ли проект
if [ ! -d "/var/www/mirastros-universal" ]; then
    error "Проект не найден в /var/www/mirastros-universal"
    info "Клонируйте проект:"
    echo "  cd /var/www"
    echo "  git clone YOUR_REPO_URL mirastros-universal"
    exit 1
fi

cd /var/www/mirastros-universal/apps/backend

# Создать venv если нет
if [ ! -d "venv" ]; then
    info "Создание виртуального окружения..."
    python3 -m venv venv
fi

# Установить зависимости
info "Установка зависимостей..."
venv/bin/pip install -q --upgrade pip
venv/bin/pip install -q -r requirements.txt

# Создать .env если нет
if [ ! -f ".env" ]; then
    info "Создание .env файла..."
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    
    cat > .env <<EOF
DATABASE_URL=postgresql+asyncpg://mirastros:${DB_PASS}@localhost:5432/mirastros
REDIS_URL=redis://localhost:6379/0
OLLAMA_URL=http://localhost:11434
MODEL_NAME=mirastros-ai
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["https://www.mirastros.com","https://mirastros.com"]
ENVIRONMENT=production
ADMIN_EMAILS=["admin@mirastros.com"]
EOF
    success ".env создан"
fi

# Запустить миграции
info "Запуск миграций..."
venv/bin/alembic upgrade head

# Создать systemd сервис
if [ ! -f "/etc/systemd/system/mirastros-backend.service" ]; then
    info "Создание systemd сервиса..."
    cat > /etc/systemd/system/mirastros-backend.service <<EOF
[Unit]
Description=Mirastros Backend API
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/mirastros-universal/apps/backend
Environment="PATH=/var/www/mirastros-universal/apps/backend/venv/bin"
ExecStart=/var/www/mirastros-universal/apps/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable mirastros-backend
fi

# Перезапустить backend
info "Перезапуск backend..."
systemctl restart mirastros-backend

# Настроить Nginx если нужно
if [ ! -f "/etc/nginx/sites-enabled/mirastros" ]; then
    info "Настройка Nginx..."
    cat > /etc/nginx/sites-available/mirastros <<'EOF'
server {
    listen 80;
    server_name www.mirastros.com mirastros.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    ln -sf /etc/nginx/sites-available/mirastros /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
fi

# SSL сертификат
if [ ! -d "/etc/letsencrypt/live/www.mirastros.com" ]; then
    info "Получение SSL сертификата..."
    certbot --nginx -d www.mirastros.com -d mirastros.com \
        --non-interactive --agree-tos --email admin@mirastros.com || true
fi

echo ""
echo "======================================"
echo "🎉 ДЕПЛОЙ ЗАВЕРШЕН!"
echo "======================================"
echo ""

# Проверка статуса
echo "📊 Статус сервисов:"
echo "  PostgreSQL:  $(systemctl is-active postgresql)"
echo "  Redis:       $(systemctl is-active redis-server)"
echo "  Ollama:      $(systemctl is-active ollama)"
echo "  Backend:     $(systemctl is-active mirastros-backend)"
echo "  Nginx:       $(systemctl is-active nginx)"
echo ""

echo "🌐 URLs:"
echo "  API:    https://www.mirastros.com"
echo "  Health: https://www.mirastros.com/health"
echo "  Docs:   https://www.mirastros.com/docs"
echo ""

echo "🔧 Полезные команды:"
echo "  Логи:       journalctl -u mirastros-backend -f"
echo "  Перезапуск: systemctl restart mirastros-backend"
echo "  Статус:     systemctl status mirastros-backend"
echo ""

success "Готово! 🚀"
