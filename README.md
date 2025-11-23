# Mirastros Universal

> **Mystical AI-powered esoteric services platform**

A premium, universal application offering astrology, tarot, and natal chart readings powered by Qwen 2.5 AI with RAG (Retrieval-Augmented Generation).

![Mirastros](apps/web/public/logo.png)

## 🌟 Features

### 🔮 **AI Services**
- **Daily Horoscope**: Personalized astrological predictions
- **Tarot Readings**: Mystical card interpretations
- **Natal Charts**: Cosmic blueprint analysis
- **RAG-Enhanced**: Context-aware responses using vector search

### 🎨 **Premium Design**
- **Sage East Scroll Effect**: GSAP-powered smooth scrolling
- **3D Cosmic Background**: React Three Fiber starfield
- **Glassmorphism UI**: Modern, mystical aesthetic
- **Responsive**: Mobile-first design

### ⚡ **Performance**
- **Redis Caching**: 24h horoscope cache
- **Vector Search**: pgvector for semantic retrieval
- **Streaming AI**: Server-Sent Events for real-time responses
- **Optimized**: Next.js 14 with standalone output

## 🏗️ Architecture

### Monorepo Structure (Nx)

```
mirastros-universal/
├── apps/
│   ├── web/              # Next.js landing + app
│   ├── admin/            # Next.js admin panel
│   ├── mobile/           # React Native (Expo)
│   └── backend/          # FastAPI + Qwen 2.5
├── packages/
│   ├── ui/               # Shared components
│   ├── config/           # Shared configs
│   └── utils/            # Shared utilities
└── deployment/           # Nginx, systemd, scripts
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React, TypeScript |
| **Mobile** | React Native, Expo, NativeWind |
| **Backend** | FastAPI, Python 3.10+ |
| **AI** | Qwen 2.5-7B-Instruct (GGUF) |
| **Database** | PostgreSQL + pgvector |
| **Cache** | Redis |
| **Styling** | Tailwind CSS, NativeWind |
| **Animations** | GSAP, Framer Motion, Three.js |
| **Deployment** | Nginx, Systemd, Let's Encrypt |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Redis 6+

### Local Development

1. **Clone repository**:
   ```bash
   git clone <repo-url>
   cd mirastros-universal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup backend**:
   ```bash
   cd apps/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**:
   ```bash
   createdb mirastros
   psql mirastros -c "CREATE EXTENSION vector;"
   cd apps/backend
   alembic upgrade head
   ```

5. **Start services**:
   ```bash
   # Terminal 1: Backend
   cd apps/backend
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000

   # Terminal 2: Web
   npx nx serve web

   # Terminal 3: Redis
   redis-server
   ```

6. **Access**:
   - Web: http://localhost:4200
   - API: http://localhost:8000/docs
   - Admin: http://localhost:3001

## 📦 Production Deployment

**Production Server**: 109.196.100.104 | **Domain**: www.mirastros.com

### 📖 Deployment Documentation

- **[DEPLOY_QUICK.md](./DEPLOY_QUICK.md)** - Quick deployment cheatsheet
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[.kiro/specs/.../DEPLOYMENT_GUIDE.md](.kiro/specs/mirastros-universal-platform/DEPLOYMENT_GUIDE.md)** - Step-by-step instructions
- **[.kiro/specs/.../SERVER_INFO.md](.kiro/specs/mirastros-universal-platform/SERVER_INFO.md)** - Server access & quick commands

### Quick Deploy to VPS

```bash
# Connect to production server
ssh root@109.196.100.104
# Password: hqpQDEoEB5_hnt

# Clone and deploy
git clone <repo-url> /home/mirastros/www/mirastros-universal
cd /home/mirastros/www/mirastros-universal
sudo bash deployment/deploy.sh
```

This automated script will:
- ✅ Install all system dependencies
- ✅ Setup PostgreSQL + pgvector
- ✅ Setup Redis
- ✅ Build all applications
- ✅ Install systemd services
- ✅ Configure Nginx with SSL for www.mirastros.com

## 📚 Documentation

### Deployment
- [DEPLOY_QUICK.md](./DEPLOY_QUICK.md) - Quick deployment cheatsheet
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete VPS deployment guide
- [DEPLOYMENT_GUIDE.md](.kiro/specs/mirastros-universal-platform/DEPLOYMENT_GUIDE.md) - Step-by-step instructions
- [SERVER_INFO.md](.kiro/specs/mirastros-universal-platform/SERVER_INFO.md) - Server access info

### Development
- [Backend README](./apps/backend/README.md) - API documentation
- [Design Document](.kiro/specs/mirastros-universal-platform/design.md) - Technical architecture
- [Tasks](.kiro/specs/mirastros-universal-platform/tasks.md) - Implementation plan

## 🎯 Project Status

### ✅ Completed

- [x] **Phase 1**: Infrastructure & Monorepo setup
- [x] **Phase 2**: Web application with GSAP scroll effects
- [x] **Phase 3**: Backend with Qwen 2.5 + RAG + Redis
- [x] **Phase 6**: Deployment scripts & Nginx config

### 🚧 In Progress

- [ ] **Phase 4**: Admin panel (RAG document management)
- [ ] **Phase 5**: Mobile app (React Native)

## 🔑 Key Components

### Web Application
- **GSAP ScrollTrigger**: Sage East-style scroll with pin/fade effects
- **Background3D**: Cosmic starfield with Three.js
- **Sections**: Intro, Horoscope, Tarot, Natal Chart

### Backend API
- **`/api/ai/predict`**: AI predictions with RAG
- **`/api/documents/upload`**: RAG document ingestion
- **`/api/documents/upload-pdf`**: PDF upload & processing

### Services
- **UnifiedLLMService**: Qwen 2.5 with streaming support
- **RAGService**: Vector search & document chunking
- **EmbeddingService**: Sentence transformers
- **RedisClient**: Caching & session management

## 🎨 Design System

### Colors
- **Deep Purple**: `#1E0A3C` (Primary)
- **Gold**: `#D4AF37` (Accent)
- **Turquoise**: `#40E0D0` (Secondary)
- **Cosmic**: `#0F0A1F` (Background)

### Typography
- **Headings**: Cinzel (serif)
- **Body**: Inter (sans-serif)

### Animations
- `pulse-slow`: Subtle pulsing
- `float`: Gentle floating
- `bounce`: Scroll indicator

## 🔒 Security

- Non-root user (`mirastros`) for all services
- UFW firewall (ports 22, 80, 443 only)
- SSL/TLS via Let's Encrypt
- Rate limiting on AI endpoints (60 req/min)
- CORS restricted to allowed origins

## 📊 Performance

- **Horoscope Cache**: 24h Redis TTL
- **Vector Search**: IVFFLAT index on embeddings
- **Static Assets**: Nginx caching with 1-year max-age
- **Gzip Compression**: Enabled for all text assets

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Proprietary - All rights reserved

---

**Built with ✨ by the Mirastros team**
