from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.core.redis import redis_client
from app.core.monitoring import init_sentry, app_logger
from app.services.llm import llm_service
from app.services.embedding import embedding_service
from app.middleware.rate_limit import RateLimitMiddleware
from app.api import ai, documents, auth, social_auth, subscriptions, natal_chart, runes, tarot, iching, horoscope, lenormand, numerology, dream, transits, synastry, lunar, crystals, rituals, horary, chakra, solar_return, karmic, mandala, chat, journal, shop, payments, admin, analytics, health, access, password_reset, email_verification, notifications

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    app_logger.info("🚀 Starting Mirastros API...")
    
    # Initialize Sentry
    init_sentry()
    
    # Connect services
    await redis_client.connect()
    await llm_service.load_model()
    await embedding_service.load_model()
    
    app_logger.info("✅ All services loaded")
    
    yield
    
    # Shutdown
    app_logger.info("🛑 Shutting down...")
    await redis_client.disconnect()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Mirastros Universal API
    
    AI-powered esoteric services platform offering astrology, tarot, numerology, 
    dream interpretation, and more. Powered by Qwen 2.5-7B AI model with RAG capabilities.
    
    ### Features
    
    - 🔮 **Tarot Readings**: 78-card deck with AI interpretations
    - ⭐ **Astrology**: Natal charts, horoscopes, transits, synastry
    - 🔢 **Numerology**: Life path, destiny, soul urge numbers
    - 💭 **Dream Interpretation**: AI-powered dream analysis
    - 🪨 **Crystals & Runes**: Recommendations and readings
    - 🌙 **Lunar Calendar**: Moon phase guidance
    - 💬 **AI Chat**: "Clarify with Mirastros" assistant
    - 📔 **Journal**: Track your spiritual journey
    - 🛍️ **Shop**: Esoteric products and tools
    
    ### Authentication
    
    Most endpoints require JWT authentication. Include the token in the Authorization header:
    ```
    Authorization: Bearer YOUR_JWT_TOKEN
    ```
    
    ### Subscription Tiers
    
    - **Freemium**: Limited access to basic features
    - **Premium** ($9.99/month): Unlimited access to core services
    - **Platinum** ($29.99/month): VIP features including personalized AI astrologer
    
    ### Rate Limits
    
    - General API: 60 requests/minute
    - AI Services: 20 requests/minute per user
    - Chat Streaming: 10 concurrent connections
    
    ### Support
    
    - Documentation: https://docs.mirastros.com
    - Email: support@mirastros.com
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "Authentication", "description": "User registration, login, and token management"},
        {"name": "Social Authentication", "description": "Google, Apple, Telegram, VK login"},
        {"name": "Password Reset", "description": "Password reset functionality"},
        {"name": "Email Verification", "description": "Email verification for new accounts"},
        {"name": "Subscriptions", "description": "Subscription plans and management"},
        {"name": "Payments", "description": "Payment processing and history"},
        {"name": "Natal Chart", "description": "Birth chart calculations and interpretations"},
        {"name": "Horoscope", "description": "Daily, weekly, and monthly horoscopes"},
        {"name": "Tarot", "description": "Tarot card readings and interpretations"},
        {"name": "Numerology", "description": "Numerology calculations"},
        {"name": "Dreams", "description": "Dream interpretation and journal"},
        {"name": "Runes", "description": "Elder Futhark rune readings"},
        {"name": "I Ching", "description": "Book of Changes consultations"},
        {"name": "Lenormand", "description": "Lenormand card readings"},
        {"name": "Transits", "description": "Planetary transit analysis"},
        {"name": "Synastry", "description": "Relationship compatibility analysis"},
        {"name": "Lunar", "description": "Lunar calendar and recommendations"},
        {"name": "Crystals", "description": "Crystal recommendations and properties"},
        {"name": "Rituals", "description": "Personalized rituals and meditations"},
        {"name": "Horary", "description": "Horary astrology questions (Platinum)"},
        {"name": "Chakra", "description": "Chakra analysis and balancing"},
        {"name": "Solar Return", "description": "Yearly forecasts (Platinum)"},
        {"name": "Karmic", "description": "Karmic lessons and soul purpose"},
        {"name": "Mandala", "description": "Personalized mandala generation"},
        {"name": "Chat", "description": "AI chat assistant (Premium/Platinum)"},
        {"name": "Journal", "description": "Practice journal and insights"},
        {"name": "Shop", "description": "Esoteric products and orders"},
        {"name": "Notifications", "description": "Push notification management"},
        {"name": "Admin", "description": "Administrative endpoints"},
        {"name": "Analytics", "description": "Platform analytics and metrics"},
        {"name": "Health", "description": "Service health checks"},
    ],
    contact={
        "name": "Mirastros Support",
        "email": "support@mirastros.com",
        "url": "https://www.mirastros.com/support"
    },
    license_info={
        "name": "Proprietary",
        "url": "https://www.mirastros.com/terms"
    }
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting (60 requests per minute)
app.add_middleware(RateLimitMiddleware, requests_per_minute=60)

# Include routers
app.include_router(health.router)  # Health checks first
app.include_router(auth.router)
app.include_router(social_auth.router)
app.include_router(password_reset.router)
app.include_router(email_verification.router)
app.include_router(subscriptions.router)
app.include_router(access.router)  # Access control and upgrade info
app.include_router(ai.router)
app.include_router(documents.router)
app.include_router(natal_chart.router)
app.include_router(horoscope.router)
app.include_router(runes.router)
app.include_router(tarot.router)
app.include_router(iching.router)
app.include_router(lenormand.router)
app.include_router(numerology.router)
app.include_router(dream.router)
app.include_router(transits.router)
app.include_router(synastry.router)
app.include_router(lunar.router)
app.include_router(crystals.router)
app.include_router(rituals.router)
app.include_router(horary.router)
app.include_router(chakra.router)
app.include_router(solar_return.router)
app.include_router(karmic.router)
app.include_router(mandala.router)
app.include_router(chat.router)
app.include_router(journal.router)
app.include_router(shop.router)
app.include_router(payments.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(analytics.router)

@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }
