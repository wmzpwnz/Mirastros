"""Welcome calculations and authenticated persistence, without provider calls."""
from datetime import date, datetime, time, timezone
from uuid import uuid4
from zoneinfo import ZoneInfo

import httpx
import pytest
import pytest_asyncio
from fastapi import Depends, FastAPI, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

import app.models  # register relationship targets
from app.api import onboarding
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.analytics_event import AnalyticsEvent
from app.services.welcome import _utc, build_portrait, name_reading, number_reading, sky_reading

MOSCOW = {"city": "Москва", "country": "Россия", "latitude": 55.75, "longitude": 37.62}


def test_name_origin_is_not_fabricated_for_unknown_names():
    assert 'защитник' in name_reading('Александр Иванов')['origin']
    assert name_reading('Петр')['verified']
    assert not name_reading('ZzxНеизвестное')['verified']
    assert 'нет проверенного' in name_reading('ZzxНеизвестное')['origin']


def test_same_number_rule_as_existing_module_including_master_numbers():
    assert number_reading(date(1990, 1, 1))['value'] == 3
    assert number_reading(date(2000, 1, 8))['value'] == 11
    assert number_reading(None) is None


def test_j2000_sun_moon_and_missing_birth_data():
    # J2000: Sun ~280.37° Capricorn, Moon ~223.32° Scorpio.
    sky = sky_reading(date(2000, 1, 1), time(12), {"latitude": 51.4779, "longitude": 0, "city": "Greenwich"})
    assert sky['sun'] == ['Козерог']
    assert sky['moon'] == ['Скорпион']
    assert sky['ascendant']
    assert build_portrait('Анна', None, None, None)['sky'] is None


def test_historical_summer_time_not_current_device_offset():
    assert _utc(datetime(1990, 7, 1, 12), ZoneInfo('Europe/Moscow')) == datetime(1990, 7, 1, 8, tzinfo=timezone.utc)
    assert sky_reading(date(1990, 7, 1), time(12), MOSCOW)['timezone'] == 'Europe/Moscow'


def test_unknown_time_has_no_ascendant_or_fake_noon_chart():
    sky = sky_reading(date(1990, 7, 1), None, MOSCOW)
    assert not sky['time_known']
    assert sky['ascendant'] is None
    assert sky['moon']
    assert 'возможные знаки' in sky['note']


@pytest.mark.parametrize('wall', [datetime(2021, 3, 14, 2, 30), datetime(2021, 11, 7, 1, 30)])
def test_dst_gaps_and_repeated_wall_times_need_clarification(wall):
    with pytest.raises(ValueError):
        _utc(wall, ZoneInfo('America/New_York'))


@pytest_asyncio.fixture
async def client():
    engine = create_async_engine('sqlite+aiosqlite:///:memory:')
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as connection:
        await connection.run_sync(User.__table__.create)
        await connection.run_sync(AnalyticsEvent.__table__.create)
    ids = [uuid4(), uuid4()]
    async with sessions() as db:
        db.add_all([User(id=uid, email=f'user{i}@example.com', full_name='Анна') for i, uid in enumerate(ids)])
        await db.commit()
    app = FastAPI()
    app.include_router(onboarding.router)
    async def db_override():
        async with sessions() as db:
            yield db
    async def user_override(x_test_user: int = Header(default=0), db=Depends(get_db)):
        return (await db.execute(select(User).where(User.id == ids[x_test_user]))).scalar_one()
    app.dependency_overrides[get_db] = db_override
    app.dependency_overrides[get_current_active_user] = user_override
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as value:
        yield value, sessions, ids
    await engine.dispose()


@pytest.mark.asyncio
async def test_progress_profile_completion_and_account_isolation(client):
    client, sessions, ids = client
    assert not (await client.get('/auth/onboarding/state')).json()['started']
    await client.post('/auth/onboarding/start')
    await client.post('/auth/onboarding/start')
    response = await client.post('/auth/onboarding/step', json={'step': 'name', 'full_name': '  Александр  '})
    assert response.json()['profile']['full_name'] == 'Александр'
    assert response.json()['next_step'] == 2
    response = await client.post('/auth/onboarding/step', json={'step': 'birth', 'birth_date': '1990-01-01'})
    assert response.json()['portrait']['number']['value'] == 3
    response = await client.post('/auth/onboarding/step', json={'step': 'sky', 'birth_time': '12:00', 'birth_location': MOSCOW})
    assert response.json()['portrait']['sky']['ascendant']
    assert response.json()['next_step'] == 4
    assert not response.json()['completed']
    # Explicit unknown time must clear a previously entered time.
    response = await client.post('/auth/onboarding/step', json={'step': 'sky', 'birth_time': None, 'birth_location': MOSCOW})
    assert response.json()['profile']['birth_time'] is None
    assert response.json()['portrait']['sky']['ascendant'] is None
    await client.post('/auth/onboarding/complete')
    await client.post('/auth/onboarding/complete')
    state = (await client.get('/auth/onboarding/state')).json()
    assert state['completed'] and state['profile']['birth_location']['city'] == 'Москва'
    other = (await client.get('/auth/onboarding/state', headers={'x-test-user': '1'})).json()
    assert not other['completed'] and not other['started']
    assert other['profile']['birth_date'] is None
    async with sessions() as db:
        events = (await db.execute(select(AnalyticsEvent).where(AnalyticsEvent.user_id == ids[0]))).scalars().all()
        assert sum(e.event_type == 'welcome_started' for e in events) == 1
        assert sum(e.event_type == 'welcome_completed' for e in events) == 1
        assert all(set(e.event_metadata) == {'version', 'step'} for e in events)


@pytest.mark.asyncio
@pytest.mark.parametrize('payload', [
    {'step': 'name', 'full_name': '   '},
    {'step': 'birth', 'birth_date': '2099-01-01'},
    {'step': 'birth', 'birth_date': '2001-02-29'},
    {'step': 'sky', 'birth_location': {**MOSCOW, 'latitude': 100}},
    {'step': 'sky', 'birth_time': '12:00Z'},
])
async def test_invalid_input_does_not_advance_progress(client, payload):
    client, _, _ = client
    response = await client.post('/auth/onboarding/step', json=payload)
    assert response.status_code == 422
    assert (await client.get('/auth/onboarding/state')).json()['next_step'] == 1


@pytest.mark.asyncio
async def test_place_search_cache_and_upstream_failure(client, monkeypatch):
    client, _, _ = client
    onboarding._location_cache.clear()
    monkeypatch.setattr(onboarding, '_location_last_request', 0)
    calls = []
    async def transport(request):
        calls.append(request)
        return httpx.Response(200, json=[{'name': 'Москва', 'lat': '55.75', 'lon': '37.62', 'display_name': 'Москва, Россия', 'address': {'city': 'Москва', 'country': 'Россия'}}])
    original = httpx.AsyncClient
    monkeypatch.setattr(onboarding.httpx, 'AsyncClient', lambda **kwargs: original(transport=httpx.MockTransport(transport), **kwargs))
    result = (await client.get('/auth/onboarding/places', params={'q': 'Москва'})).json()
    assert result[0]['latitude'] == 55.75
    await client.get('/auth/onboarding/places', params={'q': 'москва'})
    assert len(calls) == 1
    assert 'full_name' not in str(calls[0].url)
    assert (await client.get('/auth/onboarding/places', params={'q': 'Париж'})).status_code == 429
