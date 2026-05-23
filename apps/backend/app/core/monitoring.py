"""
Monitoring and error tracking with Sentry
"""
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from app.core.config import get_settings
import logging
from typing import Optional

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/mirastros.log') if settings.ENVIRONMENT == 'production' else logging.NullHandler()
    ]
)

logger = logging.getLogger(__name__)


def init_sentry():
    """Initialize Sentry for error tracking"""
    dsn = (settings.SENTRY_DSN or "").strip()
    if not dsn or "your_" in dsn or "project_id" in dsn:
        logger.warning("Sentry DSN not configured or placeholder. Error tracking disabled.")
        return
    try:
        sentry_sdk.init(
            dsn=dsn,
            environment=settings.ENVIRONMENT,
            traces_sample_rate=0.1 if settings.ENVIRONMENT == 'production' else 1.0,
            profiles_sample_rate=0.1 if settings.ENVIRONMENT == 'production' else 1.0,
            integrations=[
                FastApiIntegration(transaction_style="endpoint"),
                SqlalchemyIntegration(),
                RedisIntegration(),
            ],
            release=f"mirastros-backend@{settings.APP_VERSION}",
            send_default_pii=False,
            attach_stacktrace=True,
            max_breadcrumbs=50,
            before_send=before_send_callback,
        )
        logger.info("Sentry initialized for environment: %s", settings.ENVIRONMENT)
    except Exception as e:
        logger.warning("Sentry init failed (invalid DSN?). Error tracking disabled: %s", e)


def before_send_callback(event, hint):
    """
    Filter sensitive data before sending to Sentry
    """
    # Remove sensitive headers
    if 'request' in event and 'headers' in event['request']:
        headers = event['request']['headers']
        sensitive_headers = ['authorization', 'cookie', 'x-api-key']
        for header in sensitive_headers:
            if header in headers:
                headers[header] = '[Filtered]'
    
    # Remove password fields from request data
    if 'request' in event and 'data' in event['request']:
        data = event['request']['data']
        if isinstance(data, dict):
            if 'password' in data:
                data['password'] = '[Filtered]'
            if 'password_hash' in data:
                data['password_hash'] = '[Filtered]'
    
    return event


def capture_exception(error: Exception, context: Optional[dict] = None):
    """
    Capture exception and send to Sentry with context
    """
    if context:
        sentry_sdk.set_context("custom", context)
    
    sentry_sdk.capture_exception(error)
    logger.error(f"Exception captured: {str(error)}", exc_info=True)


def capture_message(message: str, level: str = "info", context: Optional[dict] = None):
    """
    Capture message and send to Sentry
    """
    if context:
        sentry_sdk.set_context("custom", context)
    
    sentry_sdk.capture_message(message, level=level)
    
    if level == "error":
        logger.error(message)
    elif level == "warning":
        logger.warning(message)
    else:
        logger.info(message)


def set_user_context(user_id: str, email: Optional[str] = None):
    """
    Set user context for Sentry
    """
    sentry_sdk.set_user({
        "id": user_id,
        "email": email
    })


def clear_user_context():
    """
    Clear user context
    """
    sentry_sdk.set_user(None)


def add_breadcrumb(message: str, category: str = "default", level: str = "info", data: Optional[dict] = None):
    """
    Add breadcrumb for debugging
    """
    sentry_sdk.add_breadcrumb(
        message=message,
        category=category,
        level=level,
        data=data or {}
    )


# Application logger
app_logger = logging.getLogger("mirastros")
app_logger.setLevel(logging.INFO)
