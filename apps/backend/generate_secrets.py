#!/usr/bin/env python3
"""
Скрипт для генерации безопасных секретов для продакшена
"""

import os
import secrets
from pathlib import Path

def generate_secure_secret(length: int = 32) -> str:
    """Генерирует криптографически безопасный секрет"""
    return secrets.token_urlsafe(length)

def create_env_file():
    """Создает .env файл с безопасными значениями"""
    env_example_path = Path(".env.example")
    env_path = Path(".env")
    
    if env_path.exists():
        print("⚠️  Файл .env уже существует. Создаю резервную копию...")
        backup_path = env_path.with_suffix(".backup")
        env_path.rename(backup_path)
        print(f"✅ Резервная копия создана: {backup_path}")
    
    # Генерируем секреты
    secret_key = generate_secure_secret(32)
    db_password = generate_secure_secret(24)
    
    # Читаем пример и заменяем значения
    with open(env_example_path, 'r') as f:
        content = f.read()
    
    # Заменяем плейсхолдеры на реальные значения
    replacements = {
        "your-secret-key-change-in-production-min-32-chars": secret_key,
        "YOUR_PASSWORD_HERE": db_password,
        "sk_test_your_secret_key": "sk_live_" + generate_secure_secret(16),
        "pk_test_your_publishable_key": "pk_live_" + generate_secure_secret(16),
        "your_shop_id": "shop_" + generate_secure_secret(8),
        "your_secret_key": generate_secure_secret(32),
    }
    
    for placeholder, value in replacements.items():
        content = content.replace(placeholder, value)
    
    # Записываем новый .env файл
    with open(env_path, 'w') as f:
        f.write(content)
    
    print("✅ Файл .env успешно создан с безопасными секретами!")
    print(f"🔐 SECRET_KEY: {secret_key}")
    print(f"🔒 DB_PASSWORD: {db_password}")
    print("\n⚠️  ВАЖНО: Сохраните эти значения в безопасном месте!")
    print("⚠️  Не коммитьте .env файл в репозиторий!")

if __name__ == "__main__":
    print("🔐 Генерация безопасных секретов для Mirastros...")
    print("=" * 50)
    create_env_file()
    print("=" * 50)
    print("✅ Генерация завершена!")