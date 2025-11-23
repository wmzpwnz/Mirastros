"""Shop API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.deps import get_db, get_current_user, require_admin
from app.models.user import User
from app.services.shop import ShopService
from app.schemas.shop import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    OrderCreate,
    OrderResponse,
    OrderListResponse,
    OrderStatusUpdate,
    ProductRecommendationResponse
)

router = APIRouter(prefix="/shop", tags=["shop"])


def get_shop_service() -> ShopService:
    """Dependency to get ShopService instance"""
    return ShopService()


# Product Endpoints
@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Create a new product (Admin only)
    
    - **name**: Product name
    - **description**: Product description
    - **category**: Product category (crystals, tarot-decks, books, ritual-items)
    - **price**: Product price
    - **stock_quantity**: Available stock
    - **zodiac_signs**: Comma-separated zodiac signs for recommendations
    """
    try:
        product = await shop_service.create_product(db, product_data)
        return product
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )


@router.get("/products", response_model=ProductListResponse)
async def get_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    is_active: bool = Query(True, description="Filter by active status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Get all products with optional filtering
    
    - **category**: Filter by category (optional)
    - **is_active**: Filter by active status (default: true)
    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 20, max: 100)
    """
    try:
        products, total = await shop_service.get_products(
            db, category, is_active, page, page_size
        )
        return {
            "products": products,
            "total": total,
            "page": page,
            "page_size": page_size
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve products: {str(e)}"
        )


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Get a specific product by ID
    
    - **product_id**: Product UUID
    """
    try:
        product = await shop_service.get_product(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve product: {str(e)}"
        )


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Update a product (Admin only)
    
    - **product_id**: Product UUID
    - All fields are optional
    """
    try:
        product = await shop_service.update_product(db, product_id, product_data)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product: {str(e)}"
        )


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Delete a product (Admin only)
    
    - **product_id**: Product UUID
    """
    try:
        success = await shop_service.delete_product(db, product_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete product: {str(e)}"
        )


# Order Endpoints
@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Create a new order
    
    - **items**: List of order items with product_id, name, quantity, price
    - **shipping_address**: Shipping address details
    - **notes**: Optional order notes
    """
    try:
        order = await shop_service.create_order(db, str(current_user.id), order_data)
        return order
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )


@router.get("/orders", response_model=OrderListResponse)
async def get_user_orders(
    limit: int = Query(10, ge=1, le=100, description="Maximum number of orders"),
    offset: int = Query(0, ge=0, description="Number of orders to skip"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Get current user's orders
    
    - **limit**: Maximum number of orders to return (default: 10, max: 100)
    - **offset**: Number of orders to skip (default: 0)
    """
    try:
        orders, total = await shop_service.get_user_orders(
            db, str(current_user.id), limit, offset
        )
        return {
            "orders": orders,
            "total": total
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve orders: {str(e)}"
        )


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Get a specific order by ID
    
    - **order_id**: Order UUID
    """
    try:
        order = await shop_service.get_order(db, order_id, str(current_user.id))
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        return order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve order: {str(e)}"
        )


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    status_data: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Update order status (Admin only)
    
    - **order_id**: Order UUID
    - **status**: New status (pending, paid, processing, shipped, delivered, cancelled)
    - **tracking_number**: Optional tracking number
    """
    try:
        order = await shop_service.update_order_status(
            db, order_id, status_data.status, status_data.tracking_number
        )
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        return order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order status: {str(e)}"
        )


# Recommendation Endpoint
@router.get("/recommendations", response_model=ProductRecommendationResponse)
async def get_product_recommendations(
    limit: int = Query(5, ge=1, le=20, description="Number of recommendations"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Get product recommendations based on user's natal chart
    
    - **limit**: Number of recommendations (default: 5, max: 20)
    
    Returns products recommended for the user's zodiac sign
    """
    try:
        # Get user's zodiac sign
        zodiac_sign = current_user.zodiac_sign
        if not zodiac_sign:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User zodiac sign not set. Please complete your profile."
            )
        
        products = await shop_service.get_recommended_products(db, zodiac_sign, limit)
        
        return {
            "products": products,
            "reason": f"Recommended for {zodiac_sign} based on your natal chart"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )
