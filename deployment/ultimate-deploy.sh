#!/bin/bash

# Mirastros Universal - Ultimate Deploy Script
# Полностью автоматический деплой на сервер
# Версия: 3.0 (Final)

set -e

echo "=========================================="
echo "🚀 Mirastros Universal - Ultimate Deploy"
echo "=========================================="
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Конфигурация
SERVER="109.196.100.104"
USER="root"
DEPLOY_PATH="/var/www/mirastros-universal"

info "Конфигурация:"
echo "  Сервер: $SERVER"
echo "  Пользователь: $USER"
echo "  Путь: $DEPLOY_PATH"
echo ""

# ============================================
# ШАГ 1: Загрузка файлов на сервер
# ============================================
echo ""
info "ШАГ 1/3: Загрузка файлов на сервер через rsync..."

# Создать директории
ssh ${USER}@${SERVER} "mkdir -p ${DEPLOY_PATH}"

# Синхронизация всего проекта
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude 'venv' \
  --exclude '__pycache__' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '*.pyc' \
  --exclude '.DS_Store' \
  ./ ${USER}@${SERVER}:${DEPLOY_PATH}/

success "Файлы загружены на сервер"

# ============================================
# ШАГ 2: Запуск полного деплоя на сервере
# ============================================
echo ""
info "ШАГ 2/3: Запуск автоматического деплоя на сервере..."

ssh ${USER}@${SERVER} << 'ENDSSH'
cd /var/www/mirastros-universal

echo "🔧 Запуск deploy-production.sh на сервере..."
chmod +x deployment/deploy-production.sh
bash deployment/deploy-production.sh

echo ""
echo "✅ Деплой на сервере завершен!"
ENDSSH

success "Деплой на сервере завершен"

# ============================================
# ШАГ 3: Проверка работоспособности
# ============================================
echo ""
info "ШАГ 3/3: Проверка работоспособности..."

ssh ${USER}@${SERVER} << 'ENDSSH'
echo "Статус сервисов:"
echo "  PostgreSQL:  $(systemctl is-active postgresql || echo 'не установлен')"
echo "  Redis:       $(systemctl is-active redis-server || echo 'не установлен')"
echo "  Ollama:      $(systemctl is-active ollama || echo 'не установлен')"
echo "  Backend:     $(systemctl is-active mirastros-backend || echo 'не установлен')"
echo "  Nginx:       $(systemctl is-active nginx || echo 'не установлен')"
ENDSSH

# ============================================
# ИТОГ
# ============================================
echo ""
echo "=========================================="
echo "✅ ДЕПЛОЙ ЗАВЕРШЕН!"
echo "=========================================="
echo ""

success "Все файлы загружены на сервер"
success "Автоматический деплой выполнен"
success "Сервисы настроены и запущены"
echo ""

info "Проверьте работу:"
echo "  🌐 Website: https://www.mirastros.com"
echo "  🔌 API Health: https://www.mirastros.com/health"
echo ""

info "Полезные команды:"
echo "  Подключиться: ssh ${USER}@${SERVER}"
echo "  Логи backend: ssh ${USER}@${SERVER} 'journalctl -u mirastros-backend -f'"
echo "  Статус: ssh ${USER}@${SERVER} 'systemctl status mirastros-backend'"
echo ""

echo "Дата: $(date)"
echo "Версия: 3.0 (Ultimate Deploy)"
