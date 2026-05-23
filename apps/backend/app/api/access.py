"""Access control and upgrade information API"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.core.deps import get_db, get_current_user
from app.core.access_control import FeatureAccessControl, get_upgrade_prompt
from app.models.user import User, SubscriptionTier
from pydantic import BaseModel

router = APIRouter(prefix="/access", tags=["access"])


class FeatureAccessResponse(BaseModel):
    """Response model for feature access check"""
    feature: str
    has_access: bool
    current_tier: str
    required_tier: str | None
    usage_info: Dict[str, Any] | None
    upgrade_prompt: Dict[str, Any] | None


class UsageLimitsResponse(BaseModel):
    """Response model for usage limits"""
    tier: str
    features: Dict[str, Dict[str, Any]]


@router.get("/check/{feature}", response_model=FeatureAccessResponse)
async def check_feature_access(
    feature: str,
    current_user: User = Depends(get_current_user)
):
    """
    Check if user has access to a specific feature
    
    Returns access status, usage information, and upgrade prompt if needed
    """
    try:
        # Check feature access
        has_access = FeatureAccessControl.check_feature_access(current_user, feature)
        required_tier = FeatureAccessControl.get_required_tier(feature)
        
        # Get usage information for Freemium users
        usage_info = None
        tier = FeatureAccessControl._normalize_tier(current_user.subscription_tier)
        if tier == SubscriptionTier.FREEMIUM:
            has_usage, current_usage, limit = await FeatureAccessControl.check_usage_limit(
                current_user, feature
            )
            usage_info = {
                "current_usage": current_usage,
                "limit": limit,
                "remaining": limit - current_usage if limit > 0 else -1
            }
        
        # Get upgrade prompt if no access
        upgrade_prompt = None
        if not has_access:
            upgrade_prompt = get_upgrade_prompt(feature, current_user.subscription_tier)
        
        return {
            "feature": feature,
            "has_access": has_access,
            "current_tier": tier.value,
            "required_tier": required_tier.value if required_tier else None,
            "usage_info": usage_info,
            "upgrade_prompt": upgrade_prompt
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check feature access: {str(e)}"
        )


@router.get("/limits", response_model=UsageLimitsResponse)
async def get_usage_limits(
    current_user: User = Depends(get_current_user)
):
    """
    Get usage limits for current user's tier
    
    Returns all features with their access status and usage limits
    """
    try:
        tier = FeatureAccessControl._normalize_tier(current_user.subscription_tier)
        features = {}

        # Get all features for this tier
        tier_features = FeatureAccessControl.TIER_FEATURES.get(tier, {})
        
        for feature, has_access in tier_features.items():
            feature_info = {
                "has_access": has_access,
                "limit": None,
                "current_usage": None
            }
            
            # Add usage limits for Freemium
            if tier == SubscriptionTier.FREEMIUM and has_access:
                limit = FeatureAccessControl.FREEMIUM_LIMITS.get(feature)
                if limit is not None:
                    has_usage, current_usage, _ = await FeatureAccessControl.check_usage_limit(
                        current_user, feature
                    )
                    feature_info["limit"] = limit
                    feature_info["current_usage"] = current_usage
                    feature_info["remaining"] = limit - current_usage
            
            features[feature] = feature_info
        
        return {
            "tier": tier.value,
            "features": features
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get usage limits: {str(e)}"
        )


@router.get("/upgrade-info/{tier}")
async def get_upgrade_info(
    tier: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get upgrade information for a specific tier
    
    Returns pricing, features, and benefits of upgrading
    """
    try:
        if tier not in ["premium", "platinum"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tier. Must be 'premium' or 'platinum'"
            )
        
        # Get upgrade prompt for a feature that requires this tier
        if tier == "premium":
            feature = "weekly_horoscope"
        else:
            feature = "horary"
        
        current_tier_normalized = FeatureAccessControl._normalize_tier(current_user.subscription_tier)
        upgrade_info = get_upgrade_prompt(feature, current_user.subscription_tier)

        # Add comparison with current tier
        current_features = FeatureAccessControl.TIER_FEATURES.get(current_tier_normalized, {})
        target_tier = SubscriptionTier.PREMIUM if tier == "premium" else SubscriptionTier.PLATINUM
        target_features = FeatureAccessControl.TIER_FEATURES.get(target_tier, {})

        # Find new features
        new_features = []
        for feature_name, has_access in target_features.items():
            if has_access and not current_features.get(feature_name, False):
                new_features.append(feature_name.replace("_", " ").title())

        upgrade_info["new_features"] = new_features
        upgrade_info["current_tier"] = current_tier_normalized.value
        
        return upgrade_info
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get upgrade info: {str(e)}"
        )
