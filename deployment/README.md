# 🚀 DEPLOYMENT GUIDE - Mirastros Universal

**Версия**: 2.0 (Deep Analysis)  
**Дата**: 2025-11-24  
**Сервер**: www.mirastros.com (109.196.100.104)

---

## 📋 СОДЕРЖАНИЕ

1. [Быстрый старт](#быстрый-старт)
2. [Локальное исправление проблем](#локальное-исправление-проблем)
3. [Production деплой](#production-деплой)
4. [Проверка работоспособности](#проверка-работоспособности)
5. [Troubleshooting](#troubleshooting)

---

## ⚡ БЫСТРЫЙ СТАРТ

### Вариант 1: Исправить проблемы локально (5 минут)

```bash
# 1. Перейти в корень проекта
cd /Users/macbook/Desktop/mrstrs/mirastros-universal

# 2. Запустить скрипт исправления
chmod +x deployment/fix-critical-issues.sh
bash deployment/fix-critical-issues.sh

# 3. Проверить результат
cd apps/backend
source venv/bin/activate
python -c "import asyncpg; print('✅ asyncpg OK')"
cat .env | grep SECRET_KEY
```

**Что исправит:**
- ✅ Установит `asyncpg`
- ✅ Создаст `.env` с безопасным `SECRET_KEY`
- ✅ Исправит `alembic/env.py` (импорт всех 17 моделей)
- ✅ Добавит `ADMIN_EMAILS` в `config.py`

---

### Вариант 2: Полный деплой на сервер (2-3 часа)

```bash
# 1. Подключиться к серверу
ssh root@109.196.100.104

# 2. Скачать проект
cd /var/www
git clone <your-repo-url> mirastros-universal
cd mirastros-universal

# 3. Запустить деплой
chmod +x deployment/deploy-production.sh
sudo bash deployment/deploy-production.sh

# 4. Дождаться завершения (~2-3 часа)
# Скрипт автоматически:
# - Установит все зависимости
# - Настроит PostgreSQL + pgvector
# - Установит Redis
# - Установит Ollama + Qwen 2.5
# - Исправит все критические проблемы
# - Настроит Nginx + SSL
# - Запустит все сервисы
```

---

## 🔧 ЛОКАЛЬНОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМ

### Скрипт: `fix-critical-issues.sh`

**Что делает:**

#### 1. Проверка и установка asyncpg
```bash
# Проверяет наличие asyncpg
python3 -c "import asyncpg"

# Если нет - создает venv и устанавливает
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 2. Создание .env файла
```bash
# Генерирует безопасный SECRET_KEY
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

# Создает .env из .env.example
cp .env.example .env

# Заменяет дефолтный SECRET_KEY на сгенерированный
sed -i "s/your-secret-key-change-in-production-min-32-chars/$SECRET_KEY/" .env
```

#### 3. Исправление alembic/env.py
```bash
# Создает резервную копию
cp alembic/env.py alembic/env.py.backup

# Заменяет импорт на полный список всех 17 моделей
cat > alembic/env.py << 'EOF'
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
EOF
```

#### 4. Добавление ADMIN_EMAILS
```bash
# Добавляет ADMIN_EMAILS в config.py
sed -i '/^class Settings/a\    ADMIN_EMAILS: list = ["admin@mirastros.ru"]' app/core/config.py
```

---

## 🚀 PRODUCTION ДЕПЛОЙ

### Скрипт: `deploy-production.sh`

**Полный автоматический деплой за 10 шагов:**

#### ШАГ 1: Обновление системы
```bash
apt update && apt upgrade -y
```

#### ШАГ 2: Установка базовых пакетов
```bash
apt install -y git curl wget build-essential \
    python3 python3-pip python3-venv python3-dev \
    nginx certbot python3-certbot-nginx \
    ufw fail2ban
```

#### ШАГ 3: PostgreSQL + pgvector
```bash
# Установка PostgreSQL
apt install -y postgresql postgresql-contrib

# Установка pgvector
git clone https://github.com/pgvector/pgvector.git
cd pgvector && make && make install

# Создание БД
sudo -u postgres psql <<EOF
CREATE USER mirastros WITH PASSWORD 'generated_password';
CREATE DATABASE mirastros OWNER mirastros;
\c mirastros
CREATE EXTENSION IF NOT EXISTS vector;
EOF
```

#### ШАГ 4: Redis
```bash
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
```

#### ШАГ 5: Ollama + Qwen 2.5
```bash
# Установка Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Скачивание модели (5-10 минут)
ollama pull qwen2.5:7b-instruct-q4_K_M

# Создание кастомной модели
ollama create mirastros-ai -f Modelfile
```

#### ШАГ 6: Клонирование проекта
```bash
cd /var/www
git clone <your-repo-url> mirastros-universal
```

#### ШАГ 7: Настройка Backend
```bash
cd /var/www/mirastros-universal/apps/backend

# Создание venv
python3 -m venv venv
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Создание .env
cat > .env <<EOF
DATABASE_URL=postgresql+asyncpg://mirastros:password@localhost:5432/mirastros
SECRET_KEY=generated_secret_key
...
EOF

# Запуск миграций
alembic upgrade head
```

#### ШАГ 8: Systemd сервис
```bash
cat > /etc/systemd/system/mirastros-backend.service <<EOF
[Unit]
Description=Mirastros Backend API
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=mirastros
WorkingDirectory=/var/www/mirastros-universal/apps/backend
ExecStart=/var/www/mirastros-universal/apps/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable mirastros-backend
systemctl start mirastros-backend
```

#### ШАГ 9: Nginx
```bash
cat > /etc/nginx/sites-available/mirastros <<EOF
server {
    listen 80;
    server_name www.mirastros.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        ...
    }
}
EOF

ln -s /etc/nginx/sites-available/mirastros /etc/nginx/sites-enabled/
systemctl restart nginx
```

#### ШАГ 10: SSL
```bash
certbot --nginx -d www.mirastros.com -d mirastros.com
```

---

## ✅ ПРОВЕРКА РАБОТОСПОСОБНОСТИ

### 1. Проверка сервисов
```bash
# Статус всех сервисов
systemctl status postgresql
systemctl status redis-server
systemctl status ollama
systemctl status mirastros-backend
systemctl status nginx

# Должны быть: active (running)
```

### 2. Проверка API
```bash
# Health check
curl https://www.mirastros.com/health

# Должно вернуть:
# {"status":"healthy","services":{"database":"healthy","redis":"healthy","ai":"healthy"}}
```

### 3. Проверка Ollama
```bash
# Тест модели
ollama run mirastros-ai "Hello, can you help me?"

# Должно вернуть ответ от AI
```

### 4. Проверка БД
```bash
# Подключение к БД
sudo -u postgres psql -d mirastros

# Проверка таблиц
\dt

# Должно показать все таблицы (users, natal_charts, etc.)
```

### 5. Проверка логов
```bash
# Backend логи
journalctl -u mirastros-backend -f

# Nginx логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PostgreSQL логи
tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## 🔧 TROUBLESHOOTING

### Проблема 1: Backend не запускается

**Симптомы:**
```bash
systemctl status mirastros-backend
# Status: failed
```

**Решение:**
```bash
# 1. Проверить логи
journalctl -u mirastros-backend -n 50

# 2. Проверить .env
cat /var/www/mirastros-universal/apps/backend/.env

# 3. Проверить asyncpg
cd /var/www/mirastros-universal/apps/backend
source venv/bin/activate
python -c "import asyncpg"

# 4. Перезапустить
systemctl restart mirastros-backend
```

---

### Проблема 2: ModuleNotFoundError: No module named 'asyncpg'

**Решение:**
```bash
cd /var/www/mirastros-universal/apps/backend
source venv/bin/activate
pip install asyncpg
systemctl restart mirastros-backend
```

---

### Проблема 3: Ollama модель не найдена

**Решение:**
```bash
# Проверить модели
ollama list

# Скачать модель
ollama pull qwen2.5:7b-instruct-q4_K_M

# Создать кастомную модель
ollama create mirastros-ai -f /var/www/mirastros-universal/apps/backend/Modelfile
```

---

### Проблема 4: PostgreSQL connection refused

**Решение:**
```bash
# Проверить статус
systemctl status postgresql

# Проверить подключение
sudo -u postgres psql -l

# Проверить пароль в .env
cat /var/www/mirastros-universal/apps/backend/.env | grep DATABASE_URL
```

---

### Проблема 5: Nginx 502 Bad Gateway

**Решение:**
```bash
# Проверить backend
systemctl status mirastros-backend

# Проверить порт
netstat -tlnp | grep 8000

# Проверить Nginx конфиг
nginx -t

# Перезапустить
systemctl restart mirastros-backend
systemctl restart nginx
```

---

## 📊 ЧЕКЛИСТ ДЕПЛОЯ

### Перед деплоем:
- [ ] Сервер доступен по SSH
- [ ] Домен настроен (DNS A-record)
- [ ] Есть доступ к root
- [ ] Проект закоммичен в git

### После деплоя:
- [ ] PostgreSQL работает
- [ ] Redis работает
- [ ] Ollama работает
- [ ] Backend отвечает на /health
- [ ] Nginx работает
- [ ] SSL сертификат получен
- [ ] Firewall настроен
- [ ] Логи пишутся корректно

---

## 📞 ПОЛЕЗНЫЕ КОМАНДЫ

### Управление сервисами
```bash
# Перезапуск backend
systemctl restart mirastros-backend

# Просмотр логов
journalctl -u mirastros-backend -f

# Статус всех сервисов
systemctl status postgresql redis-server ollama mirastros-backend nginx
```

### Обновление проекта
```bash
cd /var/www/mirastros-universal
git pull
systemctl restart mirastros-backend
```

### Резервное копирование БД
```bash
sudo -u postgres pg_dump mirastros > backup_$(date +%Y%m%d).sql
```

---

## 🎯 ИТОГО

### Время деплоя:
- **Локальное исправление**: 5 минут
- **Production деплой**: 2-3 часа

### Результат:
- ✅ Backend API на https://www.mirastros.com
- ✅ PostgreSQL + pgvector
- ✅ Redis кэширование
- ✅ Ollama AI (Qwen 2.5)
- ✅ SSL сертификаты
- ✅ Автоматический перезапуск
- ✅ Все критические проблемы исправлены

---

**Дата**: 2025-11-24  
**Версия**: 2.0 (Deep Analysis)  
**Статус**: Готов к деплою 🚀
