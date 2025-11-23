"""Unit tests for authentication logic"""

import pytest
from datetime import datetime, timedelta
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    decode_token
)


class TestAuthentication:
    """Test authentication functions"""
    
    def test_password_hashing(self):
        """Test password hashing and verification"""
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("wrong_password", hashed) is False
    
    def test_create_access_token(self):
        """Test access token creation"""
        user_id = "test-user-id"
        token = create_access_token(data={"sub": user_id})
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_create_refresh_token(self):
        """Test refresh token creation"""
        user_id = "test-user-id"
        token = create_refresh_token(data={"sub": user_id})
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_decode_valid_token(self):
        """Test decoding valid token"""
        user_id = "test-user-id"
        token = create_access_token(data={"sub": user_id})
        
        payload = decode_token(token)
        
        assert payload is not None
        assert payload.get("sub") == user_id
    
    def test_decode_expired_token(self):
        """Test decoding expired token"""
        user_id = "test-user-id"
        # Create token that expires immediately
        token = create_access_token(
            data={"sub": user_id},
            expires_delta=timedelta(seconds=-1)
        )
        
        payload = decode_token(token)
        
        assert payload is None
    
    def test_decode_invalid_token(self):
        """Test decoding invalid token"""
        invalid_token = "invalid.token.here"
        
        payload = decode_token(invalid_token)
        
        assert payload is None
    
    def test_token_with_custom_expiry(self):
        """Test token with custom expiration"""
        user_id = "test-user-id"
        expires_delta = timedelta(hours=2)
        
        token = create_access_token(
            data={"sub": user_id},
            expires_delta=expires_delta
        )
        
        payload = decode_token(token)
        
        assert payload is not None
        assert payload.get("sub") == user_id
        
        # Check expiration time
        exp = payload.get("exp")
        assert exp is not None
        
        exp_time = datetime.fromtimestamp(exp)
        now = datetime.utcnow()
        time_diff = exp_time - now
        
        # Should be approximately 2 hours (with some tolerance)
        assert timedelta(hours=1, minutes=50) < time_diff < timedelta(hours=2, minutes=10)
