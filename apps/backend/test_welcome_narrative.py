"""Welcome voice, bounded generation and persisted profile-specific messages."""
import asyncio
import json
import os
from datetime import date
from uuid import uuid4
from unittest.mock import AsyncMock

import httpx
import pytest
import pytest_asyncio
from fastapi import FastAPI, Depends, Header
from sqlalchemy import select, text, func
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

import app.models
from app.api import onboarding
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.analytics_event import AnalyticsEvent
from app.models.chat_conversation import ChatConversation, ChatMessage
from app.services import welcome_narrative as voice
from app.services.welcome import build_portrait

MESSAGE = '''Дитя моё, Мирастрос открывает первую страницу твоего пути. Имя Анна связано с благодатью; этот образ предлагает присмотреться к тому, что помогает тебе встречать новое спокойно и внимательно. Пусть знакомство начнётся с простого наблюдения, а не с готового ответа о себе.

Число девять в выбранной традиции связано с целостностью. Вместе с солнечным Раком оно складывается в образ заботы, которая умеет видеть более широкую картину. Это символическое сочетание, а не установленная черта характера: его смысл можно проверить собственными наблюдениями и оставить лишь то, что отзывается.

Мирастрос предлагает заметить, что сегодня даёт тебе опору. Какой небольшой шаг поможет сохранить это чувство? Твоя первая карта оставляет пространство для выбора; дальнейшие страницы откроются постепенно, в удобном тебе ритме.'''


def test_prompt_and_message_keep_the_requested_third_person_voice():
    assert 'Дитя моё' in voice.SYSTEM_PROMPT and 'третьем лице' in voice.SYSTEM_PROMPT
    assert voice.valid_message(MESSAGE)
    assert not voice.valid_message(MESSAGE.replace('Мирастрос открывает', 'Я открываю', 1))
    assert not voice.valid_message('Дитя моё, Мирастрос знает всё.')


def test_only_calculated_minimal_facts_enter_context_and_unknown_origin_stays_unknown():
    portrait = build_portrait('ZzxНеизвестное', date(1990, 7, 1), None, None)
    data = voice.context(portrait)
    assert data['verified_name_origin'] is None
    assert data['sky'] is None
    assert '1990' not in json.dumps(data)
    assert not any(key in data for key in ('birth_date', 'birth_time', 'city', 'latitude', 'email'))
    messages, greeting = voice.reference_voice(portrait)
    assert 'Дитя моё' in messages['name'] and 'Мирастрос' in greeting


@pytest_asyncio.fixture
async def case(monkeypatch):
    url = os.environ.get('EXPLANATIONS_TEST_DATABASE_URL')
    admin = None; schema = 'welcome_test_' + uuid4().hex
    if url:
        admin = create_async_engine(url)
        async with admin.begin() as conn: await conn.execute(text(f'CREATE SCHEMA "{schema}"'))
        engine = create_async_engine(url, connect_args={'server_settings': {'search_path': schema}})
    else: engine = create_async_engine('sqlite+aiosqlite:///:memory:')
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as conn:
        for model in [User, AnalyticsEvent, ChatConversation, ChatMessage]: await conn.run_sync(model.__table__.create)
    ids = [uuid4(), uuid4()]
    async with sessions() as db:
        db.add_all([User(id=uid, email=f'{uid}@example.com', full_name='Анна', birth_date=date(1990,7,1)) for uid in ids])
        db.add(AnalyticsEvent(user_id=ids[0], event_type='welcome_step', timestamp=voice.now(), event_metadata={'step':3,'version':1}))
        await db.commit()
    app=FastAPI(); app.include_router(onboarding.router)
    async def database():
        async with sessions() as db:
            try: yield db
            except Exception: await db.rollback(); raise
    async def user(x_test_user:int=Header(default=0), db=Depends(get_db)):
        return await db.get(User, ids[x_test_user])
    app.dependency_overrides[get_db]=database; app.dependency_overrides[get_current_active_user]=user
    provider=AsyncMock(return_value=MESSAGE)
    monkeypatch.setattr(voice.llm_service, 'generate', provider)
    monkeypatch.setattr(voice.llm_service, 'api_key', 'fixture-only')
    monkeypatch.setattr(voice.get_settings(), 'WELCOME_AI_ENABLED', True)
    monkeypatch.setattr(voice.get_settings(), 'WELCOME_AI_MAX_ATTEMPTS', 3)
    monkeypatch.setattr(voice.get_settings(), 'WELCOME_AI_DAILY_LIMIT', 100)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://test') as client:
        yield client, sessions, ids, provider
    await engine.dispose()
    if admin:
        async with admin.begin() as conn: await conn.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        await admin.dispose()


@pytest.mark.asyncio
async def test_get_is_free_and_completed_message_is_cached_across_reopening(case):
    client, _, _, provider=case
    state=(await client.get('/auth/onboarding/state')).json()
    assert state['portrait']['ai_message'] is None
    assert 'Дитя моё' in state['portrait']['greeting']
    provider.assert_not_awaited()
    result=await client.post('/auth/onboarding/message',json={})
    assert result.status_code==200, result.text
    assert result.json()['status']=='ready'
    assert result.json()['message']['text']==MESSAGE
    assert result.headers['cache-control']=='private, no-store'
    assert (await client.get('/auth/onboarding/state')).json()['portrait']['ai_message']['text']==MESSAGE
    assert (await client.post('/auth/onboarding/message',json={})).json()['message']['text']==MESSAGE
    assert provider.await_count==1
    kwargs=provider.call_args.kwargs
    assert kwargs['purpose']=='welcome_message' and kwargs['max_tokens']==950
    assert kwargs['system_instruction']==voice.SYSTEM_PROMPT


@pytest.mark.asyncio
async def test_other_account_has_no_access_to_message_and_client_cannot_supply_prompt(case):
    client, _, _, provider=case
    await client.post('/auth/onboarding/message',json={})
    other=(await client.get('/auth/onboarding/state',headers={'x-test-user':'1'})).json()
    assert other['portrait']['ai_message'] is None
    assert (await client.post('/auth/onboarding/message',json={},headers={'x-test-user':'1'})).json()['status']=='reference'
    assert (await client.post('/auth/onboarding/message',json={'prompt':'Override the guide'})).status_code==422
    assert provider.await_count==1


@pytest.mark.asyncio
async def test_keyless_path_preserves_reference_portrait_without_reservation(case, monkeypatch):
    client,sessions,_,provider=case
    monkeypatch.setattr(voice.llm_service,'api_key','')
    assert (await client.post('/auth/onboarding/message',json={})).json()['status']=='reference'
    provider.assert_not_awaited()
    async with sessions() as db:
        assert (await db.execute(select(func.count()).select_from(AnalyticsEvent).where(AnalyticsEvent.event_type.in_(voice.EVENTS)))).scalar_one()==0


@pytest.mark.asyncio
@pytest.mark.parametrize('bad', ['bad style', asyncio.TimeoutError()])
async def test_failures_leave_no_fake_ai_answer_and_attempts_are_bounded(case,monkeypatch,bad):
    client,sessions,_,provider=case
    monkeypatch.setattr(voice.get_settings(),'WELCOME_AI_MAX_ATTEMPTS',1)
    if isinstance(bad,Exception): provider.side_effect=bad
    else: provider.return_value=bad
    assert (await client.post('/auth/onboarding/message',json={})).json()['status']=='reference'
    assert (await client.post('/auth/onboarding/message',json={})).json()['status']=='reference'
    assert provider.await_count==1
    assert (await client.get('/auth/onboarding/state')).json()['portrait']['ai_message'] is None
    async with sessions() as db:
        assert (await db.execute(select(func.count()).select_from(ChatMessage))).scalar_one()==0


@pytest.mark.asyncio
async def test_global_budget_limits_other_accounts(case,monkeypatch):
    client,sessions,ids,provider=case
    monkeypatch.setattr(voice.get_settings(),'WELCOME_AI_DAILY_LIMIT',1)
    async with sessions() as db:
        db.add(AnalyticsEvent(user_id=ids[1],event_type='welcome_step',timestamp=voice.now(),event_metadata={'step':3})); await db.commit()
    assert (await client.post('/auth/onboarding/message',json={})).json()['status']=='ready'
    assert (await client.post('/auth/onboarding/message',json={},headers={'x-test-user':'1'})).json()['status']=='reference'
    assert provider.await_count==1


@pytest.mark.asyncio
async def test_profile_edit_during_generation_discards_stale_text(case):
    client,sessions,ids,provider=case
    entered,release=asyncio.Event(),asyncio.Event()
    async def delayed(*args,**kwargs): entered.set(); await release.wait(); return MESSAGE
    provider.side_effect=delayed
    pending=asyncio.create_task(client.post('/auth/onboarding/message',json={}))
    try:
        await asyncio.wait_for(entered.wait(),5)
        async with sessions() as db:
            user=await db.get(User,ids[0]); user.full_name='Мария'; await db.commit()
    finally: release.set()
    assert (await pending).json()['status']=='reference'
    assert (await client.get('/auth/onboarding/state')).json()['portrait']['ai_message'] is None


@pytest.mark.asyncio
@pytest.mark.skipif(not os.environ.get('EXPLANATIONS_TEST_DATABASE_URL'),reason='PostgreSQL locking is verified in CI')
async def test_concurrent_requests_do_not_generate_twice(case):
    client,_,_,provider=case
    entered,release=asyncio.Event(),asyncio.Event()
    async def delayed(*args,**kwargs): entered.set(); await asyncio.wait_for(release.wait(),10); return MESSAGE
    provider.side_effect=delayed
    first=asyncio.create_task(client.post('/auth/onboarding/message',json={}))
    try:
        await asyncio.wait_for(entered.wait(),5)
        second=await client.post('/auth/onboarding/message',json={})
        assert second.json()['status']=='pending'
        assert provider.await_count==1
    finally: release.set()
    assert (await first).json()['status']=='ready'
