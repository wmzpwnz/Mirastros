#!/usr/bin/env python3
"""
Скрипт для проверки безопасности конфигурации проекта
"""

import os
import sys
from pathlib import Path

def check_security_issues():
    """Проверяет критические проблемы безопасности"""
    print("🔒 Проверка безопасности конфигурации...")
    print("=" * 50)
    
    issues_found = []
    
    # Проверка .env файла
    env_path = Path(".env")
    if not env_path.exists():
        issues_found.append("❌ Файл .env не найден - создайте его с помощью generate_secrets.py")
    else:
        print("✅ Файл .env найден")
        
        # Проверка содержимого .env
        with open(env_path, 'r') as f:
            content = f.read()
            
        dangerous_patterns = [
            "your-secret-key-change-in-production",
            "sk_test_", 
            "pk_test_",
            "YOUR_PASSWORD_HERE"
        ]
        
        for pattern in dangerous_patterns:
            if pattern in content:
                issues_found.append(f"⚠️  Найден небезопасный паттерн: {pattern}")
    
    # Проверка конфигурационного файла
    config_path = Path("app/core/config.py")
    if config_path.exists():
        with open(config_path, 'r') as f:
            content = f.read()
            
        if '"your-secret-key-change-in-production"' in content:
            issues_found.append("❌ Жестко прописанный SECRET_KEY в конфигурации")
            
        if '"sk-' in content and len(content.split('"sk-')[1].split('"')[0]) > 20:
            issues_found.append("❌ Найден потенциально открытый API ключ")
    
    # Результаты проверки
    if issues_found:
        print("\n🚨 НАЙДЕНЫ КРИТИЧЕСКИЕ ПРОБЛЕМЫ:")
        for i, issue in enumerate(issues_found, 1):
            print(f"{i}. {issue}")
        print("\n🔧 РЕКОМЕНДОВАННЫЕ ДЕЙСТВИЯ:")
        print("1. Запустите: python generate_secrets.py")
        print("2. Проверьте все API ключи в .env файле")
        print("3. Убедитесь, что .env добавлен в .gitignore")
        return False
    else:
        print("✅ Все проверки безопасности пройдены!")
        return True

def check_performance_issues():
    """Проверяет потенциальные проблемы производительности"""
    print("\n⚡ Проверка производительности...")
    print("=" * 50)
    
    perf_issues = []
    
    # Проверка базы данных
    database_path = Path("app/core/database.py")
    if database_path.exists():
        with open(database_path, 'r') as f:
            content = f.read()
            
        if "pool_pre_ping=True" not in content:
            perf_issues.append("⚠️  Рекомендуется включить pool_pre_ping для пула соединений")
            
        if "pool_size=" not in content:
            perf_issues.append("⚠️  Рекомендуется настроить pool_size для пула соединений")
    
    # Результаты производительности
    if perf_issues:
        print("🟡 НАЙДЕНЫ ПОТЕНЦИАЛЬНЫЕ ПРОБЛЕМЫ ПРОИЗВОДИТЕЛЬНОСТИ:")
        for issue in perf_issues:
            print(f"- {issue}")
    else:
        print("✅ Конфигурация производительности в порядке")

if __name__ == "__main__":
    print("🔍 Комплексная проверка проекта Mirastros")
    print("=" * 60)
    
    security_ok = check_security_issues()
    check_performance_issues()
    
    print("\n" + "=" * 60)
    if security_ok:
        print("🎉 Проект прошел все проверки!")
        sys.exit(0)
    else:
        print("🚨 Требуется исправление критических проблем!")
        sys.exit(1)