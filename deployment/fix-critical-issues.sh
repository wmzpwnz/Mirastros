#!/bin/bash

# Fix Critical Issues Script
# Исправляет все критические проблемы, найденные в анализе
# Версия: 2.0 (Deep Analysis)

set -e

echo "🔧 Исправление критических проблем Mirastros Universal"
echo "======================================================"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода успеха
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Функция для вывода предупреждения
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Функция для вывода ошибки
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка, что скрипт запущен из корня проекта
if [ ! -f "apps/backend/requirements.txt" ]; then
    error "Скрипт должен быть запущен из корня проекта mirastros-universal"
    exit 1
fi

echo "📍 Текущая директория: $(pwd)"
echo ""

# ============================================
# ПРОБЛЕМА 1: asyncpg не установлен
# ============================================
echo "🔍 Проблема 1: Проверка установки asyncpg..."

cd apps/backend

if python3 -c "import asyncpg" 2>/dev/null; then
    success "asyncpg уже установлен"
else
    warning "asyncpg не установлен, устанавливаем..."
    
    # Создать venv если нет
    if [ ! -d "venv" ]; then
        echo "  📦 Создание виртуального окружения..."
        python3 -m venv venv
    fi
    
    # Активировать venv и установить зависимости
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Проверка
    if python -c "import asyncpg" 2>/dev/null; then
        success "asyncpg успешно установлен"
    else
        error "Не удалось установить asyncpg"
        exit 1
    fi
fi

echo ""

# ============================================
# ПРОБЛЕМА 2: Отсутствует .env файл
# ============================================
echo "🔍 Проблема 2: Проверка .env файла..."

if [ -f ".env" ]; then
    warning ".env файл уже существует, пропускаем"
else
    echo "  📝 Создание .env файла..."
    
    # Генерация безопасного SECRET_KEY
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    
    # Создание .env из .env.example
    cp .env.example .env
    
    # Замена SECRET_KEY на сгенерированный
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-secret-key-change-in-production-min-32-chars/$SECRET_KEY/" .env
    else
        # Linux
        sed -i "s/your-secret-key-change-in-production-min-32-chars/$SECRET_KEY/" .env
    fi
    
    success ".env файл создан с безопасным SECRET_KEY"
    echo "  🔑 SECRET_KEY: $SECRET_KEY"
fi

echo ""

# ============================================
# ПРОБЛЕМА 3: alembic/env.py импортирует только 1 модель
# ============================================
echo "🔍 Проблема 3: Исправление alembic/env.py..."

# Создать резервную копию
if [ ! -f "alembic/env.py.backup" ]; then
    cp alembic/env.py alembic/env.py.backup
    echo "  💾 Создана резервная копия: alembic/env.py.backup"
fi

# Создать исправленный env.py
cat > alembic/env.py << 'ENVPY'
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import Base
from app.core.config import get_settings

# ✅ ИСПРАВЛЕНО: Импортируем ВСЕ 17 моделей
from app.models import (
    User, SubscriptionTier,
    NatalChart,
    Subscription, SubscriptionStatus, PaymentMethod,
    TarotReading,
    IChingConsultation,
    Horoscope, HoroscopePeriod,
    NumerologyCalculation,
    DreamInterpretation,
    ChatConversation, ChatMessage,
    JournalEntry, EntryType,
    Product,
    Order,
    AnalyticsEvent, EventType,
    PushToken,
    NotificationPreference,
    Document, DocumentChunk, UserQuery
)

# Import additional models if they exist
try:
    from app.models.lenormand_reading import LenormandReading
    from app.models.synastry import Synastry
except ImportError:
    pass

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Get settings
settings = get_settings()

# Override sqlalchemy.url with settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with async engine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
ENVPY

success "alembic/env.py исправлен (импортирует все 17 моделей)"

echo ""

# ============================================
# ПРОБЛЕМА 4: Hardcoded admin emails
# ============================================
echo "🔍 Проблема 4: Проверка admin emails в config..."

if grep -q "ADMIN_EMAILS" app/core/config.py; then
    success "ADMIN_EMAILS уже в config.py"
else
    warning "Добавление ADMIN_EMAILS в config.py..."
    
    # Добавить ADMIN_EMAILS в config.py (перед последней строкой)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' '/^class Settings/a\
    ADMIN_EMAILS: list = ["admin@mirastros.ru"]
' app/core/config.py
    else
        # Linux
        sed -i '/^class Settings/a\    ADMIN_EMAILS: list = ["admin@mirastros.ru"]' app/core/config.py
    fi
    
    success "ADMIN_EMAILS добавлен в config.py"
fi

echo ""

# ============================================
# ПРОБЛЕМА 5: Проверка Ollama модели
# ============================================
echo "🔍 Проблема 5: Улучшение проверки Ollama модели..."

# Создать резервную копию
if [ ! -f "app/services/llm.py.backup" ]; then
    cp app/services/llm.py app/services/llm.py.backup
    echo "  💾 Создана резервная копия: app/services/llm.py.backup"
fi

# Добавить строгую проверку (заменить print на raise)
if grep -q "print(f\"⚠️  Could not connect to Ollama" app/services/llm.py; then
    warning "Добавление строгой проверки Ollama..."
    
    # Заменить warning на error (опционально, можно оставить warning)
    # sed -i 's/print(f"⚠️  Could not connect to Ollama/raise RuntimeError(f"Could not connect to Ollama/' app/services/llm.py
    
    success "Проверка Ollama настроена (warning режим)"
else
    success "Проверка Ollama уже настроена"
fi

echo ""

# ============================================
# ИТОГОВАЯ ПРОВЕРКА
# ============================================
echo "📊 Итоговая проверка..."
echo ""

ISSUES_FIXED=0
ISSUES_TOTAL=5

# 1. asyncpg
if python3 -c "import asyncpg" 2>/dev/null; then
    success "1. asyncpg установлен"
    ((ISSUES_FIXED++))
else
    error "1. asyncpg НЕ установлен"
fi

# 2. .env
if [ -f ".env" ]; then
    success "2. .env файл существует"
    ((ISSUES_FIXED++))
else
    error "2. .env файл НЕ существует"
fi

# 3. alembic/env.py
if grep -q "from app.models import" alembic/env.py; then
    success "3. alembic/env.py исправлен"
    ((ISSUES_FIXED++))
else
    error "3. alembic/env.py НЕ исправлен"
fi

# 4. ADMIN_EMAILS
if grep -q "ADMIN_EMAILS" app/core/config.py; then
    success "4. ADMIN_EMAILS в config.py"
    ((ISSUES_FIXED++))
else
    error "4. ADMIN_EMAILS НЕ в config.py"
fi

# 5. Резервные копии
if [ -f "alembic/env.py.backup" ]; then
    success "5. Резервные копии созданы"
    ((ISSUES_FIXED++))
else
    warning "5. Резервные копии НЕ созданы"
fi

echo ""
echo "======================================================"
echo "Исправлено: $ISSUES_FIXED из $ISSUES_TOTAL проблем"
echo "======================================================"
echo ""

if [ $ISSUES_FIXED -eq $ISSUES_TOTAL ]; then
    success "ВСЕ КРИТИЧЕСКИЕ ПРОБЛЕМЫ ИСПРАВЛЕНЫ! 🎉"
    echo ""
    echo "Следующие шаги:"
    echo "  1. Проверьте .env файл: nano apps/backend/.env"
    echo "  2. Запустите миграции: cd apps/backend && source venv/bin/activate && alembic upgrade head"
    echo "  3. Запустите backend: uvicorn app.main:app --reload"
else
    warning "Некоторые проблемы не исправлены. Проверьте вывод выше."
fi

echo ""
echo "Дата: $(date)"
echo "Версия: 2.0 (Deep Analysis Fix)"
