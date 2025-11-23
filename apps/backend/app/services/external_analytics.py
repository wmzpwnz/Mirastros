"""External analytics integration service for Mixpanel and Amplitude."""
import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class ExternalAnalyticsService:
    """Service for sending events to external analytics platforms."""
    
    def __init__(self):
        self.mixpanel_token = settings.MIXPANEL_TOKEN if hasattr(settings, 'MIXPANEL_TOKEN') else None
        self.amplitude_api_key = settings.AMPLITUDE_API_KEY if hasattr(settings, 'AMPLITUDE_API_KEY') else None
        self.enabled = bool(self.mixpanel_token or self.amplitude_api_key)
        
        if not self.enabled:
            logger.warning("External analytics not configured. Set MIXPANEL_TOKEN or AMPLITUDE_API_KEY in environment.")
    
    async def track_event(
        self,
        event_name: str,
        user_id: Optional[str] = None,
        properties: Optional[Dict[str, Any]] = None,
        platform: Optional[str] = None
    ):
        """
        Track an event to external analytics platforms.
        
        Args:
            event_name: Name of the event
            user_id: User identifier
            properties: Event properties
            platform: Platform (web, mobile, telegram, vk)
        """
        if not self.enabled:
            return
        
        properties = properties or {}
        properties['platform'] = platform
        properties['timestamp'] = datetime.utcnow().isoformat()
        
        # Send to Mixpanel
        if self.mixpanel_token:
            await self._send_to_mixpanel(event_name, user_id, properties)
        
        # Send to Amplitude
        if self.amplitude_api_key:
            await self._send_to_amplitude(event_name, user_id, properties)
    
    async def _send_to_mixpanel(
        self,
        event_name: str,
        user_id: Optional[str],
        properties: Dict[str, Any]
    ):
        """Send event to Mixpanel."""
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "event": event_name,
                    "properties": {
                        "token": self.mixpanel_token,
                        "distinct_id": user_id or "anonymous",
                        "time": int(datetime.utcnow().timestamp()),
                        **properties
                    }
                }
                
                response = await client.post(
                    "https://api.mixpanel.com/track",
                    json=[payload],
                    timeout=5.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Mixpanel error: {response.status_code} - {response.text}")
                else:
                    logger.debug(f"Sent event to Mixpanel: {event_name}")
                    
        except Exception as e:
            logger.error(f"Failed to send event to Mixpanel: {e}")
    
    async def _send_to_amplitude(
        self,
        event_name: str,
        user_id: Optional[str],
        properties: Dict[str, Any]
    ):
        """Send event to Amplitude."""
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "api_key": self.amplitude_api_key,
                    "events": [
                        {
                            "user_id": user_id or "anonymous",
                            "event_type": event_name,
                            "time": int(datetime.utcnow().timestamp() * 1000),  # Amplitude uses milliseconds
                            "event_properties": properties
                        }
                    ]
                }
                
                response = await client.post(
                    "https://api2.amplitude.com/2/httpapi",
                    json=payload,
                    timeout=5.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Amplitude error: {response.status_code} - {response.text}")
                else:
                    logger.debug(f"Sent event to Amplitude: {event_name}")
                    
        except Exception as e:
            logger.error(f"Failed to send event to Amplitude: {e}")
    
    async def identify_user(
        self,
        user_id: str,
        properties: Dict[str, Any]
    ):
        """
        Identify a user with properties.
        
        Args:
            user_id: User identifier
            properties: User properties (email, name, subscription_tier, etc.)
        """
        if not self.enabled:
            return
        
        # Send to Mixpanel
        if self.mixpanel_token:
            await self._identify_mixpanel(user_id, properties)
        
        # Send to Amplitude
        if self.amplitude_api_key:
            await self._identify_amplitude(user_id, properties)
    
    async def _identify_mixpanel(
        self,
        user_id: str,
        properties: Dict[str, Any]
    ):
        """Identify user in Mixpanel."""
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "$token": self.mixpanel_token,
                    "$distinct_id": user_id,
                    "$set": properties
                }
                
                response = await client.post(
                    "https://api.mixpanel.com/engage",
                    json=[payload],
                    timeout=5.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Mixpanel identify error: {response.status_code}")
                else:
                    logger.debug(f"Identified user in Mixpanel: {user_id}")
                    
        except Exception as e:
            logger.error(f"Failed to identify user in Mixpanel: {e}")
    
    async def _identify_amplitude(
        self,
        user_id: str,
        properties: Dict[str, Any]
    ):
        """Identify user in Amplitude."""
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "api_key": self.amplitude_api_key,
                    "identification": [
                        {
                            "user_id": user_id,
                            "user_properties": properties
                        }
                    ]
                }
                
                response = await client.post(
                    "https://api2.amplitude.com/identify",
                    json=payload,
                    timeout=5.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Amplitude identify error: {response.status_code}")
                else:
                    logger.debug(f"Identified user in Amplitude: {user_id}")
                    
        except Exception as e:
            logger.error(f"Failed to identify user in Amplitude: {e}")


# Global instance
external_analytics = ExternalAnalyticsService()
