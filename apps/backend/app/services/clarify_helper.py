"""Helper functions for Clarify with Mirastros feature"""

from app.models.user import User, SubscriptionTier


def is_clarify_available(user: User) -> bool:
    """
    Check if 'Clarify with Mirastros' feature is available for the user
    
    Args:
        user: User model instance
    
    Returns:
        bool: True if user has Premium or Platinum subscription, False otherwise
    """
    return user.subscription_tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PLATINUM]


def add_clarify_info(response_data: dict, user: User, reading_id: str = None) -> dict:
    """
    Add clarify availability information to a service response
    
    Args:
        response_data: The service response dictionary
        user: User model instance
        reading_id: Optional ID of the reading for chat context
    
    Returns:
        dict: Response data with clarify_available and reading_id fields added
    """
    response_data["clarify_available"] = is_clarify_available(user)
    if reading_id:
        response_data["reading_id"] = reading_id
    return response_data
