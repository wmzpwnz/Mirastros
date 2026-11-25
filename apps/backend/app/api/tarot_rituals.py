"""Saved thematic tarot sessions. Base readings never depend on a model provider."""
import json
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import UUID
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.tarot_reading import TarotReading

router = APIRouter(prefix="/rituals")
CATALOG = json.loads((Path(__file__).parents[1] / 'data/tarot_rituals.json').read_text())
SPREADS = {item['id']: item for item in CATALOG['spreads']}


class RitualRequest(BaseModel):
    request_id: UUID
    spread_id: str
    question: str = Field(default='', max_length=1000)
    reversed_cards: bool = False
    choices: list[int] = Field(min_length=1, max_length=5)

    @field_validator('choices')
    @classmethod
    def valid_choices(cls, values):
        if len(set(values)) != len(values) or any(v < 0 or v > 77 for v in values):
            raise ValueError('Выберите разные карты из колоды.')
        return values


def public_reading(row):
    return {'reading_id': str(row.id), 'spread_type': row.spread_type,
            'spread_id': row.spread_type.split(':')[1], 'question': row.question,
            'cards': row.cards, 'interpretation': row.interpretation,
            'timestamp': row.created_at.isoformat() + 'Z'}


def draw_cards(spread, choices, reversed_cards):
    deck = secrets.SystemRandom().sample(CATALOG['cards'], 78)
    cards = []
    for position, choice in zip(spread['positions'], choices):
        card = deck[choice]
        reverse = reversed_cards and bool(secrets.randbelow(2))
        meaning = card['reversed'] if reverse else card['upright']
        cards.append({**card, 'reversed': reverse, 'position': position,
                      'interpretation': f'«{position}»: {meaning}',
                      'number': card['id'] if card['id'] < 22 else (card['id'] - 22) % 14 + 1,
                      'keywords': [card['theme']], 'catalog_version': CATALOG['version']})
    return cards


@router.get('/catalog')
async def catalog():
    return CATALOG


@router.get('/history')
async def history(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(TarotReading).where(TarotReading.user_id == user.id,
        TarotReading.spread_type.like('ritual:%')).order_by(TarotReading.created_at.desc()).limit(30))
    return {'readings': [public_reading(row) for row in result.scalars()]}


@router.get('/reading/{reading_id}')
async def read(reading_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    row = await db.get(TarotReading, reading_id)
    if not row or row.user_id != user.id or not row.spread_type.startswith('ritual:'):
        raise HTTPException(404, 'Расклад не найден.')
    return public_reading(row)


@router.post('/reading')
async def create(data: RitualRequest, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    spread = SPREADS.get(data.spread_id)
    if not spread or len(data.choices) != len(spread['positions']):
        raise HTTPException(422, 'Проверьте расклад и количество карт.')
    await db.execute(select(User.id).where(User.id == user.id).with_for_update())
    previous = await db.get(TarotReading, data.request_id)
    if previous:
        if previous.user_id != user.id or not previous.spread_type.startswith('ritual:'):
            raise HTTPException(409, 'Начните новый сеанс.')
        if previous.spread_type.split(':')[1] != data.spread_id or (previous.question or '') != data.question.strip():
            raise HTTPException(409, 'Этот сеанс уже сохранён с другими параметрами.')
        return public_reading(previous)
    spread_type = 'ritual:' + data.spread_id
    if data.spread_id == 'daily':
        try:
            zone = ZoneInfo(user.timezone or 'UTC')
        except (ZoneInfoNotFoundError, ValueError):
            zone = timezone.utc
        spread_type += ':' + datetime.now(zone).date().isoformat()
        result = await db.execute(select(TarotReading).where(TarotReading.user_id == user.id,
            TarotReading.spread_type == spread_type).order_by(TarotReading.created_at))
        existing = result.scalars().first()
        if existing:
            return public_reading(existing)
    count = await db.scalar(select(func.count()).select_from(TarotReading).where(
        TarotReading.user_id == user.id, TarotReading.spread_type.like('ritual:%'),
        TarotReading.created_at >= datetime.utcnow() - timedelta(days=1)))
    if count >= 30:
        raise HTTPException(429, 'За последние сутки сохранено 30 раскладов. Вернитесь к своей истории или попробуйте позже.')
    cards = draw_cards(spread, data.choices, data.reversed_cards)
    themes = '; '.join(f'{c["position"]} — {c["name"]} ({"перевёрнутая" if c["reversed"] else "прямая"})' for c in cards)
    summary = f'Мирастрос предлагает посмотреть на тему «{spread["title"]}» через эти образы: {themes}. Прочитай их в порядке позиций, отметь связь со своим опытом и выбери один посильный шаг. Карты не устанавливают фактов о других людях и не гарантируют события.'
    row = TarotReading(id=data.request_id, user_id=user.id, spread_type=spread_type,
        question=data.question.strip(), cards=cards, interpretation=summary, created_at=datetime.utcnow())
    db.add(row)
    await db.flush()
    response = public_reading(row)
    await db.commit()
    return response
