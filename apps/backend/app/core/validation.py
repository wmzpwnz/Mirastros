"""
Enhanced input validation utilities
Provides additional validation beyond Pydantic for security
"""
import re
from typing import Any, Optional
from fastapi import HTTPException, status
from pydantic import ValidationError


# Regex patterns for validation
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
PASSWORD_PATTERN = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$')
PHONE_PATTERN = re.compile(r'^\+?1?\d{9,15}$')
URL_PATTERN = re.compile(r'^https?://[^\s<>"{}|\\^`\[\]]+$')
ALPHANUMERIC_PATTERN = re.compile(r'^[a-zA-Z0-9_-]+$')
NAME_PATTERN = re.compile(r'^[a-zA-Z\s\'-]+$')

# SQL injection patterns to block
SQL_INJECTION_PATTERNS = [
    r"(\bUNION\b.*\bSELECT\b)",
    r"(\bSELECT\b.*\bFROM\b)",
    r"(\bINSERT\b.*\bINTO\b)",
    r"(\bUPDATE\b.*\bSET\b)",
    r"(\bDELETE\b.*\bFROM\b)",
    r"(\bDROP\b.*\bTABLE\b)",
    r"(--|\#|\/\*|\*\/)",
    r"(\bOR\b.*=.*)",
    r"(\bAND\b.*=.*)",
    r"(';|\")",
]

# XSS patterns to block
XSS_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"javascript:",
    r"on\w+\s*=",
    r"<iframe",
    r"<object",
    r"<embed",
]


def validate_email(email: str) -> bool:
    """Validate email format"""
    if not email or len(email) > 255:
        return False
    return bool(EMAIL_PATTERN.match(email))


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password strength
    Returns: (is_valid, error_message)
    
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    """
    if not password:
        return False, "Password is required"
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if len(password) > 100:
        return False, "Password must be less than 100 characters"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    return True, None


def sanitize_string(text: str, max_length: int = 1000) -> str:
    """
    Sanitize string input to prevent injection attacks
    """
    if not text:
        return ""
    
    # Truncate to max length
    text = text[:max_length]
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Remove control characters except newlines and tabs
    text = ''.join(char for char in text if char == '\n' or char == '\t' or ord(char) >= 32)
    
    return text.strip()


def check_sql_injection(text: str) -> bool:
    """
    Check if text contains SQL injection patterns
    Returns True if suspicious patterns found
    """
    if not text:
        return False
    
    text_upper = text.upper()
    
    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, text_upper, re.IGNORECASE):
            return True
    
    return False


def check_xss(text: str) -> bool:
    """
    Check if text contains XSS patterns
    Returns True if suspicious patterns found
    """
    if not text:
        return False
    
    for pattern in XSS_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    
    return False


def validate_user_input(text: str, field_name: str = "input", max_length: int = 1000) -> str:
    """
    Comprehensive validation for user text input
    Raises HTTPException if validation fails
    """
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} cannot be empty"
        )
    
    if len(text) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} exceeds maximum length of {max_length} characters"
        )
    
    # Check for SQL injection
    if check_sql_injection(text):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name}: contains prohibited patterns"
        )
    
    # Check for XSS
    if check_xss(text):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name}: contains prohibited HTML/JavaScript"
        )
    
    # Sanitize and return
    return sanitize_string(text, max_length)


def validate_coordinates(latitude: float, longitude: float) -> bool:
    """Validate geographic coordinates"""
    if not (-90 <= latitude <= 90):
        return False
    if not (-180 <= longitude <= 180):
        return False
    return True


def validate_zodiac_sign(sign: str) -> bool:
    """Validate zodiac sign"""
    valid_signs = [
        "aries", "taurus", "gemini", "cancer", "leo", "virgo",
        "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
    ]
    return sign.lower() in valid_signs


def validate_spread_type(spread_type: str, valid_types: list[str]) -> bool:
    """Validate spread type for card readings"""
    return spread_type.lower() in [t.lower() for t in valid_types]


def validate_uuid(uuid_str: str) -> bool:
    """Validate UUID format"""
    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    return bool(uuid_pattern.match(uuid_str))


def validate_date_range(start_date: Any, end_date: Any) -> bool:
    """Validate that start_date is before end_date"""
    if not start_date or not end_date:
        return False
    return start_date <= end_date


def validate_pagination(skip: int, limit: int, max_limit: int = 100) -> tuple[int, int]:
    """
    Validate and normalize pagination parameters
    Returns: (skip, limit)
    """
    skip = max(0, skip)
    limit = max(1, min(limit, max_limit))
    return skip, limit


def validate_file_upload(
    filename: str,
    content_type: str,
    file_size: int,
    allowed_extensions: list[str],
    max_size_mb: int = 10
) -> tuple[bool, Optional[str]]:
    """
    Validate file upload
    Returns: (is_valid, error_message)
    """
    # Check file size
    max_size_bytes = max_size_mb * 1024 * 1024
    if file_size > max_size_bytes:
        return False, f"File size exceeds maximum of {max_size_mb}MB"
    
    # Check extension
    if '.' not in filename:
        return False, "File must have an extension"
    
    extension = filename.rsplit('.', 1)[1].lower()
    if extension not in allowed_extensions:
        return False, f"File type .{extension} not allowed. Allowed types: {', '.join(allowed_extensions)}"
    
    # Check for path traversal
    if '..' in filename or '/' in filename or '\\' in filename:
        return False, "Invalid filename"
    
    return True, None


def validate_json_field(data: Any, required_keys: list[str] = None) -> bool:
    """Validate JSON field structure"""
    if not isinstance(data, dict):
        return False
    
    if required_keys:
        for key in required_keys:
            if key not in data:
                return False
    
    return True


class ValidationException(HTTPException):
    """Custom validation exception"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )


def handle_pydantic_error(error: ValidationError) -> HTTPException:
    """Convert Pydantic validation error to HTTPException"""
    errors = []
    for err in error.errors():
        field = " -> ".join(str(x) for x in err["loc"])
        message = err["msg"]
        errors.append(f"{field}: {message}")
    
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail={"message": "Validation error", "errors": errors}
    )
