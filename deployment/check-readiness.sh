#!/bin/bash

# Проверка готовности проекта к деплою

echo "🔍 Проверка готовности проекта к деплою"
echo "========================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

ERRORS=0

# 1. Проверка структуры проекта
echo "📁 Структура проекта:"
[ -d "apps/backend" ] && check 0 "apps/backend существует" || { check 1 "apps/backend НЕ найден"; ERRORS=$((ERRORS+1)); }
[ -f "apps/backend/requirements.txt" ] && check 0 "requirements.txt найден" || { check 1 "requirements.txt НЕ найден"; ERRORS=$((ERRORS+1)); }
[ -f "apps/backend/app/main.py" ] && check 0 "app/main.py найден" || { check 1 "app/main.py НЕ найден"; ERRORS=$((ERRORS+1)); }
[ -d "apps/backend/alembic" ] && check 0 "alembic найден" || { check 1 "alembic НЕ найден"; ERRORS=$((ERRORS+1)); }
echo ""

# 2. Проверка конфигурации
echo "⚙️  Конфигурация:"
[ -f "apps/backend/.env.example" ] && check 0 ".env.example найден" || warn ".env.example не найден (не критично)"
[ -f "deployment/nginx/mirastros.conf" ] && check 0 "nginx конфиг найден" || warn "nginx конфиг не найден"
[ -f "deployment/systemd/mirastros-backend.service" ] && check 0 "systemd сервис найден" || warn "systemd сервис не найден"
echo ""

# 3. Проверка Python зависимостей
echo "🐍 Python зависимости:"
if [ -f "apps/backend/requirements.txt" ]; then
    grep -q "fastapi" apps/backend/requirements.txt && check 0 "fastapi в requirements" || { check 1 "fastapi НЕ найден"; ERRORS=$((ERRORS+1)); }
    grep -q "uvicorn" apps/backend/requirements.txt && check 0 "uvicorn в requirements" || { check 1 "uvicorn НЕ найден"; ERRORS=$((ERRORS+1)); }
    grep -q "asyncpg" apps/backend/requirements.txt && check 0 "asyncpg в requirements" || { check 1 "asyncpg НЕ найден"; ERRORS=$((ERRORS+1)); }
    grep -q "alembic" apps/backend/requirements.txt && check 0 "alembic в requirements" || { check 1 "alembic НЕ найден"; ERRORS=$((ERRORS+1)); }
fi
echo ""

# 4. Проверка моделей
echo "📊 Модели базы данных:"
[ -f "apps/backend/app/models/__init__.py" ] && check 0 "models/__init__.py найден" || { check 1 "models/__init__.py НЕ найден"; ERRORS=$((ERRORS+1)); }
[ -f "apps/backend/app/models/user.py" ] && check 0 "User модель найдена" || warn "User модель не найдена"
echo ""

# 5. Проверка API endpoints
echo "🔌 API endpoints:"
[ -f "apps/backend/app/api/auth.py" ] && check 0 "auth.py найден" || warn "auth.py не найден"
[ -f "apps/backend/app/api/health.py" ] && check 0 "health.py найден" || warn "health.py не найден"
echo ""

# 6. Проверка deployment скриптов
echo "🚀 Deployment скрипты:"
[ -f "deployment/deploy-production.sh" ] && check 0 "deploy-production.sh найден" || warn "deploy-production.sh не найден"
[ -f "deployment/smart-deploy.sh" ] && check 0 "smart-deploy.sh найден" || warn "smart-deploy.sh не найден"
echo ""

# 7. Проверка документации
echo "📚 Документация:"
[ -f "deployment/README.md" ] && check 0 "README.md найден" || warn "README.md не найден"
[ -f "DEPLOY_QUICK.md" ] && check 0 "DEPLOY_QUICK.md найден" || warn "DEPLOY_QUICK.md не найден"
echo ""

# Итог
echo "========================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Проект готов к деплою!${NC}"
    echo ""
    echo "Следующие шаги:"
    echo "1. Подключитесь к серверу: ssh root@109.196.100.104"
    echo "2. Клонируйте проект: git clone YOUR_REPO /var/www/mirastros-universal"
    echo "3. Запустите деплой: cd /var/www/mirastros-universal && sudo bash deployment/smart-deploy.sh"
else
    echo -e "${RED}❌ Найдено $ERRORS критических ошибок${NC}"
    echo "Исправьте ошибки перед деплоем"
fi
echo "========================================"
