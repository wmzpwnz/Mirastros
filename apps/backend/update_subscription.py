#!/usr/bin/env python3
"""
Скрипт для обновления подписки пользователя
Использование:
    python update_subscription.py <email> <tier> [expires_date]
    
Примеры:
    python update_subscription.py ddiseen@gmail.com platinum
    python update_subscription.py ddiseen@gmail.com premium "2026-12-31"
"""

import asyncio
import sys
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Добавляем путь к приложению
sys.path.insert(0, '/Users/macbook/Desktop/mrstrs/mirastros-universal/apps/backend')

from app.core.database import AsyncSessionLocal
from app.models.user import User, SubscriptionTier


async def update_subscription(email: str, tier: str, expires_date: str = None):
    """Обновить подписку пользователя"""
    
    print("=" * 60)
    print(f"Обновление подписки для: {email}")
    print(f"Новый уровень: {tier.upper()}")
    print("=" * 60)
    print()
    
    async with AsyncSessionLocal() as db:
        try:
            # Найти пользователя по email
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            
            if not user:
                print(f"❌ Пользователь с email {email} не найден!")
                return
            
            print(f"✅ Найден пользователь: {user.full_name}")
            print(f"   Текущая подписка: {user.subscription_tier.value}")
            print()
            
            # Проверить валидность tier
            try:
                new_tier = SubscriptionTier(tier.lower())
            except ValueError:
                print(f"❌ Неверный уровень подписки: {tier}")
                print(f"   Доступные уровни: freemium, premium, platinum")
                return
            
            # Установить дату истечения (по умолчанию через год)
            if expires_date:
                try:
                    expires = datetime.fromisoformat(expires_date)
                except ValueError:
                    print(f"❌ Неверный формат даты: {expires_date}")
                    print(f"   Используйте формат: YYYY-MM-DD")
                    return
            else:
                # По умолчанию через год
                expires = datetime.utcnow() + timedelta(days=365)
            
            # Обновить подписку
            user.subscription_tier = new_tier
            user.subscription_expires = expires
            
            await db.commit()
            await db.refresh(user)
            
            print()
            print("=" * 60)
            print("✅ Подписка успешно обновлена!")
            print("=" * 60)
            print(f"Email: {user.email}")
            print(f"Имя: {user.full_name}")
            print(f"Новая подписка: {user.subscription_tier.value.upper()}")
            print(f"Истекает: {user.subscription_expires.strftime('%Y-%m-%d %H:%M:%S') if user.subscription_expires else 'Никогда'}")
            print("=" * 60)
            
        except Exception as e:
            await db.rollback()
            print()
            print("=" * 60)
            print(f"❌ Ошибка при обновлении: {str(e)}")
            print("=" * 60)
            raise


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Использование: python update_subscription.py <email> <tier> [expires_date]")
        print()
        print("Примеры:")
        print("  python update_subscription.py ddiseen@gmail.com platinum")
        print("  python update_subscription.py ddiseen@gmail.com premium '2026-12-31'")
        print()
        print("Доступные уровни: freemium, premium, platinum")
        sys.exit(1)
    
    email = sys.argv[1]
    tier = sys.argv[2]
    expires_date = sys.argv[3] if len(sys.argv) > 3 else None
    
    asyncio.run(update_subscription(email, tier, expires_date))







