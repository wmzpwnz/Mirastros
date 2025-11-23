# Mirastros Universal - Quick Start Guide

## 🚀 Getting Started (Local Development)

### 1. Clone and Install
```bash
git clone <repo-url>
cd mirastros-universal
npm install
```

### 2. Setup Backend
```bash
cd apps/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### 3. Setup Database
```bash
# Create database
createdb mirastros
psql mirastros -c "CREATE EXTENSION vector;"

# Run migrations
cd apps/backend
alembic upgrade head
```

### 4. Start Services
```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Backend
cd apps/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 3: Web
npx nx serve web
```

### 5. Access
- **Web**: http://localhost:4200
- **API Docs**: http://localhost:8000/docs
- **Admin**: http://localhost:3001

---

## 📦 Production Deployment

### Quick Deploy (VPS)
```bash
git clone <repo-url> /home/mirastros/www/mirastros-universal
cd /home/mirastros/www/mirastros-universal
sudo bash deployment/deploy.sh
```

### Post-Deployment
```bash
# Download AI model
sudo -u mirastros bash apps/backend/download_model.sh

# Check services
sudo systemctl status mirastros-web
sudo systemctl status mirastros-admin
sudo systemctl status mirastros-backend
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.

---

## 📚 Documentation

- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [Backend README](./apps/backend/README.md) - API docs

---

## 🎯 Project Status

✅ **Complete**:
- Web App (GSAP scroll, 3D background)
- Backend (Qwen 2.5, RAG, Redis)
- Deployment (Nginx, systemd, SSL)

🚧 **Remaining**:
- Admin Panel (document management)
- Mobile App (React Native)
