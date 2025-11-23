# 🚀 ПЛАН ДЕПЛОЯ НА СЕРВЕР (PRODUCTION-READY)

**Дата**: 2025-11-24 00:40  
**Цель**: Развернуть Mirastros Universal на production сервере  
**Время**: 2-3 часа

---

## ✅ ЧТО УЖЕ ГОТОВО К ДЕПЛОЮ

### Backend (90% готов):
- ✅ 32 API endpoints реализованы
- ✅ 32 Services работают
- ✅ 17 Models с relationships
- ✅ 15 Migrations созданы
- ✅ Auth flow (JWT) готов
- ✅ Redis кэширование настроено
- ✅ Docker конфигурация есть

### Frontend Web (65% готов):
- ✅ 15 Pages созданы
- ✅ 30 Components готовы
- ✅ API Client (531 строка) реализован
- ✅ Z-Scroll эффект работает
- ✅ Next.js оптимизирован

### Infrastructure (60% готов):
- ✅ Docker Compose конфигурация
- ✅ Nginx конфигурация
- ✅ Systemd сервисы
- ✅ Deployment скрипты

---

## 🔧 ЧТО НУЖНО ИСПРАВИТЬ ПЕРЕД ДЕПЛОЕМ

### Критичные (ОБЯЗАТЕЛЬНО):
1. ⚠️ Установить asyncpg (2 мин)
2. ⚠️ Создать .env файлы (10 мин)
3. ⚠️ Исправить alembic/env.py (5 мин)
4. ⚠️ Настроить Ollama (15 мин)

### Важные (РЕКОМЕНДУЕТСЯ):
5. ⚠️ Настроить SSL/HTTPS (30 мин)
6. ⚠️ Настроить firewall (15 мин)
7. ⚠️ Настроить мониторинг (30 мин)

---

## 📋 ПОШАГОВЫЙ ПЛАН ДЕПЛОЯ

### ШАГ 1: Подготовка сервера (30 минут)

#### 1.1 Подключение к серверу
```bash
# Подключиться по SSH
ssh root@your-server-ip

# Обновить систему
apt update && apt upgrade -y

# Установить необходимые пакеты
apt install -y git curl wget build-essential python3-pip python3-venv \
  postgresql postgresql-contrib redis-server nginx certbot \
  python3-certbot-nginx docker.io docker-compose
```

#### 1.2 Создать пользователя для приложения
```bash
# Создать пользователя mirastros
useradd -m -s /bin/bash mirastros
usermod -aG docker mirastros

# Переключиться на пользователя
su - mirastros
```

#### 1.3 Клонировать репозиторий
```bash
# Клонировать проект
cd ~
git clone https://github.com/your-username/mirastros-universal.git
cd mirastros-universal
```

---

### ШАГ 2: Настройка Backend (45 минут)

#### 2.1 Установить Python зависимости
```bash
cd ~/mirastros-universal/apps/backend

# Создать виртуальное окружение
python3 -m venv venv
source venv/bin/activate

# Установить зависимости (включая asyncpg!)
pip install -r requirements.txt

# Проверка
python -c "import asyncpg; print('✅ asyncpg installed')"
```

#### 2.2 Создать .env файл
```bash
cd ~/mirastros-universal/apps/backend

# Создать .env из примера
cp .env.example .env

# Сгенерировать SECRET_KEY
SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")

# Создать .env файл
cat > .env << EOF
# App Configuration
APP_NAME=Mirastros API
APP_VERSION=1.0.0
DEBUG=False

# Server
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=postgresql+asyncpg://mirastros:$(openssl rand -hex 16)@localhost:5432/mirastros

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=3600

# AI Model
MODEL_PATH=/home/mirastros/models/qwen2.5-7b-instruct.gguf
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# RAG
CHUNK_SIZE=512
CHUNK_OVERLAP=50
TOP_K_RESULTS=5

# Security
CORS_ORIGINS=["https://mirastros.ru","https://www.mirastros.ru"]
RATE_LIMIT_PER_MINUTE=60

# JWT
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Payment Gateways
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Monitoring
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
ENVIRONMENT=production

# External Analytics
MIXPANEL_TOKEN=your_mixpanel_token
AMPLITUDE_API_KEY=your_amplitude_api_key
EOF

echo "✅ .env файл создан"
```

#### 2.3 Исправить alembic/env.py
```bash
cd ~/mirastros-universal/apps/backend

# Создать резервную копию
cp alembic/env.py alembic/env.py.backup

# Исправить импорт моделей
cat > alembic/env.py << 'EOF'
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

# ✅ ИСПРАВЛЕНО: Импортируем ВСЕ модели
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
    Document, DocumentChunk, UserQuery,
    LenormandReading,
    Synastry
)

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
EOF

echo "✅ alembic/env.py исправлен"
```

#### 2.4 Настроить PostgreSQL
```bash
# Вернуться к root
exit

# Создать пользователя и базу данных
sudo -u postgres psql << EOF
CREATE USER mirastros WITH PASSWORD 'your_secure_password';
CREATE DATABASE mirastros OWNER mirastros;
GRANT ALL PRIVILEGES ON DATABASE mirastros TO mirastros;
\c mirastros
CREATE EXTENSION IF NOT EXISTS vector;
\q
EOF

echo "✅ PostgreSQL настроен"
```

#### 2.5 Запустить миграции
```bash
# Вернуться к пользователю mirastros
su - mirastros
cd ~/mirastros-universal/apps/backend
source venv/bin/activate

# Запустить миграции (они уже созданы!)
alembic upgrade head

echo "✅ Миграции применены"
```

#### 2.6 Установить Ollama
```bash
# Установить Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Запустить Ollama как сервис
sudo systemctl enable ollama
sudo systemctl start ollama

# Скачать модель
ollama pull qwen2.5:7b-instruct-q4_K_M

# Создать кастомную модель
cd ~/mirastros-universal/apps/backend

cat > Modelfile << 'EOF'
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
- Be personalized based on the user's context (birth chart, question, etc.)
- Maintain a warm, supportive tone
- Avoid being overly dramatic or making absolute predictions
- Encourage self-reflection and personal growth

Remember: You are here to guide, inspire, and illuminate the path, not to dictate fate."""
EOF

ollama create mirastros-ai -f Modelfile

echo "✅ Ollama настроен"
```

---

### ШАГ 3: Настройка Frontend (30 минут)

#### 3.1 Установить Node.js
```bash
# Установить Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка
node --version
npm --version
```

#### 3.2 Создать .env.local для Web
```bash
cd ~/mirastros-universal/apps/web

# Создать .env.local
cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=https://api.mirastros.ru
NEXT_PUBLIC_API_TIMEOUT=30000

# App Configuration
NEXT_PUBLIC_APP_NAME=Mirastros
NEXT_PUBLIC_APP_URL=https://mirastros.ru

# Feature Flags
NEXT_PUBLIC_ENABLE_3D_BACKGROUND=true
NEXT_PUBLIC_ENABLE_ZSCROLL=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Payment Gateways (Public Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
NEXT_PUBLIC_YOOKASSA_SHOP_ID=your_shop_id

# Social Auth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_YANDEX_METRIKA_ID=XXXXXXXX
EOF

echo "✅ .env.local создан"
```

#### 3.3 Собрать Frontend
```bash
cd ~/mirastros-universal

# Установить зависимости
npm install

# Собрать Web приложение
npx nx build web --prod

echo "✅ Frontend собран"
```

---

### ШАГ 4: Настройка Nginx (20 минут)

#### 4.1 Создать конфигурацию Nginx
```bash
# Вернуться к root
exit

# Создать конфигурацию для API
cat > /etc/nginx/sites-available/mirastros-api << 'EOF'
server {
    listen 80;
    server_name api.mirastros.ru;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Создать конфигурацию для Web
cat > /etc/nginx/sites-available/mirastros-web << 'EOF'
server {
    listen 80;
    server_name mirastros.ru www.mirastros.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Активировать конфигурации
ln -s /etc/nginx/sites-available/mirastros-api /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/mirastros-web /etc/nginx/sites-enabled/

# Проверить конфигурацию
nginx -t

# Перезапустить Nginx
systemctl restart nginx

echo "✅ Nginx настроен"
```

#### 4.2 Настроить SSL (Let's Encrypt)
```bash
# Получить SSL сертификаты
certbot --nginx -d api.mirastros.ru
certbot --nginx -d mirastros.ru -d www.mirastros.ru

# Автообновление сертификатов
systemctl enable certbot.timer

echo "✅ SSL настроен"
```

---

### ШАГ 5: Настройка Systemd сервисов (15 минут)

#### 5.1 Создать сервис для Backend
```bash
cat > /etc/systemd/system/mirastros-backend.service << 'EOF'
[Unit]
Description=Mirastros Backend API
After=network.target postgresql.service redis.service ollama.service

[Service]
Type=simple
User=mirastros
WorkingDirectory=/home/mirastros/mirastros-universal/apps/backend
Environment="PATH=/home/mirastros/mirastros-universal/apps/backend/venv/bin"
ExecStart=/home/mirastros/mirastros-universal/apps/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Активировать сервис
systemctl daemon-reload
systemctl enable mirastros-backend
systemctl start mirastros-backend

# Проверить статус
systemctl status mirastros-backend

echo "✅ Backend сервис запущен"
```

#### 5.2 Создать сервис для Frontend
```bash
cat > /etc/systemd/system/mirastros-web.service << 'EOF'
[Unit]
Description=Mirastros Web Frontend
After=network.target

[Service]
Type=simple
User=mirastros
WorkingDirectory=/home/mirastros/mirastros-universal/apps/web
Environment="PATH=/usr/bin:/usr/local/bin"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npx next start -p 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Активировать сервис
systemctl daemon-reload
systemctl enable mirastros-web
systemctl start mirastros-web

# Проверить статус
systemctl status mirastros-web

echo "✅ Frontend сервис запущен"
```

---

### ШАГ 6: Проверка работоспособности (10 минут)

#### 6.1 Проверить Backend
```bash
# Проверить health endpoint
curl https://api.mirastros.ru/health

# Должно вывести:
# {"status":"healthy","services":{"database":"healthy","redis":"healthy","ai":"healthy"}}
```

#### 6.2 Проверить Frontend
```bash
# Открыть в браузере
# https://mirastros.ru
```

#### 6.3 Проверить API
```bash
# Тест регистрации
curl -X POST https://api.mirastros.ru/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User"
  }'

# Должно вернуть access_token и refresh_token
```

---

## 🔒 БЕЗОПАСНОСТЬ (ОБЯЗАТЕЛЬНО!)

### 1. Настроить Firewall
```bash
# Установить ufw
apt install -y ufw

# Разрешить SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Запретить прямой доступ к портам приложений
ufw deny 8000/tcp
ufw deny 3000/tcp

# Активировать firewall
ufw enable

echo "✅ Firewall настроен"
```

### 2. Настроить fail2ban
```bash
# Установить fail2ban
apt install -y fail2ban

# Создать конфигурацию
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

# Запустить fail2ban
systemctl enable fail2ban
systemctl start fail2ban

echo "✅ fail2ban настроен"
```

### 3. Настроить автообновления
```bash
# Установить unattended-upgrades
apt install -y unattended-upgrades

# Включить автообновления
dpkg-reconfigure -plow unattended-upgrades

echo "✅ Автообновления настроены"
```

---

## 📊 МОНИТОРИНГ (РЕКОМЕНДУЕТСЯ)

### 1. Настроить логирование
```bash
# Создать директорию для логов
mkdir -p /var/log/mirastros

# Настроить ротацию логов
cat > /etc/logrotate.d/mirastros << 'EOF'
/var/log/mirastros/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 mirastros mirastros
    sharedscripts
}
EOF

echo "✅ Логирование настроено"
```

### 2. Настроить мониторинг (опционально)
```bash
# Установить Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz
tar xvfz node_exporter-1.7.0.linux-amd64.tar.gz
sudo mv node_exporter-1.7.0.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-1.7.0.linux-amd64*

# Создать systemd сервис
cat > /etc/systemd/system/node_exporter.service << 'EOF'
[Unit]
Description=Node Exporter
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable node_exporter
systemctl start node_exporter

echo "✅ Мониторинг настроен"
```

---

## ✅ ФИНАЛЬНЫЙ ЧЕКЛИСТ

### Перед запуском:
- [ ] asyncpg установлен
- [ ] .env файлы созданы
- [ ] SECRET_KEY сгенерирован
- [ ] alembic/env.py исправлен
- [ ] PostgreSQL настроен
- [ ] Redis запущен
- [ ] Ollama установлен и модель загружена
- [ ] Миграции применены
- [ ] Frontend собран
- [ ] Nginx настроен
- [ ] SSL сертификаты получены
- [ ] Systemd сервисы запущены
- [ ] Firewall настроен
- [ ] fail2ban настроен

### После запуска:
- [ ] Backend отвечает на /health
- [ ] Frontend открывается в браузере
- [ ] API регистрация работает
- [ ] AI генерация работает
- [ ] Логи пишутся корректно
- [ ] SSL работает (https://)

---

## 🎯 ИТОГО

### Время деплоя:
- **Подготовка сервера**: 30 мин
- **Настройка Backend**: 45 мин
- **Настройка Frontend**: 30 мин
- **Настройка Nginx**: 20 мин
- **Systemd сервисы**: 15 мин
- **Проверка**: 10 мин
- **Безопасность**: 30 мин
- **ИТОГО**: **~3 часа**

### Результат:
✅ Production-ready приложение на https://mirastros.ru  
✅ API на https://api.mirastros.ru  
✅ SSL сертификаты  
✅ Автоматический перезапуск сервисов  
✅ Firewall и fail2ban  
✅ Логирование и мониторинг  

---

**ДА, ВСЕ ЭТО МОЖНО РЕАЛИЗОВАТЬ НА СЕРВЕРЕ ПРЯМО СЕЙЧАС!** 🚀

**Дата**: 2025-11-24 00:40  
**Версия**: 1.0  
**Статус**: Готов к деплою
