"""Payment Pydantic Schemas"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from decimal import Decimal


class PaymentCreateRequest(BaseModel):
    """Schema for creating a payment"""
    order_id: str = Field(..., description="Order ID")
    payment_method: str = Field(..., description="Payment method (yookassa or stripe)")
    return_url: str = Field(..., description="URL to redirect after payment")
    
    class Config:
        json_schema_extra = {
            "example": {
                "order_id": "550e8400-e29b-41d4-a716-446655440000",
                "payment_method": "stripe",
                "return_url": "https://mirastros.ru/orders/success"
            }
        }


class PaymentResponse(BaseModel):
    """Schema for payment response"""
    payment_id: str
    status: str
    amount: Decimal
    currency: str
    confirmation_url: Optional[str] = None
    client_secret: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class PaymentStatusResponse(BaseModel):
    """Schema for payment status response"""
    payment_id: str
    status: str
    amount: Decimal
    currency: str
    paid: bool
    created_at: str


class WebhookEvent(BaseModel):
    """Schema for webhook event"""
    event_type: str
    payment_id: str
    order_id: str
    status: str
    amount: Optional[Decimal] = None
    currency: Optional[str] = None
