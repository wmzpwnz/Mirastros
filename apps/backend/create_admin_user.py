#!/usr/bin/env python3
"""
Создать или сбросить пароль пользователя-админа.
Запуск из apps/backend с активированным venv:
  python create_admin_user.py aziz@bagbekov.ru YourPassword
  python create_admin_user.py aziz@bagbekov.ru  # запросит пароль интерактивно
"""
import asyncio
import getpass
import sys
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User, SubscriptionTier


async def ensure_admin_user(email: str, password: str) -> None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            user.password_hash = get_password_hash(password)
            print(f"Пароль для {email} обновлён.")
        else:
            user = User(
                email=email,
                password_hash=get_password_hash(password),
                full_name=email.split("@")[0],
                subscription_tier=SubscriptionTier.FREEMIUM.value,
            )
            session.add(user)
            print(f"Пользователь {email} создан.")
        await session.commit()


def main() -> None:
    if len(sys.argv) < 2:
        print("Использование: python create_admin_user.py <email> [password]")
        print("Пример: python create_admin_user.py aziz@bagbekov.ru MySecretPass")
        sys.exit(1)
    email = sys.argv[1].strip()
    if len(sys.argv) >= 3:
        password = sys.argv[2]
    else:
        password = getpass.getpass("Пароль: ")
    if len(password) < 8:
        print("Пароль должен быть не короче 8 символов.")
        sys.exit(1)
    asyncio.run(ensure_admin_user(email, password))
    print("Готово. Войдите в админку с этим email и паролем.")


if __name__ == "__main__":
    main()
