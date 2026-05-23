#!/bin/bash

# Скрипт для загрузки и деплоя на сервер
# Устойчив к разрывам соединения

set -e

SERVER="109.196.100.104"
USER="root"
PASSWORD="hqpQDEoEB5_hnt"
PROJECT_DIR="/Users/macbook/Desktop/mrstrs/mirastros-universal"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Функция для повторных попыток
retry_ssh() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$USER@$SERVER" "$@" 2>/dev/null; then
            return 0
        fi
        warn "Попытка $attempt из $max_attempts не удалась, повтор через 3 сек..."
        sleep 3
        attempt=$((attempt + 1))
    done
    return 1
}

retry_rsync() {
    local max_attempts=3
    local attempt=1
    local src=$1
    local dst=$2
    
    while [ $attempt -le $max_attempts ]; do
        if sshpass -p "$PASSWORD" rsync -avz --delete \
            --exclude 'node_modules' \
            --exclude '.next' \
            --exclude '.git' \
            --exclude '*.pyc' \
            --exclude '.DS_Store' \
            --exclude '*.log' \
            --exclude '.nx' \
            "$src" "$dst" 2>&1 | tail -5; then
            return 0
        fi
        warn "Попытка $attempt из $max_attempts не удалась, повтор через 3 сек..."
        sleep 3
        attempt=$((attempt + 1))
    done
    return 1
}

echo ""
echo "🚀 Загрузка и деплой на сервер..."
echo ""

cd "$PROJECT_DIR"

# 1. Загрузка на PRODUCTION
info "Загрузка файлов на PRODUCTION..."
if retry_rsync "apps/web/" "$USER@$SERVER:/var/www/mirastros-universal/apps/web/"; then
    success "PRODUCTION файлы загружены"
else
    error "Не удалось загрузить файлы на PRODUCTION"
    exit 1
fi

# 2. Загрузка на DEV
info "Загрузка файлов на DEV..."
if retry_rsync "apps/web/" "$USER@$SERVER:/var/www/mirastros-dev/apps/web/"; then
    success "DEV файлы загружены"
else
    error "Не удалось загрузить файлы на DEV"
    exit 1
fi

# 3. Пересборка PRODUCTION
info "Пересборка PRODUCTION..."
if retry_ssh "cd /var/www/mirastros-universal && export NODE_ENV=production && timeout 300 npx nx build web --prod 2>&1 | tail -10"; then
    success "PRODUCTION собран"
else
    error "Не удалось собрать PRODUCTION"
    exit 1
fi

# 4. Пересборка DEV
info "Пересборка DEV..."
if retry_ssh "cd /var/www/mirastros-dev && export NODE_ENV=production && timeout 300 npx nx build web --prod 2>&1 | tail -10"; then
    success "DEV собран"
else
    error "Не удалось собрать DEV"
    exit 1
fi

# 5. Перезапуск сервисов
info "Перезапуск сервисов..."
if retry_ssh "systemctl restart mirastros-web mirastros-dev-web && sleep 4 && systemctl is-active mirastros-web mirastros-dev-web"; then
    success "Сервисы перезапущены"
else
    error "Не удалось перезапустить сервисы"
    exit 1
fi

# 6. Проверка
info "Проверка работы..."
if retry_ssh "echo 'Production секций:' && curl -s http://localhost:3000/ | grep -o 'mira-section' | wc -l && echo 'Dev секций:' && curl -s http://localhost:3001/ | grep -o 'mira-section' | wc -l"; then
    success "✅ Деплой завершен успешно!"
else
    warn "Проверка не удалась, но деплой выполнен"
fi

echo ""
success "🎉 Все готово!"





















