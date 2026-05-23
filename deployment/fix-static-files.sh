#!/bin/bash

# Скрипт для исправления проблемы со статическими файлами

set -e

SERVER="109.196.100.104"
USER="root"
PASSWORD="hqpQDEoEB5_hnt"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo "🔧 Исправление проблемы со статическими файлами..."
echo ""

# Функция для выполнения команд на сервере
run_ssh() {
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=15 "$USER@$SERVER" "$@"
}

# 1. Проверка статуса Next.js серверов
info "Проверка статуса серверов..."
run_ssh "systemctl status mirastros-web mirastros-dev-web --no-pager | head -15" || true

# 2. Проверка существования статических файлов
info "Проверка статических файлов..."
run_ssh "echo '=== PRODUCTION ===' && ls -la /var/www/mirastros-universal/apps/web/.next/static/ 2>&1 | head -5 && echo '' && echo '=== DEV ===' && ls -la /var/www/mirastros-dev/apps/web/.next/static/ 2>&1 | head -5"

# 3. Проверка доступности Next.js серверов
info "Проверка доступности Next.js..."
run_ssh "echo 'Production:' && curl -I http://localhost:3000/ 2>&1 | head -3 && echo '' && echo 'Dev:' && curl -I http://localhost:3001/ 2>&1 | head -3"

# 4. Проверка статических файлов через Next.js
info "Проверка статики через Next.js..."
run_ssh "echo 'Production static:' && curl -I http://localhost:3000/_next/static/css/ 2>&1 | head -5 || echo 'Ошибка' && echo '' && echo 'Dev static:' && curl -I http://localhost:3001/_next/static/css/ 2>&1 | head -5 || echo 'Ошибка'"

# 5. Перезапуск сервисов
info "Перезапуск сервисов..."
run_ssh "systemctl restart mirastros-web mirastros-dev-web && sleep 5 && echo '✅ Сервисы перезапущены'"

# 6. Проверка логов
info "Проверка последних логов..."
run_ssh "echo '=== Production logs ===' && journalctl -u mirastros-web -n 10 --no-pager | tail -10 && echo '' && echo '=== Dev logs ===' && journalctl -u mirastros-dev-web -n 10 --no-pager | tail -10"

success "✅ Проверка завершена"





















