# 📚 Mirastros Universal - Документация

## 🎯 Обзор Проекта

**Mirastros Universal** - это полнофункциональная платформа для астрологических и эзотерических услуг с AI-интеграцией.

### Технологический стек:
- **Frontend**: Next.js 14, React 18, TypeScript, GSAP, Three.js
- **Backend**: FastAPI, Python 3.11+
- **Database**: PostgreSQL (asyncpg)
- **Cache**: Redis
- **AI**: Qwen 2.5 7B (llama-cpp-python)
- **Deployment**: Docker, Nx Monorepo

---

## 📖 Документация

### 1. 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
**Архитектура и настройки Backend**

Содержит:
- ⚙️ Конфигурация Backend (config.py)
- 🤖 LLM Service (Qwen 2.5)
- 💾 Redis Client (кэширование)
- 📚 RAG Service (Retrieval-Augmented Generation)
- 🧠 Embedding Service
- 🌐 API Endpoints
- 🗄️ База данных (PostgreSQL)
- 🔐 Переменные окружения
- 🚀 Lifecycle & Startup

**Когда использовать**: Для понимания backend архитектуры, настройки AI модели, работы с API

---

### 2. 🌀 [TUNNEL_EFFECT.md](./TUNNEL_EFFECT.md)
**Эффект тунеля (Z-Scroll Gallery Walk)**

Содержит:
- 🎯 Обзор эффекта
- 🏗️ Архитектура frontend
- 📁 Файлы реализации (page.tsx, global.css)
- 🎬 GSAP анимация (ScrollTrigger)
- 🧩 Компоненты секций (Hero, Tarot, Horoscope, Natal)
- ⚙️ Параметры и настройки
- 🔄 Как работает эффект (пошаговая визуализация)
- 🌌 3D фон (Background3D)
- 📦 Зависимости (GSAP, Three.js)

**Когда использовать**: Для понимания scroll-анимаций, работы с GSAP, создания новых секций

---

### 3. 📋 [DEPLOYMENT.md](./DEPLOYMENT.md)
**Инструкции по развертыванию**

Содержит:
- 🐳 Docker setup
- 🚀 Production deployment
- 🔧 Environment configuration
- 📊 Monitoring

**Когда использовать**: Для деплоя проекта на сервер

---

### 4. ⚡ [QUICKSTART.md](./QUICKSTART.md)
**Быстрый старт**

Содержит:
- 🏃 Быстрая установка
- 🔧 Настройка окружения
- 🚀 Запуск проекта

**Когда использовать**: Для первого запуска проекта локально

---

## 🗂️ Структура Проекта

```
mirastros-universal/
├── 📚 Документация
│   ├── ARCHITECTURE.md      # Backend архитектура
│   ├── TUNNEL_EFFECT.md     # Frontend Z-Scroll эффект
│   ├── DEPLOYMENT.md        # Деплой
│   ├── QUICKSTART.md        # Быстрый старт
│   └── README.md            # Общая информация
│
├── 🎨 Frontend (apps/web/)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # 🌀 Z-Scroll логика
│   │   │   └── global.css         # 🎨 Стили
│   │   ├── components/
│   │   │   ├── sections/          # 🧩 Секции (Hero, Tarot, etc.)
│   │   │   ├── Background3D.tsx   # 🌌 3D фон
│   │   │   └── SageEastScroll.tsx # 📦 Scroll компонент
│   │   └── services/
│   │       └── api.ts             # 🌐 API клиент
│   └── package.json
│
├── 🔧 Backend (apps/backend/)
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # ⚙️ Конфигурация
│   │   │   ├── redis.py           # 💾 Redis клиент
│   │   │   └── database.py        # 🗄️ Database
│   │   ├── services/
│   │   │   ├── llm.py             # 🤖 LLM Service
│   │   │   ├── rag.py             # 📚 RAG Service
│   │   │   └── embedding.py       # 🧠 Embeddings
│   │   ├── api/
│   │   │   ├── ai.py              # 🌐 AI endpoints
│   │   │   └── documents.py       # 📄 Documents
│   │   ├── models/                # 🗃️ Database models
│   │   └── main.py                # 🚀 FastAPI app
│   ├── .env.example               # 🔐 Environment template
│   └── requirements.txt           # 📦 Python dependencies
│
├── 🐳 Deployment (deployment/)
│   ├── docker-compose.yml
│   └── Dockerfile
│
└── 📦 Root
    ├── package.json               # 📦 JS dependencies
    ├── nx.json                    # 🔧 Nx config
    └── tsconfig.base.json         # 📝 TypeScript config
```

---

## 🔑 Ключевые Концепции

### Backend

#### 1. **LLM Service** (`apps/backend/app/services/llm.py`)
- Управление AI моделью Qwen 2.5
- Генерация мистических предсказаний
- Streaming и sync режимы
- System prompt для астрологического контекста

#### 2. **Redis Caching** (`apps/backend/app/core/redis.py`)
- Кэширование гороскопов (24 часа)
- Оптимизация производительности
- Автоматическая инвалидация

#### 3. **RAG System** (`apps/backend/app/services/rag.py`)
- Retrieval-Augmented Generation
- Семантический поиск по документам
- Контекстные ответы

#### 4. **API Endpoints** (`apps/backend/app/api/ai.py`)
- POST `/ai/predict` - Генерация предсказаний
- GET `/ai/health` - Health check
- Streaming SSE support

---

### Frontend

#### 1. **Z-Scroll Effect** (`apps/web/src/app/page.tsx`)
- GSAP ScrollTrigger анимация
- Zoom + Blur + Fade эффекты
- Zig-zag позиционирование
- Scroll-driven анимация (0-100%)

#### 2. **Section Components** (`apps/web/src/components/sections/`)
- HeroSection - Главная секция
- TarotSection - AI-гадания
- HoroscopeSection - Гороскопы (с API интеграцией)
- NatalSection - Натальные карты

#### 3. **3D Background** (`apps/web/src/components/Background3D.tsx`)
- Three.js + React Three Fiber
- Вращающиеся звезды (5000 шт)
- Туман и облака
- Космическая атмосфера

---

## 🚀 Быстрые Команды

### Development

```bash
# Установка зависимостей
npm install

# Запуск frontend (Next.js)
nx serve web
# или
cd apps/web && npm run dev

# Запуск backend (FastAPI)
cd apps/backend
python -m uvicorn app.main:app --reload

# Запуск всего проекта
docker-compose up
```

### Build

```bash
# Build frontend
nx build web

# Build backend (Docker)
docker build -t mirastros-backend ./apps/backend
```

---

## 🔧 Конфигурация

### Backend Environment (`.env`)

```bash
# AI Model
MODEL_PATH=/home/mirastros/models/qwen2.5-7b-instruct.gguf
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Database
DATABASE_URL=postgresql+asyncpg://mirastros:mirastros@localhost:5432/mirastros

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=3600

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Security
CORS_ORIGINS=["http://localhost:3000","http://localhost:4200"]
RATE_LIMIT_PER_MINUTE=60
```

### Frontend Environment

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📊 API Примеры

### Генерация предсказания

```bash
curl -X POST http://localhost:8000/ai/predict \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Что меня ждет сегодня?",
    "service_type": "horoscope",
    "use_rag": true,
    "stream": false
  }'
```

### Response:
```json
{
  "response": "Сегодня звезды благоволят вам...",
  "sources": [
    {
      "title": "Астрология для начинающих",
      "similarity": 0.85
    }
  ]
}
```

---

## 🎨 Дизайн Система

### Цвета
```css
--bg-color: #050505;        /* Темный фон */
--text-color: #e0e0e0;      /* Светлый текст */
--accent-gold: #BE8F44;     /* Золотой акцент */
```

### Типографика
```css
font-family: 'Playfair Display', serif;  /* Заголовки */
font-family: 'Inter', sans-serif;        /* Основной текст */
```

### Spacing
```css
padding: 2rem 3rem;         /* Desktop */
padding: 1.5rem;            /* Mobile */
```

---

## 🐛 Отладка

### Backend Logs
```bash
# Просмотр логов FastAPI
tail -f logs/backend.log

# Debug mode
DEBUG=True python -m uvicorn app.main:app --reload
```

### Frontend Logs
```javascript
// В page.tsx
console.log(`Z-Scroll: ${totalSlides} slides, ${totalHeight}px total height`);
```

### GSAP Debug
```javascript
// Включить маркеры ScrollTrigger
ScrollTrigger.create({
  markers: true  // Показать debug маркеры
});
```

---

## 📈 Производительность

### Backend
- ✅ Redis кэширование (гороскопы 24ч)
- ✅ Async PostgreSQL (asyncpg)
- ✅ GPU acceleration для LLM (35 layers)
- ✅ Connection pooling

### Frontend
- ✅ CSS `will-change` для GPU acceleration
- ✅ GSAP оптимизация (scrub)
- ✅ Lazy loading компонентов
- ✅ Three.js оптимизация (LOD)

---

## 🔒 Безопасность

### Backend
- ✅ CORS настройки
- ✅ Rate limiting (60 req/min)
- ✅ Environment variables
- ✅ SQL injection protection (SQLAlchemy)

### Frontend
- ✅ XSS protection (React)
- ✅ HTTPS only (production)
- ✅ Content Security Policy

---

## 🧪 Тестирование

### Backend
```bash
cd apps/backend
pytest tests/
```

### Frontend
```bash
nx test web
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

---

## 🔄 Workflow

### 1. Разработка новой секции
1. Создать компонент в `apps/web/src/components/sections/`
2. Добавить класс `.mira-section`
3. Импортировать в `page.tsx`
4. Стилизовать в `global.css`

### 2. Добавление нового API endpoint
1. Создать route в `apps/backend/app/api/`
2. Добавить Pydantic модели
3. Реализовать логику
4. Обновить `main.py` (include router)

### 3. Настройка AI модели
1. Обновить `MODEL_PATH` в `.env`
2. Настроить параметры в `llm.py`
3. Изменить system prompt
4. Перезапустить backend

---

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Z-Scroll эффект
- [x] AI интеграция (Qwen 2.5)
- [x] Redis кэширование
- [x] RAG система
- [x] 3D фон

### Phase 2: Enhanced Features 🚧
- [ ] Интерактивные расклады Таро
- [ ] Натальная карта генератор
- [ ] User authentication
- [ ] Payment integration
- [ ] Mobile app (React Native)

### Phase 3: Advanced Features 📋
- [ ] Real-time chat с AI
- [ ] Voice interface
- [ ] AR/VR experience
- [ ] Multi-language support
- [ ] Analytics dashboard

---

## 🤝 Contributing

### Code Style
- **TypeScript**: ESLint + Prettier
- **Python**: Black + Flake8
- **Commits**: Conventional Commits

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit PR

---

## 📞 Support

### Issues
- GitHub Issues: [link]
- Email: support@mirastros.com

### Documentation
- API Docs: http://localhost:8000/docs
- Frontend Storybook: [link]

---

## 📜 License

MIT License - см. [LICENSE](./LICENSE)

---

## 🙏 Credits

### Inspiration
- [Sage East](https://sageeast.com) - Z-Scroll эффект
- [Awwwards](https://awwwards.com) - Дизайн вдохновение

### Technologies
- GSAP - Анимации
- Three.js - 3D графика
- FastAPI - Backend framework
- Qwen 2.5 - AI модель

---

**Последнее обновление**: 2025-11-21  
**Версия**: 1.0.0  
**Команда**: Mirastros Development Team
