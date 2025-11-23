# Server Access Information

## Production Server

**Quick Access:**
```bash
ssh root@109.196.100.104
# Password: hqpQDEoEB5_hnt
```

**Server Details:**
- **IP**: 109.196.100.104
- **User**: root
- **Password**: hqpQDEoEB5_hnt
- **Domain**: www.mirastros.com
- **OS**: Ubuntu/Debian Linux

## Service Ports

- **Web App**: 3000 (internal)
- **Admin Panel**: 3001 (internal)
- **Backend API**: 8000 (internal)
- **PostgreSQL**: 5432 (internal)
- **Redis**: 6379 (internal)
- **Ollama**: 11434 (internal)
- **Nginx**: 80, 443 (external)

## Quick Commands

### Check Services Status
```bash
systemctl status mirastros-backend
systemctl status mirastros-web
systemctl status mirastros-admin
systemctl status postgresql
systemctl status redis-server
systemctl status ollama
systemctl status nginx
```

### View Logs
```bash
# Backend
journalctl -u mirastros-backend -f

# Web
journalctl -u mirastros-web -f

# Admin
journalctl -u mirastros-admin -f

# Nginx
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
systemctl restart mirastros-backend
systemctl restart mirastros-web
systemctl restart mirastros-admin
systemctl restart nginx
```

## Project Location

```bash
/home/mirastros/www/mirastros-universal/
```

## Environment Files

- Backend: `/home/mirastros/www/mirastros-universal/apps/backend/.env`
- Web: `/home/mirastros/www/mirastros-universal/apps/web/.env.local`
- Admin: `/home/mirastros/www/mirastros-universal/apps/admin/.env.local`

## SSL Certificate

- Domain: www.mirastros.com, mirastros.com
- Provider: Let's Encrypt (via Certbot)
- Auto-renewal: Enabled
- Certificate path: `/etc/letsencrypt/live/mirastros.com/`

## Database

- **Type**: PostgreSQL with pgvector
- **Database**: mirastros
- **User**: mirastros
- **Connection**: localhost:5432

## AI Model

- **Service**: Ollama
- **Model**: mirastros-ai (Qwen 2.5 7B Q4_K_M)
- **Location**: `/home/mirastros/models/qwen.gguf`
- **API**: http://localhost:11434

## Deployment Workflow

1. **Connect to server**: `ssh root@109.196.100.104`
2. **Switch to mirastros user**: `su - mirastros`
3. **Navigate to project**: `cd /home/mirastros/www/mirastros-universal`
4. **Pull changes**: `git pull`
5. **Install dependencies**: `npm install`
6. **Build apps**: `npx nx build web --prod && npx nx build admin --prod`
7. **Update backend**: `cd apps/backend && source venv/bin/activate && pip install -r requirements.txt`
8. **Run migrations**: `alembic upgrade head`
9. **Exit to root**: `exit`
10. **Restart services**: `systemctl restart mirastros-*`

## Important Notes

- Always test changes locally before deploying
- Check logs after deployment for errors
- Monitor resource usage (CPU, RAM, disk)
- Keep backups of database and configuration files
- Update SSL certificates before expiration (auto-renewal should handle this)

## Support Contacts

For deployment issues, refer to:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Full deployment instructions
- [design.md](./design.md) - Architecture and technical details
- [tasks.md](./tasks.md) - Implementation tasks

---

**Last Updated**: 2025-11-23
