# Mirastros Backend

FastAPI backend for Mirastros Universal platform with AI-powered esoteric services.

## Overview

The Mirastros backend provides:
- **AI Services**: Qwen 2.5-7B model via Ollama for mystical predictions
- **RAG System**: Retrieval-Augmented Generation with pgvector for context-aware responses
- **Database**: PostgreSQL with pgvector extension for vector similarity search
- **Caching**: Redis for high-performance caching
- **API**: RESTful API with FastAPI and async support

## Architecture

```
Backend (FastAPI)
├── AI Model (Ollama + Qwen 2.5)
├── RAG System (sentence-transformers + pgvector)
├── PostgreSQL (User data, Natal charts, Subscriptions)
└── Redis (Caching)
```

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Ollama

### Quick Start (Development)

1. Create virtual environment:
```bash
python3.11 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Setup local services:
```bash
# PostgreSQL
createdb mirastros
psql mirastros -c "CREATE EXTENSION vector;"

# Redis
redis-server

# Ollama (install from https://ollama.com)
ollama pull qwen2.5:7b-instruct-q4_K_M
ollama create mirastros-ai -f /path/to/Modelfile
```

5. Run migrations:
```bash
alembic upgrade head
```

6. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Setup (VPS)

For production deployment on VPS (31.130.145.75 / mirastros.com):

1. Run the complete setup script:
```bash
bash setup_complete.sh
```

This will:
- Install PostgreSQL with pgvector
- Install Redis (native, no Docker)
- Install Ollama and download Qwen 2.5 model
- Create Python virtual environment
- Install dependencies
- Run database migrations
- Setup systemd service

Or run individual setup scripts:

```bash
# PostgreSQL with pgvector
bash setup_postgresql.sh

# Redis
bash setup_redis.sh

# Ollama and Qwen 2.5 model
bash setup_ollama.sh

# Database migrations
bash run_migrations.sh
```

## Database Models

### User
- User authentication and profile
- Birth data for natal chart calculations
- Subscription tier (freemium, premium, platinum)
- Social login identifiers (Google, Apple, Telegram, VK)

### NatalChart
- Planetary positions
- House cusps
- Aspects
- Ascendant, Midheaven, Lunar nodes

### Subscription
- Subscription management
- Payment tracking (Stripe, ЮKassa, RevenueCat, etc.)
- Auto-renewal settings

### Document & DocumentChunk
- RAG document storage
- Vector embeddings for similarity search

### UserQuery
- Query history tracking
- Service type categorization

## API Endpoints

### Health Check
```
GET  /health          # Health check
GET  /                # API info
```

### AI Services
```
POST /ai/predict      # General AI prediction
POST /ai/chat         # Chat with Mirastros AI (to be implemented)
```

### Documents (RAG)
```
POST /documents/upload      # Upload document for RAG
POST /documents/upload-pdf  # Upload PDF for RAG
GET  /documents/            # List documents
DELETE /documents/{id}      # Delete document
```

## Services

### UnifiedLLMService
- Connects to Ollama API (http://localhost:11434)
- Uses `mirastros-ai` model (Qwen 2.5-7B)
- Supports streaming responses (SSE)
- Temperature: 0.7

### RAGService
- Text chunking with overlap
- Document ingestion
- Vector similarity search
- Context retrieval for LLM

### EmbeddingService
- sentence-transformers/all-MiniLM-L6-v2
- 384-dimensional embeddings
- Batch processing support

### RedisClient
- Async Redis operations
- JSON serialization
- Configurable TTL

## Configuration

Environment variables (`.env`):

```bash
# App
APP_NAME=Mirastros API
APP_VERSION=1.0.0
DEBUG=True

# Server
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=postgresql+asyncpg://mirastros:password@localhost:5432/mirastros

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
```

## Database Migrations

Using Alembic for database migrations:

```bash
# Run migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "Description"

# Rollback
alembic downgrade -1
```

## Systemd Service

The backend runs as a systemd service in production:

```bash
# Start service
sudo systemctl start mirastros-backend

# Stop service
sudo systemctl stop mirastros-backend

# Restart service
sudo systemctl restart mirastros-backend

# View logs
sudo journalctl -u mirastros-backend -f

# Check status
sudo systemctl status mirastros-backend
```

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## Development

### Code Structure

```
app/
├── api/              # API endpoints
│   ├── ai.py        # AI prediction endpoints
│   └── documents.py # RAG document endpoints
├── core/            # Core configuration
│   ├── config.py    # Settings
│   ├── database.py  # Database connection
│   └── redis.py     # Redis client
├── models/          # Database models
│   ├── document.py  # RAG models
│   ├── user.py      # User model
│   ├── natal_chart.py
│   └── subscription.py
├── services/        # Business logic
│   ├── llm.py       # LLM service (Ollama)
│   ├── embedding.py # Embedding service
│   └── rag.py       # RAG service
└── main.py          # FastAPI app
```

### Adding New Endpoints

1. Create endpoint in `app/api/`
2. Import and include router in `app/main.py`
3. Add tests in `tests/`

### Adding New Models

1. Create model in `app/models/`
2. Import in `app/models/__init__.py`
3. Create migration: `alembic revision --autogenerate -m "Add model"`
4. Run migration: `alembic upgrade head`

## Troubleshooting

### Ollama Connection Issues

```bash
# Check Ollama status
sudo systemctl status ollama

# Test Ollama
ollama run mirastros-ai

# View Ollama logs
sudo journalctl -u ollama -f
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Connect to database
psql -U mirastros -d mirastros

# Check pgvector extension
psql -U mirastros -d mirastros -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### Redis Connection Issues

```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis
redis-cli ping

# View Redis logs
sudo journalctl -u redis-server -f
```

## Performance

- **AI Model**: ~5.5GB RAM (Q4_K_M quantization)
- **Redis**: ~256MB max memory (LRU eviction)
- **PostgreSQL**: Connection pooling (10 connections, 20 max overflow)
- **Embeddings**: Cached in memory after first load

## Security

- JWT authentication (to be implemented)
- CORS configuration
- Rate limiting (60 req/min)
- Input validation with Pydantic
- SQL injection protection (SQLAlchemy)
- Password hashing with bcrypt (to be implemented)

## API Documentation

Once the server is running, access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

Proprietary - Mirastros Universal Platform

## Support

For issues or questions, contact the development team.
