"""Personal onboarding endpoints."""

from datetime import date, time
from typing import Literal, Optional

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

# Short, deterministic welcome flow. Kept separate from the legacy AI insight
# contract so older clients continue to work without changing their response shape.
import asyncio
import time as clock
from datetime import datetime, timezone
from enum import Enum

import httpx
from fastapi import HTTPException, Query, Response
from pydantic import ConfigDict, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.core.database import get_db
from app.models.analytics_event import AnalyticsEvent
from app.services.welcome import build_portrait
from app.services import welcome_narrative


class WelcomeLocation(BaseModel):
    city: str = Field(min_length=1, max_length=120)
    country: str = Field(default="", max_length=120)
    latitude: float = Field(ge=-90, le=90, allow_inf_nan=False)
    longitude: float = Field(ge=-180, le=180, allow_inf_nan=False)


class WelcomeStep(str, Enum):
    NAME = "name"
    BIRTH = "birth"
    SKY = "sky"


class WelcomeStepRequest(BaseModel):
    step: WelcomeStep
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    birth_date: Optional[date] = None
    birth_time: Optional[time] = None
    birth_location: Optional[WelcomeLocation] = None

    @field_validator("full_name")
    @classmethod
    def name_not_blank(cls, value):
        if value is not None:
            value = " ".join(value.split())
            if not value:
                raise ValueError("Укажите имя")
        return value

    @field_validator("birth_time")
    @classmethod
    def local_birth_time(cls, value):
        if value is not None and value.tzinfo is not None:
            raise ValueError("Укажите местное время рождения без смещения часового пояса")
        return value

    @field_validator("birth_date")
    @classmethod
    def valid_birth_date(cls, value):
        if value and not date(1900, 1, 1) <= value <= date.today():
            raise ValueError("Укажите дату рождения от 1900 года до сегодняшнего дня")
        return value


async def _welcome_state(user: User, db: AsyncSession) -> dict:
    events = (await db.execute(select(AnalyticsEvent).where(
        AnalyticsEvent.user_id == user.id,
        AnalyticsEvent.event_type.in_(["welcome_started", "welcome_step", "welcome_completed"]),
    ))).scalars().all()
    completed = any(event.event_type == "welcome_completed" for event in events)
    progress = max([int((event.event_metadata or {}).get("step", 0)) for event in events] or [0])
    portrait = await run_in_threadpool(build_portrait, user.full_name, user.birth_date, user.birth_time, user.birth_location)
    portrait = await welcome_narrative.enrich(db, user, portrait, final=completed or progress >= 3)
    return {
        "started": bool(events), "completed": completed, "next_step": min(progress + 1, 4),
        "profile": {"full_name": user.full_name, "birth_date": user.birth_date,
                    "birth_time": user.birth_time, "birth_location": user.birth_location, "zodiac_sign": user.zodiac_sign},
        "portrait": portrait,
    }


async def _welcome_event(user: User, db: AsyncSession, kind: str, step: int = 0):
    # Serialize duplicate submissions for one account, including multiple devices.
    await db.execute(select(User.id).where(User.id == user.id).with_for_update())
    exists = (await db.execute(select(AnalyticsEvent.id).where(
        AnalyticsEvent.user_id == user.id, AnalyticsEvent.event_type == kind,
    ).limit(1))).scalar_one_or_none()
    if kind == "welcome_step" or exists is None:
        # Existing analytics_events.timestamp is TIMESTAMP WITHOUT TIME ZONE.
        # Store UTC as a naive value; asyncpg rejects an aware datetime here.
        db.add(AnalyticsEvent(user_id=user.id, event_type=kind, platform="web", timestamp=datetime.now(timezone.utc).replace(tzinfo=None), event_metadata={"version": 1, "step": step}))
    await db.commit()


@router.get("/state")
async def get_welcome_state(response: Response, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Profile-backed progress works across devices; no personal data in event logs."""
    response.headers["Cache-Control"] = "private, no-store"
    return await _welcome_state(current_user, db)


@router.post("/start")
async def start_welcome(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    await _welcome_event(current_user, db, "welcome_started")
    return await _welcome_state(current_user, db)


@router.post("/step")
async def save_welcome_step(data: WelcomeStepRequest, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    if data.step == WelcomeStep.NAME:
        if data.full_name is None:
            raise HTTPException(422, "Укажите имя")
        current_user.full_name = data.full_name
        index = 1
    elif data.step == WelcomeStep.BIRTH:
        current_user.birth_date = data.birth_date
        # Avoid leaving a stale calendar zodiac when the date is changed/removed.
        current_user.zodiac_sign = _zodiac_from_date(data.birth_date)
        index = 2
    else:
        current_user.birth_time = data.birth_time
        current_user.birth_location = data.birth_location.model_dump() if data.birth_location else None
        index = 3
    if data.step == WelcomeStep.SKY:
        from app.services.welcome import sky_reading
        sky = await run_in_threadpool(sky_reading, current_user.birth_date, current_user.birth_time, current_user.birth_location)
        if sky and sky.get("available"):
            current_user.zodiac_sign = next((key for key, name in ZODIAC_RU.items() if sky["sun"] == [name]), None)
    await _welcome_event(current_user, db, "welcome_step", index)
    return await _welcome_state(current_user, db)


@router.post("/complete")
async def complete_welcome(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    await _welcome_event(current_user, db, "welcome_completed", 3)
    return await _welcome_state(current_user, db)


class WelcomeMessageRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')


@router.post('/message')
async def welcome_message(request: WelcomeMessageRequest, response: Response, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """One bounded portrait; only saved profile facts enter the provider context."""
    response.headers["Cache-Control"] = "private, no-store"
    return await welcome_narrative.generate(db, current_user)


class WelcomeReadingRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    step: Literal['name', 'birth']


@router.post('/reading')
async def welcome_reading(request: WelcomeReadingRequest, response: Response, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    response.headers['Cache-Control'] = 'private, no-store'
    return await welcome_narrative.generate(db, current_user, request.step)


_location_cache: dict[str, tuple[float, list]] = {}
_location_lock = asyncio.Lock()
_location_last_request = 0.0


@router.get("/places")
async def search_welcome_places(q: str = Query(min_length=3, max_length=120), current_user: User = Depends(get_current_active_user)):
    """Explicit search only (no autocomplete), cached and limited to 1 request/s.

    Nominatim attribution is displayed by the client beside search results.
    Birth date/name are never sent to the geocoder.
    """
    global _location_last_request
    query = " ".join(q.split())
    if len(query) < 3:
        raise HTTPException(422, "Введите не менее трёх символов")
    key = query.casefold()
    cached = _location_cache.get(key)
    if cached and clock.monotonic() - cached[0] < 3600:
        return cached[1]
    if _location_lock.locked() or clock.monotonic() - _location_last_request < 1:
        raise HTTPException(429, "Подождите секунду и повторите поиск", headers={"Retry-After": "1"})
    async with _location_lock:
        _location_last_request = clock.monotonic()
        try:
            async with httpx.AsyncClient(timeout=7) as client:
                response = await client.get("https://nominatim.openstreetmap.org/search", params={
                    "q": query, "format": "jsonv2", "limit": 5, "addressdetails": 1,
                    "accept-language": "ru",
                }, headers={"User-Agent": "Mirastros/1.0 (https://vertigostra.ru; explicit birthplace search)"})
                response.raise_for_status()
                results = []
                for item in response.json():
                    address = item.get("address", {})
                    city = address.get("city") or address.get("town") or address.get("village") or item.get("name")
                    if not city:
                        continue
                    place = WelcomeLocation(city=city, country=address.get("country", ""), latitude=float(item["lat"]), longitude=float(item["lon"]))
                    results.append({**place.model_dump(), "label": item["display_name"]})
        except (httpx.HTTPError, ValueError, KeyError, TypeError):
            raise HTTPException(503, "Поиск городов временно недоступен. Попробуйте ещё раз или добавьте место позже.")
        if len(_location_cache) >= 128:
            _location_cache.pop(next(iter(_location_cache)))
        _location_cache[key] = (clock.monotonic(), results)
        return results
