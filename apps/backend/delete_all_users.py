#!/usr/bin/env python3
"""
⚠️ ВНИМАНИЕ: Этот скрипт удаляет ВСЕ учетные записи пользователей из базы данных!
Это необратимая операция. Используйте с осторожностью.

Для запуска:
    python delete_all_users.py
"""

import asyncio
import sys
import argparse
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

# Добавляем путь к приложению
sys.path.insert(0, '/Users/macbook/Desktop/mrstrs/mirastros-universal/apps/backend')

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.natal_chart import NatalChart
from app.models.tarot_reading import TarotReading
from app.models.horoscope import Horoscope
from app.models.subscription import Subscription
from app.models.journal_entry import JournalEntry
from app.models.document import Document


async def delete_all_users(auto_confirm=False):
    """Удалить все учетные записи пользователей и связанные данные"""
    
    print("=" * 60)
    print("⚠️  ВНИМАНИЕ: УДАЛЕНИЕ ВСЕХ УЧЕТНЫХ ЗАПИСЕЙ")
    print("=" * 60)
    print()
    
    # Подтверждение
    if not auto_confirm:
        confirmation = input("Вы уверены, что хотите удалить ВСЕ учетные записи? (yes/no): ")
        if confirmation.lower() != 'yes':
            print("Операция отменена.")
            return
    else:
        print("Автоматическое подтверждение включено.")
    
    print()
    print("Начинаем удаление...")
    print()
    
    async with AsyncSessionLocal() as db:
        try:
            # Подсчитываем количество пользователей перед удалением
            result = await db.execute(select(User))
            users = result.scalars().all()
            user_count = len(users)
            
            print(f"Найдено пользователей: {user_count}")
            
            if user_count == 0:
                print("Нет пользователей для удаления.")
                return
            
            # Показываем список пользователей
            print("\nСписок пользователей для удаления:")
            print("-" * 60)
            for i, user in enumerate(users, 1):
                print(f"{i}. {user.email} ({user.full_name}) - {user.subscription_tier}")
            print("-" * 60)
            print()
            
            # Финальное подтверждение
            if not auto_confirm:
                final_confirmation = input("УДАЛИТЬ ВСЕ ЭТИ УЧЕТНЫЕ ЗАПИСИ? (yes/no): ")
                if final_confirmation.lower() != 'yes':
                    print("Операция отменена.")
                    return
            else:
                print("Продолжаем удаление...")
            
            print()
            print("Удаление пользователей и связанных данных...")
            print("(Связанные данные удалятся автоматически через каскадные удаления)")
            
            # Удаляем всех пользователей - связанные данные удалятся каскадно
            await db.execute(delete(User))
            await db.commit()
            
            print()
            print("=" * 60)
            print(f"✅ Успешно удалено {user_count} учетных записей")
            print("=" * 60)
            
        except Exception as e:
            await db.rollback()
            print()
            print("=" * 60)
            print(f"❌ Ошибка при удалении: {str(e)}")
            print("=" * 60)
            raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Удалить все учетные записи пользователей')
    parser.add_argument('--yes', '--force', action='store_true', 
                       help='Автоматически подтвердить удаление (без интерактивного подтверждения)')
    
    args = parser.parse_args()
    
    print()
    print("🚨 СКРИПТ УДАЛЕНИЯ ВСЕХ УЧЕТНЫХ ЗАПИСЕЙ")
    print()
    print("Этот скрипт удалит:")
    print("  - Все учетные записи пользователей")
    print("  - Все натальные карты")
    print("  - Все таро чтения")
    print("  - Все персонализированные гороскопы")
    print("  - Все подписки")
    print("  - Все журнальные записи")
    print("  - Все документы")
    print()
    print("⚠️  ЭТО НЕОБРАТИМАЯ ОПЕРАЦИЯ!")
    print()
    
    asyncio.run(delete_all_users(auto_confirm=args.yes))

