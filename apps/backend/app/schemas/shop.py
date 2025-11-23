"""Shop Pydantic Schemas"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


# Product Schemas
class ProductBase(BaseModel):
    """Base product schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    category: str = Field(..., description="crystals, tarot-decks, books, ritual-items")
    price: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=3)
    stock_quantity: int = Field(default=0, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)
    zodiac_signs: Optional[str] = Field(None, description="Comma-separated zodiac signs")
    is_active: bool = Field(default=True)
    
    @validator('category')
    def validate_category(cls, v):
        valid_categories = ['crystals', 'tarot-decks', 'books', 'ritual-items']
        if v not in valid_categories:
            raise ValueError(f"Category must be one of: {', '.join(valid_categories)}")
        return v


class ProductCreate(ProductBase):
    """Schema for creating a product"""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    stock_quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)
    zodiac_signs: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    """Schema for product response"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    """Schema for product list response"""
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int


# Order Schemas
class ShippingAddress(BaseModel):
    """Shipping address schema"""
    name: str = Field(..., min_length=1, max_length=255)
    address: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1, max_length=100)
    country: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    phone: str = Field(..., min_length=1, max_length=50)


class OrderItem(BaseModel):
    """Order item schema"""
    product_id: str
    name: str
    quantity: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)


class OrderCreate(BaseModel):
    """Schema for creating an order"""
    items: List[OrderItem] = Field(..., min_items=1)
    shipping_address: ShippingAddress
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    """Schema for order response"""
    id: str
    user_id: str
    order_number: str
    status: str
    items: List[dict]
    total_amount: Decimal
    currency: str
    payment_method: Optional[str]
    payment_id: Optional[str]
    shipping_address: dict
    tracking_number: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    """Schema for order list response"""
    orders: List[OrderResponse]
    total: int


class OrderStatusUpdate(BaseModel):
    """Schema for updating order status"""
    status: str = Field(..., description="pending, paid, processing, shipped, delivered, cancelled")
    tracking_number: Optional[str] = None
    
    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v


# Recommendation Schemas
class ProductRecommendationResponse(BaseModel):
    """Schema for product recommendations"""
    products: List[ProductResponse]
    reason: str = Field(..., description="Reason for recommendation based on natal chart")
