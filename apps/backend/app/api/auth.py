"""Authentication API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, date, time, timezone
from typing import Optional
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.deps import get_current_active_user
from app.core.monitoring import app_logger
from app.models.user import User, SubscriptionTier
from app.models.analytics_event import EventType
from app.services.analytics import AnalyticsService
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    TokenRefresh,
    UserResponse,
    AuthResponse,
    UserUpdate
)
from app.services.email import EmailService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        preferred_language=user_data.preferred_language,
        timezone=user_data.timezone,
        subscription_tier=SubscriptionTier.FREEMIUM.value  # Use .value to get lowercase string
    )
    
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        # Extract user data immediately while session is active
        user_id_str = str(new_user.id)
        user_data = {
            "id": user_id_str,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "email_verified": new_user.email_verified,
            "birth_date": new_user.birth_date.isoformat() if new_user.birth_date else None,
            "birth_time": str(new_user.birth_time) if new_user.birth_time else None,
            "birth_location": new_user.birth_location,
            "zodiac_sign": new_user.zodiac_sign,
            "subscription_tier": new_user.subscription_tier.value if hasattr(new_user.subscription_tier, 'value') else str(new_user.subscription_tier),
            "subscription_expires": new_user.subscription_expires.isoformat() if new_user.subscription_expires else None,
            "preferred_language": new_user.preferred_language,
            "timezone": new_user.timezone,
            "created_at": new_user.created_at.isoformat() if new_user.created_at else None,
        }
    except Exception as e:
        await db.rollback()
        app_logger.error(f"Database error during registration: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )
    
    # Create tokens
    try:
        access_token = create_access_token(data={"sub": user_id_str})
        refresh_token = create_refresh_token(data={"sub": user_id_str})
    except Exception as e:
        app_logger.error(f"Failed to create tokens: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate authentication tokens: {str(e)}"
        )
    
    # Send verification email (non-blocking, fail silently if email service not configured)
    try:
        await EmailService.send_verification_email(db, new_user)
    except Exception as e:
        app_logger.warning(f"Failed to send verification email: {e}")
    
    # Track registration event (non-blocking, fail silently if analytics not configured)
    try:
        platform = request.headers.get("X-Platform", "web")
        await AnalyticsService.track_event(
            db=db,
            event_type=EventType.USER_REGISTERED,
            user_id=new_user.id,
            platform=platform,
            metadata={"email": new_user.email}
        )
    except Exception as e:
        app_logger.warning(f"Failed to track registration event: {e}")
    
    # Create response with pre-extracted data
    try:
        return AuthResponse(
            user=UserResponse(**user_data),
            access_token=access_token,
            refresh_token=refresh_token
        )
    except Exception as e:
        app_logger.error(f"Failed to create response: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create response: {str(e)}"
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    credentials: UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Login user and return JWT tokens"""
    # Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    user.last_login = datetime.now(timezone.utc).replace(tzinfo=None)
    await db.commit()
    await db.refresh(user)
    
    # Extract user data immediately while session is active
    user_id_str = str(user.id)
    user_data = {
        "id": user_id_str,
        "email": user.email,
        "full_name": user.full_name,
        "email_verified": user.email_verified,
        "birth_date": user.birth_date.isoformat() if user.birth_date else None,
        "birth_time": str(user.birth_time) if user.birth_time else None,
        "birth_location": user.birth_location,
        "zodiac_sign": user.zodiac_sign,
        "subscription_tier": user.subscription_tier.value if hasattr(user.subscription_tier, 'value') else str(user.subscription_tier),
        "subscription_expires": user.subscription_expires.isoformat() if user.subscription_expires else None,
        "preferred_language": user.preferred_language,
        "timezone": user.timezone,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
    
    # Track login event (non-blocking)
    try:
        platform = request.headers.get("X-Platform", "web")
        await AnalyticsService.track_event(
            db=db,
            event_type=EventType.USER_LOGIN,
            user_id=user.id,
            platform=platform
        )
    except Exception as e:
        app_logger.warning(f"Failed to track login event: {e}")
    
    # Create tokens
    access_token = create_access_token(data={"sub": user_id_str})
    refresh_token = create_refresh_token(data={"sub": user_id_str})
    
    return AuthResponse(
        user=UserResponse(**user_data),
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: TokenRefresh,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token using refresh token"""
    # Decode refresh token
    payload = decode_token(token_data.refresh_token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check token type
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user ID
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new tokens
    new_access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token
    )


@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Logout user (client should discard tokens)"""
    # Track logout event
    platform = request.headers.get("X-Platform", "web")
    await AnalyticsService.track_event(
        db=db,
        event_type=EventType.USER_LOGOUT,
        user_id=current_user.id,
        platform=platform
    )
    
    # In a stateless JWT system, logout is handled client-side
    # For enhanced security, you could implement a token blacklist in Redis
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user information"""
    # Refresh user to ensure we have latest data
    await db.refresh(current_user)
    
    # Extract user data explicitly to avoid async context issues
    user_data = {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "email_verified": current_user.email_verified,
        "birth_date": current_user.birth_date.isoformat() if current_user.birth_date else None,
        "birth_time": str(current_user.birth_time) if current_user.birth_time else None,
        "birth_location": current_user.birth_location,
        "zodiac_sign": current_user.zodiac_sign,
        "subscription_tier": current_user.subscription_tier.value if hasattr(current_user.subscription_tier, 'value') else str(current_user.subscription_tier),
        "subscription_expires": current_user.subscription_expires.isoformat() if current_user.subscription_expires else None,
        "preferred_language": current_user.preferred_language,
        "timezone": current_user.timezone,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }
    
    return UserResponse(**user_data)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile"""
    try:
        # Update full name
        if update_data.full_name is not None:
            current_user.full_name = update_data.full_name
        
        # Update email (check if already exists)
        if update_data.email is not None and update_data.email != current_user.email:
            result = await db.execute(select(User).where(User.email == update_data.email))
            existing_user = result.scalar_one_or_none()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            current_user.email = update_data.email
        
        # Update birth date
        if update_data.birth_date is not None:
            try:
                current_user.birth_date = date.fromisoformat(update_data.birth_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid birth_date format. Use YYYY-MM-DD"
                )
        
        # Update birth time
        if update_data.birth_time is not None:
            try:
                time_parts = update_data.birth_time.split(':')
                if len(time_parts) >= 2:
                    hour = int(time_parts[0])
                    minute = int(time_parts[1])
                    second = int(time_parts[2]) if len(time_parts) > 2 else 0
                    current_user.birth_time = time(hour, minute, second)
            except (ValueError, IndexError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid birth_time format. Use HH:MM:SS or HH:MM"
                )
        
        # Update birth location
        if update_data.birth_location is not None:
            current_user.birth_location = update_data.birth_location
        
        # Update language and timezone
        if update_data.preferred_language is not None:
            current_user.preferred_language = update_data.preferred_language
        
        if update_data.timezone is not None:
            current_user.timezone = update_data.timezone
        
        # Recalculate zodiac sign if birth date is set
        if current_user.birth_date:
            zodiac_sign = _calculate_zodiac_sign(current_user.birth_date)
            current_user.zodiac_sign = zodiac_sign
        
        # Auto-calculate natal chart for Premium/Platinum users if all birth data is present
        if (current_user.birth_date and 
            current_user.birth_time and 
            current_user.birth_location and 
            current_user.subscription_tier in ['premium', 'platinum']):
            
            try:
                from app.services.natal_chart import natal_chart_service
                
                # Extract coordinates from birth_location
                latitude = current_user.birth_location.get('latitude')
                longitude = current_user.birth_location.get('longitude')
                city = current_user.birth_location.get('city', '')
                country = current_user.birth_location.get('country', '')
                
                if latitude is not None and longitude is not None:
                    # Calculate natal chart
                    chart_data = natal_chart_service.calculate_chart(
                        name=current_user.full_name,
                        birth_date=current_user.birth_date,
                        birth_time=current_user.birth_time,
                        latitude=latitude,
                        longitude=longitude,
                        city=city,
                        nation=country,
                        house_system="placidus"
                    )
                    
                    # Save natal chart to database
                    await natal_chart_service.save_natal_chart(
                        db=db,
                        user_id=str(current_user.id),
                        chart_data=chart_data
                    )
                    
                    logger.info(f"Auto-generated natal chart for user {current_user.id}")
            except Exception as e:
                # Don't fail the profile update if natal chart generation fails
                logger.warning(f"Failed to auto-generate natal chart: {e}")
        
        await db.commit()
        await db.refresh(current_user)
        
        # Extract user data
        user_data = {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "email_verified": current_user.email_verified,
            "birth_date": current_user.birth_date.isoformat() if current_user.birth_date else None,
            "birth_time": str(current_user.birth_time) if current_user.birth_time else None,
            "birth_location": current_user.birth_location,
            "zodiac_sign": current_user.zodiac_sign,
            "subscription_tier": current_user.subscription_tier.value if hasattr(current_user.subscription_tier, 'value') else str(current_user.subscription_tier),
            "subscription_expires": current_user.subscription_expires.isoformat() if current_user.subscription_expires else None,
            "preferred_language": current_user.preferred_language,
            "timezone": current_user.timezone,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        }
        
        return UserResponse(**user_data)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        app_logger.error(f"Failed to update profile: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.put("/update-birth-data", response_model=UserResponse)
async def update_birth_data(
    birth_date: Optional[str] = Body(None),
    birth_time: Optional[str] = Body(None),
    birth_location: Optional[dict] = Body(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user birth data for natal chart calculation"""
    
    # Update birth date
    if birth_date:
        try:
            current_user.birth_date = date.fromisoformat(birth_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid birth_date format. Use YYYY-MM-DD"
            )
    
    # Update birth time
    if birth_time:
        try:
            time_parts = birth_time.split(':')
            if len(time_parts) >= 2:
                hour = int(time_parts[0])
                minute = int(time_parts[1])
                second = int(time_parts[2]) if len(time_parts) > 2 else 0
                current_user.birth_time = time(hour, minute, second)
        except (ValueError, IndexError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid birth_time format. Use HH:MM:SS or HH:MM"
            )
    
    # Update birth location
    if birth_location:
        current_user.birth_location = birth_location
    
    # Calculate zodiac sign from birth date (if birth date is set)
    if current_user.birth_date:
        zodiac_sign = _calculate_zodiac_sign(current_user.birth_date)
        current_user.zodiac_sign = zodiac_sign
    
    try:
        await db.commit()
        await db.refresh(current_user)
        
        # Auto-generate natal chart if user has premium and complete birth data
        if current_user.subscription_tier in ['premium', 'platinum']:
            if current_user.birth_date and current_user.birth_time and current_user.birth_location:
                birth_loc = current_user.birth_location
                lat = birth_loc.get('latitude')
                lng = birth_loc.get('longitude')
                if lat is not None and lng is not None:
                    try:
                        from app.services.natal_chart import natal_chart_service
                        city = birth_loc.get('city', '')
                        country = birth_loc.get('country', '')
                        chart_data = natal_chart_service.calculate_chart(
                            name=current_user.full_name,
                            birth_date=current_user.birth_date,
                            birth_time=current_user.birth_time,
                            latitude=float(lat),
                            longitude=float(lng),
                            city=city,
                            nation=country,
                            house_system="placidus",
                        )
                        await natal_chart_service.save_natal_chart(
                            db=db,
                            user_id=str(current_user.id),
                            chart_data=chart_data,
                        )
                        app_logger.info(f"Auto-generated natal chart for user {current_user.id}")
                    except Exception as e:
                        app_logger.error(f"Failed to auto-generate natal chart: {e}", exc_info=True)
        
        # Extract user data
        user_data = {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "email_verified": current_user.email_verified,
            "birth_date": current_user.birth_date.isoformat() if current_user.birth_date else None,
            "birth_time": str(current_user.birth_time) if current_user.birth_time else None,
            "birth_location": current_user.birth_location,
            "zodiac_sign": current_user.zodiac_sign,
            "subscription_tier": current_user.subscription_tier.value if hasattr(current_user.subscription_tier, 'value') else str(current_user.subscription_tier),
            "subscription_expires": current_user.subscription_expires.isoformat() if current_user.subscription_expires else None,
            "preferred_language": current_user.preferred_language,
            "timezone": current_user.timezone,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        }
        
        return UserResponse(**user_data)
    except Exception as e:
        await db.rollback()
        app_logger.error(f"Failed to update birth data: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update birth data: {str(e)}"
        )


def _calculate_zodiac_sign(birth_date: date) -> str:
    """Calculate zodiac sign from birth date"""
    month = birth_date.month
    day = birth_date.day
    
    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return "aries"
    elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return "taurus"
    elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return "gemini"
    elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return "cancer"
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "leo"
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "virgo"
    elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return "libra"
    elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return "scorpio"
    elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return "sagittarius"
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "capricorn"
    elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return "aquarius"
    else:
        return "pisces"
