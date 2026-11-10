"""Isolated transport tests; no DB, provider credentials or external requests."""
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from app.services import email


@pytest.fixture
def config(monkeypatch):
    config = SimpleNamespace(
        SENDGRID_API_KEY="", SMTP_HOST="", SMTP_PORT=587,
        SMTP_USER="", SMTP_PASSWORD="", SMTP_FROM_EMAIL="noreply@example.com",
        SMTP_USE_TLS=True,
    )
    monkeypatch.setattr(email, "settings", config)
    return config


@pytest.mark.asyncio
async def test_unconfigured_transport_does_not_claim_delivery(config, caplog):
    assert not await email.EmailService.send_email("person@example.com", "subject", "secret-token")
    assert "secret-token" not in caplog.text


@pytest.mark.asyncio
async def test_smtp_uses_single_tls_negotiation(config, monkeypatch):
    config.SMTP_HOST = "smtp.example.com"
    send = AsyncMock()
    monkeypatch.setattr(email.aiosmtplib, "send", send)
    assert await email.EmailService.send_email("person@example.com", "subject", "body")
    assert send.call_args.kwargs["start_tls"] is True
    assert send.call_args.kwargs["use_tls"] is False
    assert send.await_count == 1


@pytest.mark.asyncio
async def test_sendgrid_failure_does_not_retry_smtp(config, monkeypatch, caplog):
    import sendgrid
    config.SENDGRID_API_KEY = "test-only"
    client = Mock()
    client.send.side_effect = RuntimeError("secret-token")
    monkeypatch.setattr(sendgrid, "SendGridAPIClient", Mock(return_value=client))
    smtp = AsyncMock()
    monkeypatch.setattr(email.aiosmtplib, "send", smtp)
    assert not await email.EmailService.send_email("person@example.com", "subject", "body")
    smtp.assert_not_called()
    assert "secret-token" not in caplog.text
