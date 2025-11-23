# ⚡ БЫСТРОЕ РУКОВОДСТВО ПО ИСПРАВЛЕНИЮ КРИТИЧЕСКИХ ОШИБОК

**Дата**: 2025-11-23  
**Цель**: Запустить проект за 30 минут

---

## 🔥 КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ (ОБЯЗАТЕЛЬНО)

### 1. Создать .env файл (5 минут)

```bash
cd /Users/macbook/Desktop/mrstrs/mirastros-universal/apps/backend

# Копировать пример
cp .env.example .env

# Сгенерировать безопасный SECRET_KEY
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

# Обновить .env файл
cat > .env << EOF
# App Configuration
APP_NAME=Mirastros API
APP_VERSION=1.0.0
DEBUG=True

# Server
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=postgresql+asyncpg://mirastros:mirastros@localhost:5432/mirastros

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
CORS_ORIGINS=["http://localhost:3000","http://localhost:4200"]
RATE_LIMIT_PER_MINUTE=60

# JWT
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Payment Gateways
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Monitoring
SENTRY_DSN=
ENVIRONMENT=development

# External Analytics
MIXPANEL_TOKEN=
AMPLITUDE_API_KEY=
EOF

echo "✅ .env файл создан с безопасным SECRET_KEY"
```

---

### 2. Установить PostgreSQL и создать БД (5 минут)

```bash
# Установить PostgreSQL (если не установлен)
brew install postgresql@14

# Запустить PostgreSQL
brew services start postgresql@14

# Создать пользователя и базу данных
psql postgres << EOF
CREATE USER mirastros WITH PASSWORD 'mirastros';
CREATE DATABASE mirastros OWNER mirastros;
GRANT ALL PRIVILEGES ON DATABASE mirastros TO mirastros;
\q
EOF

# Установить pgvector расширение
psql -U mirastros -d mirastros << EOF
CREATE EXTENSION IF NOT EXISTS vector;
\q
EOF

echo "✅ PostgreSQL настроен"
```

---

### 3. Установить Redis (3 минуты)

```bash
# Установить Redis
brew install redis

# Запустить Redis
brew services start redis

# Проверить
redis-cli ping
# Должно вывести: PONG

echo "✅ Redis запущен"
```

---

### 4. Установить Ollama и модель (10 минут)

```bash
# Установить Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Запустить Ollama
ollama serve &

# Подождать 5 секунд
sleep 5

# Скачать модель Qwen 2.5 (7B, quantized)
ollama pull qwen2.5:7b-instruct-q4_K_M

# Создать кастомную модель Mirastros
cd /Users/macbook/Desktop/mrstrs/mirastros-universal/apps/backend

# Создать Modelfile
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

# Создать модель
ollama create mirastros-ai -f Modelfile

# Проверить
ollama list | grep mirastros-ai

echo "✅ Ollama и модель mirastros-ai готовы"
```

---

### 5. Запустить миграции БД (3 минуты)

```bash
cd /Users/macbook/Desktop/mrstrs/mirastros-universal/apps/backend

# Установить зависимости (если не установлены)
pip3 install -r requirements.txt

# Создать начальную миграцию
alembic revision --autogenerate -m "Initial migration with all models"

# Применить миграцию
alembic upgrade head

echo "✅ База данных мигрирована"
```

---

### 6. Запустить Backend (2 минуты)

```bash
cd /Users/macbook/Desktop/mrstrs/mirastros-universal/apps/backend

# Запустить сервер
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# В другом терминале проверить:
curl http://localhost:8000/health

# Должно вывести:
# {"status":"healthy","services":{"database":"healthy","redis":"healthy","ai":"healthy"}}
```

---

### 7. Запустить Frontend Web (2 минуты)

```bash
cd /Users/macbook/Desktop/mrstrs/mirastros-universal

# Установить зависимости (если не установлены)
npm install

# Запустить Web приложение
npx nx serve web

# Открыть в браузере:
# http://localhost:3000
```

---

## 🎯 ПРОВЕРКА РАБОТОСПОСОБНОСТИ

### Чеклист запуска

```bash
# 1. PostgreSQL работает
psql -U mirastros -d mirastros -c "SELECT version();"
# ✅ Должно вывести версию PostgreSQL

# 2. Redis работает
redis-cli ping
# ✅ Должно вывести: PONG

# 3. Ollama работает
curl http://localhost:11434/api/tags
# ✅ Должно вывести список моделей (включая mirastros-ai)

# 4. Backend работает
curl http://localhost:8000/health
# ✅ Должно вывести: {"status":"healthy",...}

# 5. Frontend работает
curl http://localhost:3000
# ✅ Должно вывести HTML

# 6. AI работает
curl -X POST http://localhost:8000/ai/predict \
  -H "Content-Type: application/json" \
  -d '{"query":"Что меня ждет сегодня?","service_type":"horoscope"}'
# ✅ Должно вывести предсказание
```

---

## 🔧 ИСПРАВЛЕНИЕ ПРОБЛЕМ

### Проблема: PostgreSQL не запускается

```bash
# Проверить статус
brew services list | grep postgresql

# Перезапустить
brew services restart postgresql@14

# Проверить логи
tail -f /usr/local/var/log/postgresql@14.log
```

### Проблема: Redis не запускается

```bash
# Проверить статус
brew services list | grep redis

# Перезапустить
brew services restart redis

# Проверить логи
tail -f /usr/local/var/log/redis.log
```

### Проблема: Ollama не находит модель

```bash
# Проверить список моделей
ollama list

# Если mirastros-ai нет, создать заново
cd /Users/macbook/Desktop/mrstrs/mirastros-universal/apps/backend
ollama create mirastros-ai -f Modelfile

# Проверить
ollama list | grep mirastros-ai
```

### Проблема: Backend падает при старте

```bash
# Проверить .env файл
cat /Users/macbook/Desktop/mrstrs/mirastros-universal/apps/backend/.env

# Проверить, что SECRET_KEY не дефолтный
grep SECRET_KEY .env

# Проверить подключение к БД
psql -U mirastros -d mirastros -c "SELECT 1;"

# Проверить логи
cd /Users/macbook/Desktop/mrstrs/mirastros-universal/apps/backend
python3 -m uvicorn app.main:app --reload --log-level debug
```

---

## 📊 СЛЕДУЮЩИЕ ШАГИ

После успешного запуска:

### 1. Создать API клиент (1 час)

```bash
# Создать структуру
mkdir -p packages/shared-core/src/api

# Создать файл packages/shared-core/src/api/client.ts
```

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors для JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
      localStorage.removeItem('access_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Реализовать auth flow (2 часа)

```typescript
// packages/shared-core/src/api/auth.ts
import apiClient from './client';

export const authAPI = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  async register(data: RegisterData) {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  
  async refreshToken(refreshToken: string) {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },
  
  async logout() {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};
```

### 3. Заменить TODO на реальные вызовы (3 часа)

Пройтись по всем файлам с TODO и заменить на реальные API вызовы.

---

## 🎓 ИТОГОВЫЙ ЧЕКЛИСТ

- [ ] PostgreSQL установлен и запущен
- [ ] Redis установлен и запущен
- [ ] Ollama установлен и модель загружена
- [ ] .env файл создан с безопасным SECRET_KEY
- [ ] Миграции БД применены
- [ ] Backend запущен и отвечает на /health
- [ ] Frontend запущен на localhost:3000
- [ ] AI эндпоинт работает (/ai/predict)
- [ ] API клиент создан
- [ ] Auth flow реализован
- [ ] TODO заменены на реальный код

---

**Время выполнения**: ~30 минут  
**Результат**: Рабочий проект с Backend + Frontend + AI

**Следующий шаг**: Открыть CRITICAL_ANALYSIS_REPORT.md для полного списка проблем
