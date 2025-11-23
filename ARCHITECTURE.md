# 🏗️ Mirastros Universal - Архитектура и Настройки

## 📋 Оглавление
1. [Обзор Системы](#обзор-системы)
2. [Конфигурация Backend](#конфигурация-backend)
3. [Сервисы и Компоненты](#сервисы-и-компоненты)
4. [API Endpoints](#api-endpoints)
5. [База Данных](#база-данных)
6. [Кэширование (Redis)](#кэширование-redis)
7. [AI/LLM Интеграция](#aillm-интеграция)
8. [Переменные Окружения](#переменные-окружения)

---

## 🎯 Обзор Системы

### Архитектура
```
mirastros-universal/
├── apps/
│   ├── backend/          # FastAPI Backend
│   │   ├── app/
│   │   │   ├── api/      # API endpoints
│   │   │   ├── core/     # Конфигурация и основные модули
│   │   │   ├── models/   # Database models
│   │   │   └── services/ # Бизнес-логика (LLM, RAG, Embeddings)
│   │   └── .env.example  # Пример настроек
│   └── web/              # Next.js Frontend
└── deployment/           # Docker и deployment конфиги
```

### Технологический Стек
- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: Next.js 14+ (React, TypeScript)
- **Database**: PostgreSQL (с asyncpg)
- **Cache**: Redis
- **AI Model**: Qwen 2.5 7B (через llama-cpp-python)
- **Embeddings**: sentence-transformers/all-MiniLM-L6-v2
- **RAG**: Custom implementation

---

## ⚙️ Конфигурация Backend

### 📁 Файл: `apps/backend/app/core/config.py`

```python
class Settings(BaseSettings):
    # App
    APP_NAME: str = "Mirastros API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://mirastros:mirastros@localhost:5432/mirastros"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600  # 1 час
    
    # AI Model
    MODEL_PATH: str = "/home/mirastros/models/qwen2.5-7b-instruct.gguf"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # RAG
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    TOP_K_RESULTS: int = 5
    
    # Security
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:4200"]
    RATE_LIMIT_PER_MINUTE: int = 60
```

### Как работает конфигурация:
1. **Pydantic Settings** - автоматическая валидация и загрузка из `.env`
2. **LRU Cache** - `@lru_cache()` для синглтона настроек
3. **Приоритет**: `.env` файл > значения по умолчанию

---

## 🔧 Сервисы и Компоненты

### 1. 🤖 LLM Service (`apps/backend/app/services/llm.py`)

**Назначение**: Управление AI моделью Qwen 2.5 для генерации предсказаний

**Ключевые параметры**:
```python
Llama(
    model_path=settings.MODEL_PATH,
    n_ctx=4096,              # Размер контекста
    n_threads=8,             # Потоки CPU
    n_gpu_layers=35,         # Слои на GPU (настроить под вашу GPU)
    verbose=False,
)
```

**System Prompt**:
```
You are Mirastros, a mystical AI oracle specializing in astrology, tarot, and esoteric wisdom.
Your responses should be:
- Mystical and poetic, yet grounded in astrological knowledge
- Personalized and empathetic
- Insightful and thought-provoking
- Written in a warm, cosmic tone
```

**Методы**:
- `load_model()` - Загрузка модели при старте
- `generate()` - Генерация ответа (sync/stream)
- `_stream_generate()` - Потоковая генерация для SSE

**Параметры генерации**:
- `max_tokens`: 512 (по умолчанию)
- `temperature`: 0.7 (креативность)
- `stop`: ["User:", "\n\n"]

---

### 2. 💾 Redis Client (`apps/backend/app/core/redis.py`)

**Назначение**: Кэширование для оптимизации производительности

**Функционал**:
```python
class RedisClient:
    async def connect()      # Подключение к Redis
    async def disconnect()   # Отключение
    async def get(key)       # Получить из кэша
    async def set(key, value, ttl)  # Сохранить в кэш
    async def delete(key)    # Удалить ключ
    async def exists(key)    # Проверить существование
```

**Настройки**:
- URL: `redis://localhost:6379/0`
- TTL по умолчанию: 3600 секунд (1 час)
- Encoding: UTF-8
- Decode responses: True

**Использование в коде**:
```python
# Кэширование гороскопов на 24 часа
cache_key = f"horoscope:{query}"
await redis.set(cache_key, {"response": response}, ttl=86400)
```

---

### 3. 📚 RAG Service (`apps/backend/app/services/rag.py`)

**Назначение**: Retrieval-Augmented Generation для контекстных ответов

**Параметры**:
- `CHUNK_SIZE`: 512 токенов
- `CHUNK_OVERLAP`: 50 токенов
- `TOP_K_RESULTS`: 5 наиболее релевантных фрагментов

**Методы**:
- `get_context()` - Получить контекст для запроса
- `retrieve()` - Поиск релевантных документов
- Использует embeddings для семантического поиска

---

### 4. 🧠 Embedding Service (`apps/backend/app/services/embedding.py`)

**Назначение**: Векторизация текста для RAG

**Модель**: `sentence-transformers/all-MiniLM-L6-v2`
- Размер вектора: 384
- Быстрая и эффективная для семантического поиска

---

## 🌐 API Endpoints

### 📁 Файл: `apps/backend/app/api/ai.py`

#### POST `/ai/predict`
**Назначение**: Генерация AI предсказаний

**Request**:
```json
{
  "query": "Что меня ждет сегодня?",
  "service_type": "horoscope",  // horoscope, tarot, natal
  "user_id": "anonymous",
  "use_rag": true,
  "stream": false
}
```

**Response**:
```json
{
  "response": "Сегодня звезды благоволят...",
  "sources": [
    {"title": "Астрология для начинающих", "similarity": 0.85}
  ]
}
```

**Логика работы**:
1. ✅ Проверка кэша (для гороскопов)
2. 📚 Получение RAG контекста (если `use_rag=true`)
3. 🤖 Генерация ответа через LLM
4. 💾 Сохранение в БД
5. 🔄 Кэширование результата (гороскопы на 24ч)

**Streaming Mode**:
- `stream=true` → Server-Sent Events (SSE)
- Content-Type: `text/event-stream`
- Format: `data: {"text": "chunk"}\n\n`

---

### 📁 Файл: `apps/backend/app/api/documents.py`

#### POST `/documents/upload`
**Назначение**: Загрузка документов для RAG

#### GET `/documents/`
**Назначение**: Список всех документов

---

## 🗄️ База Данных

### Подключение
```python
DATABASE_URL = "postgresql+asyncpg://mirastros:mirastros@localhost:5432/mirastros"
```

### Модели (`apps/backend/app/models/`)

#### UserQuery
```python
class UserQuery:
    id: int
    user_id: str
    query: str
    response: str
    service_type: str  # horoscope, tarot, natal
    created_at: datetime
```

#### Document
```python
class Document:
    id: int
    title: str
    content: str
    category: str
    embedding: vector
    created_at: datetime
```

---

## 🔴 Кэширование (Redis)

### Стратегия кэширования

#### 1. Гороскопы (24 часа)
```python
cache_key = f"horoscope:{query}"
ttl = 86400  # 24 часа
```

#### 2. Общие запросы (1 час)
```python
ttl = 3600  # 1 час (по умолчанию)
```

### Ключи кэша
- `horoscope:{query}` - Гороскопы
- Можно добавить:
  - `tarot:{card_name}` - Значения карт Таро
  - `natal:{birth_data}` - Натальные карты

---

## 🤖 AI/LLM Интеграция

### Модель: Qwen 2.5 7B Instruct

**Путь к модели**:
```
/home/mirastros/models/qwen2.5-7b-instruct.gguf
```

**Параметры**:
- **Context Window**: 4096 токенов
- **Threads**: 8 (CPU)
- **GPU Layers**: 35 (настроить под вашу GPU)
- **Temperature**: 0.7 (баланс креативности)
- **Max Tokens**: 512 (длина ответа)

### Промпт-инжиниринг

**System Prompt** определяет личность AI:
```
You are Mirastros, a mystical AI oracle...
```

**Структура промпта**:
```
{system_prompt}

Context:
{rag_context}

User: {user_query}
Mirastros:
```

---

## 🔐 Переменные Окружения

### 📁 Файл: `apps/backend/.env`

**Создайте файл** на основе `.env.example`:

```bash
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

# AI Model (обновите путь после загрузки модели)
MODEL_PATH=/home/mirastros/models/qwen2.5-7b-instruct.gguf
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# RAG
CHUNK_SIZE=512
CHUNK_OVERLAP=50
TOP_K_RESULTS=5

# Security
CORS_ORIGINS=["http://localhost:3000","http://localhost:4200"]
RATE_LIMIT_PER_MINUTE=60
```

### Как создать `.env`:
```bash
cd apps/backend
cp .env.example .env
# Отредактируйте .env под ваши настройки
```

---

## 🚀 Lifecycle & Startup

### 📁 Файл: `apps/backend/app/main.py`

**Последовательность запуска**:
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Подключение к Redis
    await redis_client.connect()
    
    # 2. Загрузка LLM модели
    await llm_service.load_model()
    
    # 3. Загрузка Embedding модели
    await embedding_service.load_model()
    
    yield
    
    # Shutdown
    await redis_client.disconnect()
```

**CORS настройки**:
```python
allow_origins=["http://localhost:3000", "http://localhost:4200"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

---

## 📊 Производительность и Оптимизация

### Кэширование
- ✅ Гороскопы кэшируются на 24 часа
- ✅ Redis для быстрого доступа
- ✅ Автоматическая инвалидация по TTL

### AI Model
- ✅ Загрузка модели при старте (не при каждом запросе)
- ✅ GPU acceleration (35 layers)
- ✅ Асинхронная генерация
- ✅ Streaming для длинных ответов

### Database
- ✅ Async PostgreSQL (asyncpg)
- ✅ Connection pooling
- ✅ Vector embeddings для быстрого поиска

---

## 🔍 Мониторинг и Health Checks

### Endpoints:
- `GET /` - Основная информация
- `GET /health` - Общий health check
- `GET /ai/health` - AI service health

---

## 📝 Следующие Шаги

### Что нужно сделать:

1. **Создать `.env` файл**:
   ```bash
   cd apps/backend
   cp .env.example .env
   ```

2. **Настроить пути**:
   - Обновить `MODEL_PATH` в `.env`
   - Проверить `DATABASE_URL`
   - Проверить `REDIS_URL`

3. **Загрузить модель**:
   ```bash
   ./download_model.sh
   ```

4. **Запустить сервисы**:
   ```bash
   # PostgreSQL
   # Redis
   # Backend
   ```

5. **Протестировать**:
   ```bash
   curl http://localhost:8000/health
   ```

---

## 🎨 Интеграция с Frontend

### Next.js API Calls
```typescript
const response = await fetch('http://localhost:8000/ai/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: userQuery,
    service_type: 'horoscope',
    use_rag: true,
    stream: false
  })
});
```

---

## 📚 Документация API

После запуска доступна по адресу:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

**Дата создания**: 2025-11-21
**Версия**: 1.0.0
