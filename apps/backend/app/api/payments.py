"""Payment API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from typing import Optional
import json

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.order import Order
from app.services.payment import PaymentService
from app.services.shop import ShopService
from app.schemas.payment import (
    PaymentCreateRequest,
    PaymentResponse,
    PaymentStatusResponse
)

router = APIRouter(prefix="/payments", tags=["payments"])


def get_payment_service() -> PaymentService:
    """Dependency to get PaymentService instance"""
    return PaymentService()


def get_shop_service() -> ShopService:
    """Dependency to get ShopService instance"""
    return ShopService()


@router.post("/create", response_model=PaymentResponse)
async def create_payment(
    payment_request: PaymentCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    payment_service: PaymentService = Depends(get_payment_service),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Create a payment for an order
    
    - **order_id**: Order UUID
    - **payment_method**: Payment method (yookassa or stripe)
    - **return_url**: URL to redirect after payment
    
    Returns payment data with confirmation URL or client secret
    """
    try:
        # Get order
        order = await shop_service.get_order(db, payment_request.order_id, str(current_user.id))
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check if order is already paid
        if order.status == "paid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order is already paid"
            )
        
        # Validate payment method
        if payment_request.payment_method not in ["yookassa", "stripe"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment method. Use 'yookassa' or 'stripe'"
            )
        
        # Determine currency based on payment method
        currency = "RUB" if payment_request.payment_method == "yookassa" else "USD"
        
        # Create payment
        payment_data = await payment_service.create_payment(
            amount=order.total_amount,
            currency=currency,
            order_id=payment_request.order_id,
            description=f"Order {order.order_number}",
            payment_method=payment_request.payment_method,
            return_url=payment_request.return_url,
            metadata={
                "user_id": str(current_user.id),
                "order_number": order.order_number
            }
        )
        
        # Update order with payment info using parameterized query
        payment_id = payment_data.get("id")
        
        # Use SQLAlchemy update() to prevent SQL injection
        await db.execute(
            update(Order)
            .where(Order.id == payment_request.order_id)
            .values(
                payment_method=payment_request.payment_method,
                payment_id=payment_id
            )
        )
        await db.commit()
        
        if payment_request.payment_method == "yookassa":
            confirmation_url = payment_data.get("confirmation", {}).get("confirmation_url")
            
            return PaymentResponse(
                payment_id=payment_id,
                status=payment_data.get("status"),
                amount=order.total_amount,
                currency=currency,
                confirmation_url=confirmation_url
            )
        
        elif payment_request.payment_method == "stripe":
            client_secret = payment_data.get("client_secret")
            
            return PaymentResponse(
                payment_id=payment_id,
                status=payment_data.get("status"),
                amount=order.total_amount,
                currency=currency,
                client_secret=client_secret
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment: {str(e)}"
        )


@router.get("/status/{payment_id}", response_model=PaymentStatusResponse)
async def get_payment_status(
    payment_id: str,
    payment_method: str,
    current_user: User = Depends(get_current_user),
    payment_service: PaymentService = Depends(get_payment_service)
):
    """
    Get payment status
    
    - **payment_id**: Payment ID
    - **payment_method**: Payment method (yookassa or stripe)
    
    Returns current payment status
    """
    try:
        payment_data = await payment_service.get_payment_status(payment_id, payment_method)
        
        if payment_method == "yookassa":
            return PaymentStatusResponse(
                payment_id=payment_id,
                status=payment_data.get("status"),
                amount=float(payment_data.get("amount", {}).get("value", 0)),
                currency=payment_data.get("amount", {}).get("currency", "RUB"),
                paid=payment_data.get("paid", False),
                created_at=payment_data.get("created_at", "")
            )
        elif payment_method == "stripe":
            return PaymentStatusResponse(
                payment_id=payment_id,
                status=payment_data.get("status"),
                amount=payment_data.get("amount", 0) / 100,  # Convert from cents
                currency=payment_data.get("currency", "usd").upper(),
                paid=payment_data.get("status") == "succeeded",
                created_at=str(payment_data.get("created", ""))
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get payment status: {str(e)}"
        )


@router.post("/webhook/yookassa")
async def yookassa_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    payment_service: PaymentService = Depends(get_payment_service),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    YooKassa webhook handler
    
    Receives payment notifications from YooKassa
    """
    try:
        # Get raw body and signature
        body = await request.body()
        signature = request.headers.get("X-Yookassa-Signature", "")
        
        # Verify signature
        if not payment_service.yookassa.verify_webhook(body.decode(), signature):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )
        
        # Parse event
        event = json.loads(body)
        payment_data = event.get("object", {})
        
        # Get order ID from metadata
        order_id = payment_data.get("metadata", {}).get("order_id")
        if not order_id:
            return {"status": "ignored"}
        
        # Update order status based on payment status
        payment_status = payment_data.get("status")
        if payment_status == "succeeded":
            await shop_service.update_order_status(db, order_id, "paid")
        elif payment_status == "canceled":
            await shop_service.update_order_status(db, order_id, "cancelled")
        
        return {"status": "ok"}
    
    except Exception as e:
        print(f"YooKassa webhook error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        )


@router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
    db: AsyncSession = Depends(get_db),
    payment_service: PaymentService = Depends(get_payment_service),
    shop_service: ShopService = Depends(get_shop_service)
):
    """
    Stripe webhook handler
    
    Receives payment notifications from Stripe
    """
    try:
        # Get raw body
        body = await request.body()
        
        # Verify signature
        event = payment_service.stripe.verify_webhook(body, stripe_signature)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )
        
        # Handle event
        event_type = event.get("type")
        payment_intent = event.get("data", {}).get("object", {})
        
        # Get order ID from metadata
        order_id = payment_intent.get("metadata", {}).get("order_id")
        if not order_id:
            return {"status": "ignored"}
        
        # Update order status based on event type
        if event_type == "payment_intent.succeeded":
            await shop_service.update_order_status(db, order_id, "paid")
        elif event_type == "payment_intent.payment_failed":
            await shop_service.update_order_status(db, order_id, "cancelled")
        
        return {"status": "ok"}
    
    except Exception as e:
        print(f"Stripe webhook error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        )
