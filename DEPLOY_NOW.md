# 🚀 Быстрый Деплой Mirastros Universal

## Что делает скрипт автоматически:

✅ Проверяет и устанавливает все зависимости:
- Node.js 20
- Python 3
- PostgreSQL + pgvector
- Redis
- Ollama + AI модель Qwen 2.5
- Nginx

✅ Настраивает базу данных
✅ Создает все конфигурационные файлы
✅ Собирает frontend приложения
✅ Настраивает systemd сервисы
✅ Запускает все компоненты

## Инструкция по деплою:

### Вариант 1: Деплой с локальной машины

```bash
# 1. Загрузить проект на сервер
scp -r mirastros-universal root@109.196.100.104:/var/www/

# 2. Подключиться к серверу
ssh root@109.196.100.104

# 3. Перейти в директорию проекта
cd /var/www/mirastros-universal

# 4. Запустить smart deploy
chmod +x deployment/smart-deploy.sh
sudo bash deployment/smart-deploy.sh

# 5. Дождаться завершения (15-20 минут)
# Скрипт автоматически установит все недостающее

# 6. Получить SSL сертификат
certbot --nginx -d www.mirastros.com -d mirastros.com
```

### Вариант 2: Деплой через Git

```bash
# 1. Подключиться к серверу
ssh root@109.196.100.104

# 2. Клонировать проект
cd /var/www
git clone YOUR_REPO_URL mirastros-universal
cd mirastros-universal

# 3. Запустить smart deploy
chmod +x deployment/smart-deploy.sh
sudo bash deployment/smart-deploy.sh

# 4. Получить SSL сертификат
certbot --nginx -d www.mirastros.com -d mirastros.com
```

## После деплоя:

### Проверить статус:
```bash
systemctl status mirastros-backend
systemctl status mirastros-web
systemctl status mirastros-admin
```

### Посмотреть логи:
```bash
journalctl -u mirastros-backend -f
journalctl -u mirastros-web -f
```

### Перезапустить сервисы:
```bash
systemctl restart mirastros-backend
systemctl restart mirastros-web
systemctl restart mirastros-admin
```

### Проверить работу:
```bash
# API Health Check
curl http://localhost:8000/health

# Или в браузере:
# http://www.mirastros.com/api/health
```

## Что делать если что-то не работает:

### Backend не запускается:
```bash
# Посмотреть логи
journalctl -u mirastros-backend -n 50

# Проверить .env
cat /var/www/mirastros-universal/apps/backend/.env

# Проверить базу данных
sudo -u postgres psql -d mirastros -c "SELECT version();"

# Перезапустить
systemctl restart mirastros-backend
```

### Frontend не собирается:
```bash
cd /var/www/mirastros-universal

# Переустановить зависимости
rm -rf node_modules
npm install

# Пересобрать
npx nx build web --prod
npx nx build admin --prod

# Перезапустить
systemctl restart mirastros-web
systemctl restart mirastros-admin
```

### Ollama не работает:
```bash
# Проверить статус
systemctl status ollama

# Проверить модели
ollama list

# Скачать модель заново
ollama pull qwen2.5:7b-instruct-q4_K_M

# Создать кастомную модель
cd /var/www/mirastros-universal/apps/backend
ollama create mirastros-ai -f Modelfile
```

## Важные файлы:

- **Backend .env**: `/var/www/mirastros-universal/apps/backend/.env`
- **Credentials**: `/root/.mirastros/credentials`
- **Nginx config**: `/etc/nginx/sites-available/mirastros`
- **Systemd services**: `/etc/systemd/system/mirastros-*.service`

## Полезные команды:

```bash
# Проверить все сервисы
systemctl status mirastros-* postgresql redis-server ollama nginx

# Перезапустить все
systemctl restart mirastros-backend mirastros-web mirastros-admin

# Посмотреть логи всех сервисов
journalctl -u mirastros-backend -u mirastros-web -u mirastros-admin -f

# Проверить порты
netstat -tlnp | grep -E '3000|3001|8000'

# Тест AI модели
ollama run mirastros-ai "Hello, test message"

# Backup базы данных
sudo -u postgres pg_dump mirastros > backup_$(date +%Y%m%d).sql
```

## Время деплоя:

- Установка зависимостей: 5-10 минут
- Скачивание AI модели: 5-10 минут
- Сборка frontend: 3-5 минут
- **Общее время: 15-25 минут**

## Результат:

После успешного деплоя у вас будет:

✅ Backend API на порту 8000
✅ Web приложение на порту 3000
✅ Admin панель на порту 3001
✅ Nginx проксирует все на 80/443 порт
✅ PostgreSQL с базой данных
✅ Redis для кэширования
✅ Ollama с AI моделью
✅ Все сервисы автоматически запускаются при перезагрузке

## Доступ к приложениям:

- 🌐 **Website**: http://www.mirastros.com
- 🔧 **Admin**: http://www.mirastros.com/admin
- 🔌 **API**: http://www.mirastros.com/api
- ❤️ **Health**: http://www.mirastros.com/api/health

После получения SSL:
- 🔒 **Website**: https://www.mirastros.com
- 🔒 **Admin**: https://www.mirastros.com/admin
- 🔒 **API**: https://www.mirastros.com/api

---

**Готово! Просто запустите `sudo bash deployment/smart-deploy.sh` и скрипт сделает всё остальное!** 🚀
