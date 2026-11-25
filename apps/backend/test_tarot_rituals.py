"""Thematic tarot catalogue, persistence, privacy and retry safety."""
import os
from datetime import date
from uuid import uuid4

import httpx
import pytest
import pytest_asyncio
from fastapi import FastAPI, Depends, Header
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
import app.models
from app.api import tarot_rituals as rituals
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.tarot_reading import TarotReading


@pytest_asyncio.fixture
async def client():
    url = os.environ.get('EXPLANATIONS_TEST_DATABASE_URL')
    admin = None
    schema = 'tarot_ritual_test_' + uuid4().hex
    if url:
        admin = create_async_engine(url)
        async with admin.begin() as conn:
            await conn.execute(text(f'CREATE SCHEMA "{schema}"'))
        engine = create_async_engine(url, connect_args={'server_settings': {'search_path': schema}})
    else:
        engine = create_async_engine('sqlite+aiosqlite:///:memory:')
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as conn:
        for model in [User, TarotReading]:
            await conn.run_sync(model.__table__.create)
    ids = [uuid4(), uuid4()]
    async with sessions() as db:
        db.add_all([User(id=uid, email=f'{uid}@example.com', full_name='Анна', birth_date=date(1984,10,31)) for uid in ids])
        await db.commit()
    app = FastAPI()
    app.include_router(rituals.router)
    async def database():
        async with sessions() as db:
            yield db
    async def user(x_test_user: int = Header(default=0), db=Depends(get_db)):
        return (await db.execute(select(User).where(User.id == ids[x_test_user]))).scalar_one()
    app.dependency_overrides[get_db] = database
    app.dependency_overrides[get_current_user] = user
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as request:
        yield request
    await engine.dispose()
    if admin:
        async with admin.begin() as conn:
            await conn.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        await admin.dispose()


@pytest.mark.asyncio
async def test_catalog_and_persistence(client):
    catalog = (await client.get('/rituals/catalog')).json()
    assert len(catalog['cards']) == 78
    assert len({c['id'] for c in catalog['cards']}) == 78
    assert len(catalog['spreads']) == 15
    assert all(c['upright'] and c['reversed'] for c in catalog['cards'])
    for spread in catalog['spreads']:
        data = {'request_id':str(uuid4()), 'spread_id':spread['id'], 'choices':list(range(len(spread['positions']))), 'question':'Мой вопрос'}
        response = await client.post('/rituals/reading', json=data)
        assert response.status_code == 200, response.text
        result = response.json()
        assert len(set(c['id'] for c in result['cards'])) == len(spread['positions'])
        assert [c['position'] for c in result['cards']] == spread['positions']
        assert not any(c['reversed'] for c in result['cards'])
        assert (await client.post('/rituals/reading', json=data)).json() == result
        assert (await client.get('/rituals/reading/'+result['reading_id'])).json() == result
        assert (await client.get('/rituals/reading/'+result['reading_id'],headers={'x-test-user':'1'})).status_code == 404
    assert len((await client.get('/rituals/history')).json()['readings']) == 15
    assert not (await client.get('/rituals/history',headers={'x-test-user':'1'})).json()['readings']


@pytest.mark.asyncio
async def test_daily_and_validation(client):
    data={'request_id':str(uuid4()),'spread_id':'daily','choices':[5]}
    first=(await client.post('/rituals/reading',json=data)).json()
    data.update(request_id=str(uuid4()),choices=[27])
    assert (await client.post('/rituals/reading',json=data)).json() == first
    for values in ([1,1,1],[-1],[78],[]):
        assert (await client.post('/rituals/reading',json={**data,'choices':values})).status_code==422
    assert (await client.post('/rituals/reading',json={**data,'spread_id':'unknown'})).status_code==422
    assert (await client.post('/rituals/reading',json={**data,'spread_id':'conversation'})).status_code==422


def test_reverse_and_legacy_card_schema(monkeypatch):
    from app.schemas.tarot import DrawnCard
    monkeypatch.setattr(rituals.secrets, 'randbelow', lambda n: 1)
    cards = rituals.draw_cards(rituals.SPREADS['conversation'], [0,2,4,6,8], True)
    assert all(card['reversed'] for card in cards)
    for card in cards:
        assert DrawnCard.model_validate(card).name
        assert 'перевёрнутом' in card['interpretation']
