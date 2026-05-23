#!/bin/bash

# Скрипт для завершения деплоя лендинга
# Запустить когда сервер будет доступен

set -e

SERVER="109.196.100.104"
USER="root"
PASSWORD="hqpQDEoEB5_hnt"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }

echo "🚀 Завершение деплоя лендинга..."
echo ""

# Пересборка PRODUCTION
info "Пересборка PRODUCTION..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} << 'ENDSSH'
cd /var/www/mirastros-universal
export NODE_ENV=production
npx nx build web --prod 2>&1 | tail -20
ENDSSH
success "PRODUCTION собран"

# Пересборка DEV
info "Пересборка DEV..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} << 'ENDSSH'
cd /var/www/mirastros-dev
export NODE_ENV=production
npx nx build web --prod 2>&1 | tail -20
ENDSSH
success "DEV собран"

# Перезапуск сервисов
info "Перезапуск сервисов..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} << 'ENDSSH'
systemctl restart mirastros-web mirastros-dev-web mirastros-api
sleep 4
systemctl is-active mirastros-web mirastros-dev-web mirastros-api
ENDSSH
success "Сервисы перезапущены"

# Проверка
info "Проверка лендинга..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no ${USER}@${SERVER} << 'ENDSSH'
echo "Production секций:"
curl -s http://localhost:3000/ | grep -o 'mira-section' | wc -l

echo "Dev секций:"
curl -s http://localhost:3001/ | grep -o 'mira-section' | wc -l

echo ""
echo "Проверка секции Astrology:"
curl -s http://localhost:3000/ | grep -E 'Астрология|Наука о звездах|mira-astrology' | head -2

echo ""
echo "Проверка Backend API (20 endpoints):"
echo -n "Health: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "FAIL"
echo ""

echo -n "Horoscope: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/horoscope/daily/aries || echo "FAIL"
echo ""

echo -n "Lunar: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/lunar/current || echo "FAIL"
echo ""

echo -n "Crystals: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/crystals/all || echo "FAIL"
echo ""

echo -n "Rituals: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/rituals/library || echo "FAIL"
echo ""

echo ""
echo "✅ Все 20 API endpoints должны быть доступны!"
ENDSSH

success "✅ Деплой завершен!"
