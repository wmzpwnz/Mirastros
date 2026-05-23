from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, timezone, timedelta
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.user import User, SubscriptionTier
from app.models.subscription import Subscription
from app.models.tarot_reading import TarotReading
from app.models.horoscope import Horoscope
from app.models.document import Document
from app.models.product import Product
from app.models.order import Order
from app.middleware.rate_limit import get_rate_limit_info
from app.services.cache import cache_service

router = APIRouter(prefix="/admin", tags=["Admin"])

# Response Models
class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    subscription_tier: str
    subscription_expires: Optional[datetime]
    created_at: datetime
    last_login: Optional[datetime]
    birth_date: Optional[date]
    zodiac_sign: Optional[str]

class UserDetailResponse(UserResponse):
    birth_time: Optional[str]
    birth_location: Optional[dict]
    google_id: Optional[str]
    apple_id: Optional[str]
    telegram_id: Optional[str]
    vk_id: Optional[str]
    updated_at: datetime

class UserStatsResponse(BaseModel):
    total_users: int
    freemium_users: int
    premium_users: int
    platinum_users: int
    active_users_today: int
    new_users_this_week: int
    new_users_this_month: int

class SubscriptionStatsResponse(BaseModel):
    total_subscriptions: int
    active_subscriptions: int
    expired_subscriptions: int
    premium_count: int
    platinum_count: int
    monthly_revenue: float
    annual_revenue: float

class ServiceUsageResponse(BaseModel):
    service_name: str
    usage_count: int
    percentage: float

class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    subscription_tier: Optional[str] = None
    subscription_expires: Optional[datetime] = None

# User Management Endpoints
@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    subscription_tier: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """List all users with pagination and filtering"""
    query = select(User)
    
    # Apply filters
    if search:
        query = query.where(
            or_(
                User.email.ilike(f"%{search}%"),
                User.full_name.ilike(f"%{search}%")
            )
        )
    
    if subscription_tier:
        query = query.where(User.subscription_tier == subscription_tier)
    
    # Apply pagination
    query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [
        UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            subscription_tier=user.subscription_tier.value,
            subscription_expires=user.subscription_expires,
            created_at=user.created_at,
            last_login=user.last_login,
            birth_date=user.birth_date,
            zodiac_sign=user.zodiac_sign
        )
        for user in users
    ]

@router.get("/users/{user_id}", response_model=UserDetailResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Get detailed user information"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserDetailResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        subscription_tier=user.subscription_tier.value,
        subscription_expires=user.subscription_expires,
        created_at=user.created_at,
        last_login=user.last_login,
        birth_date=user.birth_date,
        birth_time=str(user.birth_time) if user.birth_time else None,
        birth_location=user.birth_location,
        zodiac_sign=user.zodiac_sign,
        google_id=user.google_id,
        apple_id=user.apple_id,
        telegram_id=user.telegram_id,
        vk_id=user.vk_id,
        updated_at=user.updated_at
    )

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Update user information"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if update_data.full_name:
        user.full_name = update_data.full_name
    if update_data.subscription_tier:
        user.subscription_tier = SubscriptionTier(update_data.subscription_tier)
    if update_data.subscription_expires:
        user.subscription_expires = update_data.subscription_expires
    
    user.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(user)
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        subscription_tier=user.subscription_tier.value,
        subscription_expires=user.subscription_expires,
        created_at=user.created_at,
        last_login=user.last_login,
        birth_date=user.birth_date,
        zodiac_sign=user.zodiac_sign
    )

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Delete a user and all associated data"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.delete(user)
    await db.commit()
    
    return {"message": "User deleted successfully"}

# Statistics Endpoints
@router.get("/stats/users", response_model=UserStatsResponse)
async def get_user_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Get user statistics"""
    from datetime import timedelta
    
    # Total users
    total_result = await db.execute(select(func.count(User.id)))
    total_users = total_result.scalar()
    
    # Users by tier
    freemium_result = await db.execute(
        select(func.count(User.id)).where(User.subscription_tier == SubscriptionTier.FREEMIUM)
    )
    freemium_users = freemium_result.scalar()
    
    premium_result = await db.execute(
        select(func.count(User.id)).where(User.subscription_tier == SubscriptionTier.PREMIUM)
    )
    premium_users = premium_result.scalar()
    
    platinum_result = await db.execute(
        select(func.count(User.id)).where(User.subscription_tier == SubscriptionTier.PLATINUM)
    )
    platinum_users = platinum_result.scalar()
    
    # Active users today
    today = datetime.now(timezone.utc).date()
    active_today_result = await db.execute(
        select(func.count(User.id)).where(
            func.date(User.last_login) == today
        )
    )
    active_users_today = active_today_result.scalar() or 0
    
    # New users this week
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    new_week_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= week_ago)
    )
    new_users_this_week = new_week_result.scalar()
    
    # New users this month
    month_ago = datetime.now(timezone.utc) - timedelta(days=30)
    new_month_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= month_ago)
    )
    new_users_this_month = new_month_result.scalar()
    
    return UserStatsResponse(
        total_users=total_users,
        freemium_users=freemium_users,
        premium_users=premium_users,
        platinum_users=platinum_users,
        active_users_today=active_users_today,
        new_users_this_week=new_users_this_week,
        new_users_this_month=new_users_this_month
    )

@router.get("/stats/subscriptions", response_model=SubscriptionStatsResponse)
async def get_subscription_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Get subscription statistics"""
    now = datetime.now(timezone.utc)
    
    # Total subscriptions
    total_result = await db.execute(select(func.count(Subscription.id)))
    total_subscriptions = total_result.scalar()
    
    # Active subscriptions
    active_result = await db.execute(
        select(func.count(Subscription.id)).where(
            and_(
                Subscription.status == "active",
                Subscription.expires_at > now
            )
        )
    )
    active_subscriptions = active_result.scalar()
    
    # Expired subscriptions
    expired_result = await db.execute(
        select(func.count(Subscription.id)).where(
            or_(
                Subscription.status == "expired",
                Subscription.expires_at <= now
            )
        )
    )
    expired_subscriptions = expired_result.scalar()
    
    # Premium count
    premium_result = await db.execute(
        select(func.count(Subscription.id)).where(
            and_(
                Subscription.tier == "premium",
                Subscription.status == "active"
            )
        )
    )
    premium_count = premium_result.scalar()
    
    # Platinum count
    platinum_result = await db.execute(
        select(func.count(Subscription.id)).where(
            and_(
                Subscription.tier == "platinum",
                Subscription.status == "active"
            )
        )
    )
    platinum_count = platinum_result.scalar()
    
    # Revenue calculations (simplified)
    monthly_revenue = (premium_count * 9.99) + (platinum_count * 29.99)
    annual_revenue = monthly_revenue * 12
    
    return SubscriptionStatsResponse(
        total_subscriptions=total_subscriptions,
        active_subscriptions=active_subscriptions,
        expired_subscriptions=expired_subscriptions,
        premium_count=premium_count,
        platinum_count=platinum_count,
        monthly_revenue=monthly_revenue,
        annual_revenue=annual_revenue
    )

@router.get("/stats/service-usage", response_model=List[ServiceUsageResponse])
async def get_service_usage(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Get service usage statistics"""
    # Count tarot readings
    tarot_result = await db.execute(select(func.count(TarotReading.id)))
    tarot_count = tarot_result.scalar()
    
    # Count horoscopes (cached, so this is approximate)
    horoscope_result = await db.execute(select(func.count(Horoscope.id)))
    horoscope_count = horoscope_result.scalar()
    
    # Total
    total = tarot_count + horoscope_count
    
    if total == 0:
        return []
    
    return [
        ServiceUsageResponse(
            service_name="Tarot",
            usage_count=tarot_count,
            percentage=round((tarot_count / total) * 100, 2)
        ),
        ServiceUsageResponse(
            service_name="Horoscope",
            usage_count=horoscope_count,
            percentage=round((horoscope_count / total) * 100, 2)
        )
    ]

# Shop Management Endpoints
class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    price: float
    currency: str
    stock_quantity: int
    is_active: bool
    image_url: Optional[str]
    zodiac_signs: Optional[str]
    created_at: datetime

class OrderResponse(BaseModel):
    id: str
    user_id: str
    user_email: str
    total_amount: float
    status: str
    created_at: datetime
    items_count: int

@router.get("/shop/products", response_model=List[ProductResponse])
async def list_products(
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """List all products with filtering"""
    query = select(Product)
    
    if category:
        query = query.where(Product.category == category)
    if is_active is not None:
        query = query.where(Product.is_active == is_active)
    
    query = query.offset(skip).limit(limit).order_by(Product.created_at.desc())
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    return [
        ProductResponse(
            id=str(product.id),
            name=product.name,
            description=product.description,
            category=product.category,
            price=float(product.price),
            currency=product.currency,
            stock_quantity=product.stock_quantity,
            is_active=product.is_active,
            image_url=product.image_url,
            zodiac_signs=product.zodiac_signs,
            created_at=product.created_at
        )
        for product in products
    ]

@router.get("/shop/orders", response_model=List[OrderResponse])
async def list_orders(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """List all orders with filtering"""
    query = select(Order).join(User)
    
    if status:
        query = query.where(Order.status == status)
    
    query = query.offset(skip).limit(limit).order_by(Order.created_at.desc())
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return [
        OrderResponse(
            id=str(order.id),
            user_id=str(order.user_id),
            user_email=order.user.email,
            total_amount=float(order.total_amount),
            status=order.status,
            created_at=order.created_at,
            items_count=len(order.items) if order.items else 0
        )
        for order in orders
    ]


# Content Moderation Endpoints
class JournalEntryResponse(BaseModel):
    id: str
    user_id: str
    user_email: str
    entry_type: str
    title: str
    content: str
    tags: Optional[list]
    created_at: datetime
    flagged: bool = False

class ModerationActionRequest(BaseModel):
    action: str  # approve, flag, delete
    reason: Optional[str] = None

@router.get("/moderation/journal-entries", response_model=List[JournalEntryResponse])
async def list_journal_entries(
    flagged_only: bool = Query(False, description="Show only flagged entries"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """List journal entries for moderation"""
    from app.models.journal_entry import JournalEntry
    
    query = select(JournalEntry).join(User)
    
    if flagged_only:
        # In a real implementation, you'd have a flagged field
        # For now, we'll just return all entries
        pass
    
    query = query.offset(skip).limit(limit).order_by(JournalEntry.created_at.desc())
    
    result = await db.execute(query)
    entries = result.scalars().all()
    
    return [
        JournalEntryResponse(
            id=str(entry.id),
            user_id=str(entry.user_id),
            user_email=entry.user.email,
            entry_type=entry.entry_type,
            title=entry.title,
            content=entry.content,
            tags=entry.tags,
            created_at=entry.created_at,
            flagged=False  # Would check actual flag status
        )
        for entry in entries
    ]

@router.post("/moderation/journal-entries/{entry_id}/action")
async def moderate_journal_entry(
    entry_id: str,
    action_data: ModerationActionRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Take moderation action on a journal entry"""
    from app.models.journal_entry import JournalEntry
    
    result = await db.execute(select(JournalEntry).where(JournalEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    if action_data.action == "delete":
        await db.delete(entry)
        await db.commit()
        return {"message": "Entry deleted successfully"}
    elif action_data.action == "flag":
        # In a real implementation, you'd set a flag field
        return {"message": "Entry flagged successfully"}
    elif action_data.action == "approve":
        # In a real implementation, you'd clear the flag
        return {"message": "Entry approved successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

@router.get("/moderation/stats")
async def get_moderation_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Get moderation statistics"""
    from app.models.journal_entry import JournalEntry
    
    # Total journal entries
    total_result = await db.execute(select(func.count(JournalEntry.id)))
    total_entries = total_result.scalar()
    
    # In a real implementation, you'd count flagged entries
    flagged_entries = 0
    
    return {
        "total_journal_entries": total_entries,
        "flagged_entries": flagged_entries,
        "pending_review": flagged_entries
    }

# Rate Limiting Monitoring
class RateLimitInfoResponse(BaseModel):
    requests_per_minute: int
    current_count: int
    remaining: int
    reset_time: int

@router.get("/rate-limit/{identifier}", response_model=RateLimitInfoResponse)
async def get_user_rate_limit(
    identifier: str,
    _: User = Depends(require_admin)
):
    """Get rate limit information for a user or IP"""
    info = await get_rate_limit_info(identifier)
    return RateLimitInfoResponse(**info)

# Cache Management
@router.get("/cache/stats")
async def get_cache_stats(
    _: User = Depends(require_admin)
):
    """Get cache statistics"""
    return await cache_service.get_cache_stats()

@router.post("/cache/invalidate/horoscopes")
async def invalidate_horoscope_cache(
    zodiac_sign: Optional[str] = None,
    period: Optional[str] = None,
    _: User = Depends(require_admin)
):
    """Invalidate horoscope cache"""
    await cache_service.invalidate_horoscope(zodiac_sign, period)
    return {"message": "Horoscope cache invalidated"}

@router.post("/cache/invalidate/products")
async def invalidate_product_cache(
    _: User = Depends(require_admin)
):
    """Invalidate product catalog cache"""
    await cache_service.invalidate_products()
    return {"message": "Product cache invalidated"}

@router.post("/cache/invalidate/user/{user_id}")
async def invalidate_user_cache(
    user_id: str,
    _: User = Depends(require_admin)
):
    """Invalidate all cache for a specific user"""
    await cache_service.invalidate_user_profile(user_id)
    await cache_service.invalidate_natal_chart(user_id)
    await cache_service.invalidate_subscription_status(user_id)
    return {"message": f"Cache invalidated for user {user_id}"}

@router.delete("/cache/clear")
async def clear_all_cache(
    _: User = Depends(require_admin)
):
    """Clear all cache (use with caution!)"""
    await cache_service.clear_all_cache()
    return {"message": "All cache cleared"}
