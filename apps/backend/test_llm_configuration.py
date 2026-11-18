"""Provider wiring without a real key, outbound requests or paid generation."""
from unittest.mock import Mock

import httpx
import pytest

from app.services import llm


@pytest.mark.asyncio
@pytest.mark.parametrize("stream", [False, True])
async def test_unconfigured_generation_sends_no_provider_request(monkeypatch, stream):
    monkeypatch.setattr(llm.settings, "DEEPSEEK_API_KEY", "  ")
    service = llm.UnifiedLLMService()
    client = Mock(side_effect=AssertionError("No provider request is allowed"))
    monkeypatch.setattr(llm.httpx, "AsyncClient", client)
    assert not service.is_loaded
    await service.load_model()
    with pytest.raises(llm.AIProviderUnavailable, match="not configured"):
        await service.generate("Explain a stored result", stream=stream)
    client.assert_not_called()


@pytest.mark.asyncio
async def test_configured_request_uses_server_credentials_and_model(monkeypatch):
    monkeypatch.setattr(llm.settings, "DEEPSEEK_API_KEY", "fixture-not-a-secret")
    service = llm.UnifiedLLMService()
    client_type = httpx.AsyncClient
    calls = []

    def response(request):
        import json
        calls.append(request)
        body = json.loads(request.content)
        assert request.headers["Authorization"] == "Bearer fixture-not-a-secret"
        assert body["model"] == service.model_name
        assert body["max_tokens"] == 120
        assert body["messages"][0]["role"] == "system"
        return httpx.Response(200, json={"choices": [{"message": {"content": "Символическое пояснение"}}]})

    monkeypatch.setattr(llm.httpx, "AsyncClient", lambda **kwargs: client_type(transport=httpx.MockTransport(response)))
    assert await service.generate("Explain this calculated result", max_tokens=120) == "Символическое пояснение"
    assert len(calls) == 1


@pytest.mark.asyncio
async def test_provider_failure_does_not_expose_its_raw_body(monkeypatch):
    monkeypatch.setattr(llm.settings, "DEEPSEEK_API_KEY", "fixture-not-a-secret")
    service = llm.UnifiedLLMService()
    client_type = httpx.AsyncClient
    monkeypatch.setattr(llm.httpx, "AsyncClient", lambda **kwargs: client_type(transport=httpx.MockTransport(lambda request: httpx.Response(401, text="fixture-sensitive-upstream-body"))))
    with pytest.raises(RuntimeError, match="HTTP 401") as error:
        await service.generate("Explain this result")
    assert "fixture-sensitive" not in str(error.value)


@pytest.mark.asyncio
async def test_failed_provider_probe_is_not_reported_as_loaded(monkeypatch, capsys):
    monkeypatch.setattr(llm.settings, "DEEPSEEK_API_KEY", "fixture-not-a-secret")
    service = llm.UnifiedLLMService()
    client_type = httpx.AsyncClient
    monkeypatch.setattr(llm.httpx, "AsyncClient", lambda **kwargs: client_type(transport=httpx.MockTransport(lambda request: httpx.Response(401, text="fixture-sensitive-upstream-body"))))
    await service.load_model()
    assert not service.is_loaded
    assert "fixture-sensitive" not in capsys.readouterr().out
