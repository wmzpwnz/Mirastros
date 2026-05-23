"""Personal onboarding endpoints."""

from datetime import date, time
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.deps import get_current_active_user
from app.models.user import User
from app.services.llm import llm_service

router = APIRouter(prefix="/auth/onboarding", tags=["Onboarding"])


class OnboardingBirthLocation(BaseModel):
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class OnboardingInsightRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    birth_date: Optional[str] = None
    birth_time: Optional[str] = None
    birth_location: Optional[OnboardingBirthLocation] = None
    gender: Optional[str] = None
    relationship_status: Optional[str] = None
    life_goal: Optional[str] = None
    known_zodiac_sign: Optional[str] = None
    preferred_language: str = "ru"
    timezone: str = "UTC"


class OnboardingInsightResponse(BaseModel):
    title: str
    subtitle: str
    message: str
    name_insight: str
    cosmic_signature: str
    generation_insight: str
    birth_place_insight: str
    archetype: str
    element: str
    personal_threshold: str
    hidden_strength: str
    gentle_shadow: str
    path_summary: str
    details: list[str] = Field(default_factory=list)
    first_key: str
    source: str = "deepseek"


ZODIAC_RU = {
    "aries": "Овен",
    "taurus": "Телец",
    "gemini": "Близнецы",
    "cancer": "Рак",
    "leo": "Лев",
    "virgo": "Дева",
    "libra": "Весы",
    "scorpio": "Скорпион",
    "sagittarius": "Стрелец",
    "capricorn": "Козерог",
    "aquarius": "Водолей",
    "pisces": "Рыбы",
}


def _parse_birth_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def _parse_birth_time(value: Optional[str]) -> Optional[time]:
    if not value:
        return None
    try:
        parts = value.split(":")
        return time(int(parts[0]), int(parts[1]), int(parts[2]) if len(parts) > 2 else 0)
    except (ValueError, IndexError):
        return None


def _zodiac_from_date(birth_date: Optional[date]) -> Optional[str]:
    if not birth_date:
        return None
    month = birth_date.month
    day = birth_date.day
    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return "aries"
    if (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return "taurus"
    if (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return "gemini"
    if (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return "cancer"
    if (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "leo"
    if (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "virgo"
    if (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return "libra"
    if (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return "scorpio"
    if (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return "sagittarius"
    if (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "capricorn"
    if (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return "aquarius"
    return "pisces"


def _generation_from_year(year: Optional[int]) -> str:
    if not year:
        return "поколение личного перехода"
    if year <= 1964:
        return "поколение земной опоры"
    if year <= 1980:
        return "поколение самостоятельного пути"
    if year <= 1996:
        return "поколение рубежа миров"
    if year <= 2012:
        return "поколение цифрового огня"
    return "поколение новой карты"


def _element_from_zodiac(zodiac_key: Optional[str]) -> str:
    if zodiac_key in {"aries", "leo", "sagittarius"}:
        return "Огонь"
    if zodiac_key in {"taurus", "virgo", "capricorn"}:
        return "Земля"
    if zodiac_key in {"gemini", "libra", "aquarius"}:
        return "Воздух"
    if zodiac_key in {"cancer", "scorpio", "pisces"}:
        return "Вода"
    return "Смешанная стихия"


def _day_period(birth_time: Optional[time]) -> str:
    if not birth_time:
        return "время рождения пока скрыто"
    if 5 <= birth_time.hour < 11:
        return "утренний порог"
    if 11 <= birth_time.hour < 17:
        return "дневной свет"
    if 17 <= birth_time.hour < 23:
        return "вечерний знак"
    return "ночная глубина"


def _build_fallback(data: OnboardingInsightRequest) -> OnboardingInsightResponse:
    birth_date = _parse_birth_date(data.birth_date)
    birth_time = _parse_birth_time(data.birth_time)
    zodiac_key = data.known_zodiac_sign or _zodiac_from_date(birth_date)
    zodiac = ZODIAC_RU.get(zodiac_key or "", "небо еще не раскрыло знак полностью")
    element = _element_from_zodiac(zodiac_key)
    generation = _generation_from_year(birth_date.year if birth_date else None)
    day_period = _day_period(birth_time)
    place = data.birth_location.city if data.birth_location and data.birth_location.city else "место первого вдоха"

    first_name = data.full_name.strip().split()[0]
    return OnboardingInsightResponse(
        title=f"{first_name}, Mirastros приветствует тебя",
        subtitle="Первая карта пути открыта",
        message=(
            f"Mirastros видит, что {first_name} вошел не случайно. В имени уже звучит личный "
            "ритм: стремление найти смысл там, где другие видят только события. Это не приговор "
            "и не обещание, а первый знак, с которого начинается знакомство."
        ),
        name_insight=(
            f"Имя {first_name} воспринимается как личная печать: оно несет энергию внимания, "
            "памяти и внутреннего выбора. В нем есть движение к собственному языку судьбы."
        ),
        cosmic_signature=(
            f"Солнечный знак: {zodiac}. Время рождения раскрывается как {day_period}: "
            "оттенок, через который человек встречает мир и отвечает на его вызовы."
        ),
        generation_insight=(
            f"Год рождения относит тебя к коду: {generation}. Это поколенческий фон, "
            "который учит соединять опыт прошлого с новым способом видеть реальность."
        ),
        birth_place_insight=(
            f"{place} стало первой точкой твоего неба. Оттуда началась линия, которую "
            "Mirastros будет раскрывать постепенно, через знаки, карты и личные совпадения."
        ),
        archetype="Искатель порога",
        element=element,
        personal_threshold="Сейчас важен переход от ожидания точного знака к спокойному выбору первого шага.",
        hidden_strength="Твоя недооцененная сила — умение замечать тонкие связи между событиями и людьми.",
        gentle_shadow="Мягкая тень пути — склонность слишком долго проверять внутреннее знание, прежде чем ему довериться.",
        path_summary=(
            f"Личная карта складывается из имени {first_name}, солнечного знака {zodiac}, "
            f"стихии {element.lower()} и точки рождения {place}. Это не финальный портрет, "
            "а первая настройка Mirastros на твой ритм."
        ),
        details=[
            f"Ритм входа: {day_period}. Он показывает, как человек обычно встречает новое.",
            f"Поколенческий фон: {generation}. Он влияет на язык выбора, свободы и ответственности.",
            "Первое наблюдение: сильные решения приходят после того, как внутренний шум становится тише.",
        ],
        first_key="Первый ключ: не спеши искать ответ снаружи. Сначала посмотри, какой знак повторяется рядом с тобой.",
        source="fallback",
    )


def _build_prompt(data: OnboardingInsightRequest, user: User) -> str:
    birth_date = _parse_birth_date(data.birth_date)
    birth_time = _parse_birth_time(data.birth_time)
    zodiac_key = data.known_zodiac_sign or _zodiac_from_date(birth_date)
    zodiac = ZODIAC_RU.get(zodiac_key or "", "unknown")
    generation = _generation_from_year(birth_date.year if birth_date else None)
    day_period = _day_period(birth_time)
    location = data.birth_location
    place = ""
    if location:
        place = ", ".join(item for item in [location.city, location.country] if item)

    return f"""
Создай первое приветственное onboarding-послание для пользователя Mirastros.

Говори по-русски. Стиль: завораживающий, эзотерический, умный, но без обещаний судьбы и без страха.
Важно: Mirastros говорит о себе в третьем лице: "Mirastros приветствует", "Mirastros видит".
Не рекомендуй сервисы и не отправляй пользователя в Таро/гороскоп/дашборд.
Не используй markdown.

Данные пользователя:
- Имя: {data.full_name}
- Email аккаунта: {user.email}
- Дата рождения: {data.birth_date or "не указана"}
- Время рождения: {data.birth_time or "не указано"} ({day_period})
- Место рождения: {place or "не указано"}
- Солнечный знак: {zodiac}
- Поколенческий код: {generation}
- Пол: {data.gender or "не указан"}
- Семейное положение: {data.relationship_status or "не указано"}
- Главный интерес: {data.life_goal or "не указан"}

Верни строго JSON без markdown и без пояснений:
{{
  "title": "короткий заголовок с именем",
  "subtitle": "короткая завораживающая строка",
  "message": "главное приветствие 2-3 предложения",
  "name_insight": "значение имени как эзотерического образа 1-2 предложения",
  "cosmic_signature": "астрологическая информация по дате/времени 1-2 предложения",
  "generation_insight": "поколенческая характеристика 1-2 предложения",
  "birth_place_insight": "информация о месте рождения как первой точке неба 1-2 предложения",
  "archetype": "один архетип из списка: Странник, Хранитель, Искатель, Алхимик, Провидец, Воин света, Медиатор",
  "element": "стихия старта: Огонь, Вода, Земля или Воздух, с коротким смыслом через тире",
  "personal_threshold": "личный порог: что человеку сейчас важно пройти, 1-2 предложения",
  "hidden_strength": "скрытая сила: качество, которое человек недооценивает, 1-2 предложения",
  "gentle_shadow": "мягкая тень без негатива, например склонность слишком долго ждать знака, 1 предложение",
  "path_summary": "конкретный персональный итог по имени, дате, времени и месту, 2-3 предложения",
  "details": ["5 коротких конкретных пунктов: имя, знак, стихия, поколение, место/время"],
  "first_key": "короткий персональный ключ/фраза-талисман"
}}
""".strip()


@router.post("/insight", response_model=OnboardingInsightResponse)
async def generate_onboarding_insight(
    data: OnboardingInsightRequest,
    current_user: User = Depends(get_current_active_user),
):
    """Generate the first personal Mirastros greeting after registration."""
    import json
    import re

    fallback = _build_fallback(data)

    try:
        raw = await llm_service.generate(
            prompt=_build_prompt(data, current_user),
            max_tokens=1100,
            temperature=0.82,
        )
        text = str(raw).strip()
        text = re.sub(r"^```(?:json)?|```$", "", text, flags=re.IGNORECASE).strip()
        payload = json.loads(text)
        return OnboardingInsightResponse(
            title=payload.get("title") or fallback.title,
            subtitle=payload.get("subtitle") or fallback.subtitle,
            message=payload.get("message") or fallback.message,
            name_insight=payload.get("name_insight") or fallback.name_insight,
            cosmic_signature=payload.get("cosmic_signature") or fallback.cosmic_signature,
            generation_insight=payload.get("generation_insight") or fallback.generation_insight,
            birth_place_insight=payload.get("birth_place_insight") or fallback.birth_place_insight,
            archetype=payload.get("archetype") or fallback.archetype,
            element=payload.get("element") or fallback.element,
            personal_threshold=payload.get("personal_threshold") or fallback.personal_threshold,
            hidden_strength=payload.get("hidden_strength") or fallback.hidden_strength,
            gentle_shadow=payload.get("gentle_shadow") or fallback.gentle_shadow,
            path_summary=payload.get("path_summary") or fallback.path_summary,
            details=payload.get("details") if isinstance(payload.get("details"), list) else fallback.details,
            first_key=payload.get("first_key") or fallback.first_key,
            source="deepseek",
        )
    except Exception:
        return fallback
