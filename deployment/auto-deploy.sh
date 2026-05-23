#!/bin/bash

# Автоматический деплой на production сервер
# Использует sshpass для автоматического ввода пароля

set -e

SERVER="root@109.196.100.104"
PASSWORD="hqpQDEoEB5_hnt"
PROJECT_DIR="/var/www/mirastros-universal"

echo "🚀 Автоматический деплой Mirastros Universal"
echo "=============================================="
echo "Сервер: $SERVER"
echo "Домен: www.mirastros.com"
echo ""

# Проверка sshpass
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass не установлен. Устанавливаем..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        sudo apt-get install -y sshpass
    fi
fi

# Функция для выполнения команд на сервере
run_remote() {
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

# Функция для копирования файлов на сервер
copy_to_server() {
    sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no -r "$1" "$SERVER:$2"
}

echo "📦 Шаг 1: Проверка подключения к серверу..."
if run_remote "echo 'Подключение успешно'"; then
    echo "✅ Подключение к серверу установлено"
else
    echo "❌ Не удалось подключиться к серверу"
    exit 1
fi

echo ""
echo "📦 Шаг 2: Копирование проекта на сервер..."
# Создать архив проекта
cd /Users/macbook/Desktop/mrstrs
tar -czf /tmp/mirastros-universal.tar.gz mirastros-universal/ --exclude='node_modules' --exclude='venv' --exclude='.git' --exclude='__pycache__' --exclude='*.pyc'

# Скопировать на сервер
run_remote "mkdir -p /var/www"
copy_to_server "/tmp/mirastros-universal.tar.gz" "/tmp/"

# Распаковать на сервере
run_remote "cd /var/www && tar -xzf /tmp/mirastros-universal.tar.gz && rm /tmp/mirastros-universal.tar.gz"

echo "✅ Проект скопирован на сервер"

echo ""
echo "📦 Шаг 3: Запуск деплоя на сервере..."
run_remote "cd $PROJECT_DIR && chmod +x deployment/deploy-production.sh && sudo bash deployment/deploy-production.sh"

echo ""
echo "✅ Деплой завершен!"
echo "Проверьте статус: ssh $SERVER 'systemctl status mirastros-backend'"

































