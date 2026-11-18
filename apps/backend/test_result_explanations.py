"""Saved-result explanations: isolated persistence and mocked provider."""
import asyncio
import os
from datetime import timedelta
from unittest.mock import AsyncMock
from uuid import uuid4
import httpx
import pytest
import pytest_asyncio
from fastapi import FastAPI, Depends, Header
from sqlalchemy import select, func, delete, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
import app.models
from app.api import explanations
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.tarot_reading import TarotReading
from app.models.chat_conversation import ChatConversation, ChatMessage
from app.models.analytics_event import AnalyticsEvent
from app.services import result_explanations as service

@pytest_asyncio.fixture
async def case(monkeypatch):
    url = os.environ.get('EXPLANATIONS_TEST_DATABASE_URL')
    admin = None
    schema = 'explanation_test_' + uuid4().hex
    if url:
        admin = create_async_engine(url)
        async with admin.begin() as conn:
            await conn.execute(text(f'CREATE SCHEMA "{schema}"'))
        engine = create_async_engine(url, connect_args={'server_settings': {'search_path': schema}})
    else:
        engine = create_async_engine('sqlite+aiosqlite:///:memory:')
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as conn:
        for model in [User, TarotReading, ChatConversation, ChatMessage, AnalyticsEvent]:
            await conn.run_sync(model.__table__.create)
    ids = [uuid4(), uuid4()]; rid = uuid4()
    async with sessions() as db:
        db.add_all([User(id=uid, email=f'{uid}@example.com', full_name='Анна', subscription_tier='premium', subscription_expires=service.now() + timedelta(days=2)) for uid in ids])
        db.add(TarotReading(id=rid, user_id=ids[0], spread_type='one-card', cards=[{'name': 'The Fool', 'position': 'Present', 'reversed': False, 'interpretation': 'New beginnings'}], interpretation='Stored catalogue meaning', question='My question'))
        await db.commit()
    app = FastAPI(); app.include_router(explanations.router)
    async def database():
        async with sessions() as db:
            try: yield db
            except Exception: await db.rollback(); raise
    async def user(x_test_user: int = Header(default=0), db=Depends(get_db)):
        return (await db.execute(select(User).where(User.id == ids[x_test_user]))).scalar_one()
    app.dependency_overrides[get_db] = database
    app.dependency_overrides[get_current_active_user] = user
    generate = AsyncMock(return_value='Краткое пояснение сохранённого результата.')
    monkeypatch.setattr(service.llm_service, 'generate', generate)
    monkeypatch.setattr(service.llm_service, 'api_key', 'fixture-key')
    monkeypatch.setattr(service.get_settings(), 'AI_EXPLANATION_TRIAL_CREDITS', 0)
    monkeypatch.setattr(service.get_settings(), 'AI_EXPLANATION_DAILY_LIMIT', 5)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        yield client, sessions, ids, rid, generate
    await engine.dispose()
    if admin:
        async with admin.begin() as conn:
            await conn.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        await admin.dispose()

def path(case): return f'/explanations/tarot/{case[3]}'

@pytest.mark.asyncio
async def test_owner_cache_and_single_clarification(case):
    client, sessions, ids, rid, generate = case
    assert (await client.get(path(case))).json()['available']
    response = await client.post(path(case), json={})
    assert response.status_code == 200, response.text
    assert response.json()['answer'] and response.json()['can_clarify']
    prompt = generate.call_args.args[0]
    assert 'The Fool' in prompt and 'Stored catalogue meaning' in prompt
    assert str(ids[0]) not in prompt and 'example.com' not in prompt
    assert (await client.post(path(case), json={})).status_code == 200
    assert generate.await_count == 1
    response = await client.post(path(case), json={'question': 'Как это связано с моим вопросом?'})
    assert response.status_code == 200, response.text
    assert response.json()['clarification']['answer'] and not response.json()['can_clarify']
    assert (await client.post(path(case), json={'question': 'Как это связано с моим вопросом?'})).status_code == 200
    assert generate.await_count == 2
    assert (await client.post(path(case), json={'question': 'Ещё один вопрос'})).status_code == 409
    assert (await client.get(path(case))).json()['clarification']

@pytest.mark.asyncio
async def test_other_user_and_forged_context_cannot_reach_provider(case):
    client, _, _, _, generate = case
    assert (await client.get(path(case), headers={'x-test-user': '1'})).status_code == 404
    assert (await client.post(path(case), json={}, headers={'x-test-user': '1'})).status_code == 404
    assert (await client.post(path(case), json={'context_data': {'cards': 'forged'}})).status_code == 422
    generate.assert_not_awaited()

@pytest.mark.asyncio
@pytest.mark.parametrize('tier,expired', [('freemium', False), ('premium', True)])
async def test_subscription_checked_on_server(case, tier, expired):
    client, sessions, ids, _, generate = case
    async with sessions() as db:
        user = await db.get(User, ids[0]); user.subscription_tier = tier
        if expired: user.subscription_expires = service.now() - timedelta(days=1)
        await db.commit()
    assert (await client.get(path(case))).json()['reason'] == 'subscription_required'
    assert (await client.post(path(case), json={})).status_code == 403
    generate.assert_not_awaited()

@pytest.mark.asyncio
async def test_missing_key_does_not_reserve_usage_or_fake_an_answer(case, monkeypatch):
    client, sessions, _, _, generate = case
    monkeypatch.setattr(service.llm_service, 'api_key', '')
    assert (await client.get(path(case))).json()['reason'] == 'not_configured'
    assert (await client.post(path(case), json={})).status_code == 503
    generate.assert_not_awaited()
    async with sessions() as db:
        assert (await db.execute(select(func.count()).select_from(AnalyticsEvent))).scalar_one() == 0

@pytest.mark.asyncio
async def test_provider_failure_is_bounded_and_not_stored_as_answer(case, monkeypatch):
    client, sessions, _, _, generate = case
    monkeypatch.setattr(service.get_settings(), 'AI_EXPLANATION_DAILY_LIMIT', 1)
    generate.side_effect = RuntimeError('fixture-sensitive-error')
    response = await client.post(path(case), json={})
    assert response.status_code == 503 and 'fixture-sensitive' not in response.text
    assert (await client.get(path(case))).json()['answer'] is None
    assert (await client.post(path(case), json={})).status_code == 429
    assert generate.await_count == 1
    async with sessions() as db:
        assert (await db.execute(select(AnalyticsEvent))).scalar_one().event_type == 'result_ai_failed'

@pytest.mark.asyncio
async def test_trial_is_server_controlled_and_survives_response_deletion(case, monkeypatch):
    client, sessions, ids, _, generate = case
    async with sessions() as db:
        user = await db.get(User, ids[0]); user.subscription_tier = 'freemium'; await db.commit()
    monkeypatch.setattr(service.get_settings(), 'AI_EXPLANATION_TRIAL_CREDITS', 1)
    assert (await client.post(path(case), json={})).status_code == 200
    async with sessions() as db:
        await db.execute(delete(ChatMessage)); await db.execute(delete(ChatConversation)); await db.commit()
    assert (await client.post(path(case), json={})).status_code in (403, 429)
    assert generate.await_count == 1

@pytest.mark.asyncio
async def test_followup_requires_initial_and_text_is_bounded(case):
    client, _, _, _, generate = case
    assert (await client.post(path(case), json={'question': 'Вопрос'})).status_code == 409
    assert (await client.post(path(case), json={'question': 'x' * 301})).status_code == 422
    assert (await client.post(path(case), json={'question': '   '})).status_code == 422
    generate.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.skipif(not os.environ.get('EXPLANATIONS_TEST_DATABASE_URL'), reason='Requires PostgreSQL row locking; CI supplies an isolated database')
async def test_concurrent_calls_reserve_at_most_one_provider_operation(case):
    client, _, _, _, generate = case
    entered, release = asyncio.Event(), asyncio.Event()
    async def provider(*args, **kwargs):
        entered.set()
        await asyncio.wait_for(release.wait(), timeout=10)
        return 'Одно пояснение.'
    generate.side_effect = provider
    first = asyncio.create_task(client.post(path(case), json={}))
    try:
        await asyncio.wait_for(entered.wait(), timeout=5)
        second = await client.post(path(case), json={})
        assert second.status_code == 429, second.text
        assert generate.await_count == 1
    finally:
        release.set()
    response = await first
    assert response.status_code == 200, response.text
    assert (await client.post(path(case), json={})).status_code == 200
    assert generate.await_count == 1


@pytest.mark.asyncio
async def test_tarot_draw_is_saved_and_does_not_generate_ai_automatically(case):
    from app.services.tarot import TarotService
    from unittest.mock import Mock
    _, sessions, ids, _, generate = case
    provider = Mock(); provider.generate = generate
    rag = Mock(); rag.get_context = AsyncMock(side_effect=AssertionError('No automatic RAG or AI'))
    async with sessions() as db:
        result = await TarotService(provider, rag).perform_reading(db, 'one-card', 'Test question', user_id=ids[0])
        assert result['reading_id']
        assert len(result['cards']) == 1
        assert result['cards'][0]['interpretation'] in result['interpretation']
    generate.assert_not_awaited(); rag.get_context.assert_not_awaited()


@pytest.mark.asyncio
async def test_legacy_chat_cannot_create_or_extend_reserved_explanations(case):
    from types import SimpleNamespace
    from app.services.chat import ChatService
    legacy = ChatService(None, None)
    with pytest.raises(ValueError, match='Reserved'):
        await legacy.create_conversation(None, 'fixture', service_type=service.PREFIX + 'tarot')
    legacy.get_conversation = AsyncMock(return_value=SimpleNamespace(service_type=service.PREFIX + 'tarot'))
    with pytest.raises(ValueError, match='bounded'):
        await legacy.send_message(None, 'fixture', 'fixture', 'Unlimited chat', None)


@pytest.mark.asyncio
async def test_deleting_source_removes_saved_explanation_but_not_cost_events(case):
    from app.services.history_service import delete_consultation
    client, sessions, ids, rid, _ = case
    assert (await client.post(path(case), json={})).status_code == 200
    async with sessions() as db:
        assert await delete_consultation(db, str(ids[0]), 'tarot', str(rid))
        assert (await db.execute(select(func.count()).select_from(ChatMessage))).scalar_one() == 0
        assert (await db.execute(select(func.count()).select_from(ChatConversation))).scalar_one() == 0
        assert (await db.execute(select(func.count()).select_from(AnalyticsEvent))).scalar_one() == 1
    assert (await client.get(path(case))).status_code == 404


@pytest.mark.asyncio
async def test_real_auth_dependency_rejects_anonymous_requests(monkeypatch):
    app = FastAPI(); app.include_router(explanations.router)
    async def no_database(): yield None
    app.dependency_overrides[get_db] = no_database
    generate = AsyncMock()
    monkeypatch.setattr(service.llm_service, 'generate', generate)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
        url = '/explanations/tarot/' + str(uuid4())
        assert (await client.get(url)).status_code == 403
        assert (await client.post(url, json={})).status_code == 403
    generate.assert_not_awaited()
