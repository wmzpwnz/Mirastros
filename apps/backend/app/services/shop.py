"""Shop Service"""

from typing import List, Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from decimal import Decimal
import uuid
from datetime import datetime

from app.models.product import Product
from app.models.order import Order
from app.models.user import User
from app.schemas.shop import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    OrderCreate,
    OrderResponse,
    OrderItem
)


class ShopService:
    """Service for managing shop products and orders"""
    
    async def create_product(
        self,
        db: AsyncSession,
        product_data: ProductCreate
    ) -> ProductResponse:
        """Create a new product"""
        product = Product(
            id=uuid.uuid4(),
            name=product_data.name,
            description=product_data.description,
            category=product_data.category,
            price=product_data.price,
            currency=product_data.currency,
            stock_quantity=product_data.stock_quantity,
            image_url=product_data.image_url,
            zodiac_signs=product_data.zodiac_signs,
            is_active=product_data.is_active
        )
        
        db.add(product)
        await db.commit()
        await db.refresh(product)
        
        return ProductResponse.model_validate(product)
    
    async def get_product(
        self,
        db: AsyncSession,
        product_id: str
    ) -> Optional[ProductResponse]:
        """Get a product by ID"""
        result = await db.execute(
            select(Product).where(Product.id == uuid.UUID(product_id))
        )
        product = result.scalar_one_or_none()
        
        if product:
            return ProductResponse.model_validate(product)
        return None
    
    async def get_products(
        self,
        db: AsyncSession,
        category: Optional[str] = None,
        is_active: bool = True,
        page: int = 1,
        page_size: int = 20
    ) -> tuple[List[ProductResponse], int]:
        """Get all products with optional filtering"""
        query = select(Product)
        
        # Apply filters
        filters = []
        if category:
            filters.append(Product.category == category)
        if is_active is not None:
            filters.append(Product.is_active == is_active)
        
        if filters:
            query = query.where(and_(*filters))
        
        # Get total count
        count_result = await db.execute(
            select(Product).where(and_(*filters)) if filters else select(Product)
        )
        total = len(count_result.all())
        
        # Apply pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        result = await db.execute(query)
        products = result.scalars().all()
        
        return [ProductResponse.model_validate(p) for p in products], total
    
    async def update_product(
        self,
        db: AsyncSession,
        product_id: str,
        product_data: ProductUpdate
    ) -> Optional[ProductResponse]:
        """Update a product"""
        result = await db.execute(
            select(Product).where(Product.id == uuid.UUID(product_id))
        )
        product = result.scalar_one_or_none()
        
        if not product:
            return None
        
        # Update fields
        update_data = product_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        product.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(product)
        
        return ProductResponse.model_validate(product)
    
    async def delete_product(
        self,
        db: AsyncSession,
        product_id: str
    ) -> bool:
        """Delete a product"""
        result = await db.execute(
            select(Product).where(Product.id == uuid.UUID(product_id))
        )
        product = result.scalar_one_or_none()
        
        if not product:
            return False
        
        await db.delete(product)
        await db.commit()
        
        return True
    
    async def create_order(
        self,
        db: AsyncSession,
        user_id: str,
        order_data: OrderCreate
    ) -> OrderResponse:
        """Create a new order"""
        # Calculate total amount
        total_amount = Decimal(0)
        for item in order_data.items:
            total_amount += item.price * item.quantity
        
        # Generate order number
        order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        
        # Create order
        order = Order(
            id=uuid.uuid4(),
            user_id=uuid.UUID(user_id),
            order_number=order_number,
            status="pending",
            items=[item.model_dump() for item in order_data.items],
            total_amount=total_amount,
            currency="USD",
            shipping_address=order_data.shipping_address.model_dump(),
            notes=order_data.notes
        )
        
        db.add(order)
        await db.commit()
        await db.refresh(order)
        
        return OrderResponse.model_validate(order)
    
    async def get_order(
        self,
        db: AsyncSession,
        order_id: str,
        user_id: Optional[str] = None
    ) -> Optional[OrderResponse]:
        """Get an order by ID"""
        query = select(Order).where(Order.id == uuid.UUID(order_id))
        
        if user_id:
            query = query.where(Order.user_id == uuid.UUID(user_id))
        
        result = await db.execute(query)
        order = result.scalar_one_or_none()
        
        if order:
            return OrderResponse.model_validate(order)
        return None
    
    async def get_user_orders(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> tuple[List[OrderResponse], int]:
        """Get all orders for a user"""
        # Get total count
        count_result = await db.execute(
            select(Order).where(Order.user_id == uuid.UUID(user_id))
        )
        total = len(count_result.all())
        
        # Get orders with pagination
        result = await db.execute(
            select(Order)
            .where(Order.user_id == uuid.UUID(user_id))
            .order_by(Order.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        orders = result.scalars().all()
        
        return [OrderResponse.model_validate(o) for o in orders], total
    
    async def update_order_status(
        self,
        db: AsyncSession,
        order_id: str,
        status: str,
        tracking_number: Optional[str] = None
    ) -> Optional[OrderResponse]:
        """Update order status"""
        result = await db.execute(
            select(Order).where(Order.id == uuid.UUID(order_id))
        )
        order = result.scalar_one_or_none()
        
        if not order:
            return None
        
        order.status = status
        if tracking_number:
            order.tracking_number = tracking_number
        order.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(order)
        
        return OrderResponse.model_validate(order)
    
    async def get_recommended_products(
        self,
        db: AsyncSession,
        zodiac_sign: str,
        limit: int = 5
    ) -> List[ProductResponse]:
        """Get product recommendations based on zodiac sign"""
        result = await db.execute(
            select(Product)
            .where(
                and_(
                    Product.is_active == True,
                    or_(
                        Product.zodiac_signs.contains(zodiac_sign),
                        Product.zodiac_signs.is_(None)
                    )
                )
            )
            .limit(limit)
        )
        products = result.scalars().all()
        
        return [ProductResponse.model_validate(p) for p in products]
