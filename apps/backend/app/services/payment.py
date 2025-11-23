"""Payment Gateway Services"""

from typing import Optional, Dict, Any
from decimal import Decimal
import httpx
import hashlib
import hmac
import json
from datetime import datetime

from app.core.config import get_settings

settings = get_settings()


class YooKassaService:
    """YooKassa (ЮKassa) payment gateway service for Russian market"""
    
    def __init__(self):
        self.shop_id = settings.YOOKASSA_SHOP_ID
        self.secret_key = settings.YOOKASSA_SECRET_KEY
        self.api_url = "https://api.yookassa.ru/v3"
    
    async def create_payment(
        self,
        amount: Decimal,
        currency: str,
        order_id: str,
        description: str,
        return_url: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a payment in YooKassa
        
        Args:
            amount: Payment amount
            currency: Currency code (RUB)
            order_id: Order ID
            description: Payment description
            return_url: URL to redirect after payment
            metadata: Additional metadata
        
        Returns:
            Payment data with confirmation URL
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/payments",
                auth=(self.shop_id, self.secret_key),
                headers={
                    "Idempotence-Key": order_id,
                    "Content-Type": "application/json"
                },
                json={
                    "amount": {
                        "value": str(amount),
                        "currency": currency
                    },
                    "confirmation": {
                        "type": "redirect",
                        "return_url": return_url
                    },
                    "capture": True,
                    "description": description,
                    "metadata": metadata or {}
                }
            )
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                raise Exception(f"YooKassa payment creation failed: {response.text}")
    
    async def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """Get payment status"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.api_url}/payments/{payment_id}",
                auth=(self.shop_id, self.secret_key)
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"YooKassa get payment failed: {response.text}")
    
    async def cancel_payment(self, payment_id: str) -> Dict[str, Any]:
        """Cancel a payment"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/payments/{payment_id}/cancel",
                auth=(self.shop_id, self.secret_key)
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"YooKassa cancel payment failed: {response.text}")
    
    def verify_webhook(self, payload: str, signature: str) -> bool:
        """Verify webhook signature"""
        expected_signature = hmac.new(
            self.secret_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)


class StripeService:
    """Stripe payment gateway service for international market"""
    
    def __init__(self):
        self.api_key = settings.STRIPE_SECRET_KEY
        self.api_url = "https://api.stripe.com/v1"
        self.webhook_secret = settings.STRIPE_WEBHOOK_SECRET
    
    async def create_payment_intent(
        self,
        amount: int,  # Amount in cents
        currency: str,
        order_id: str,
        description: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a payment intent in Stripe
        
        Args:
            amount: Payment amount in cents (e.g., 2999 for $29.99)
            currency: Currency code (usd, eur, etc.)
            order_id: Order ID
            description: Payment description
            metadata: Additional metadata
        
        Returns:
            Payment intent data with client secret
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/payment_intents",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data={
                    "amount": amount,
                    "currency": currency.lower(),
                    "description": description,
                    "metadata[order_id]": order_id,
                    **{f"metadata[{k}]": v for k, v in (metadata or {}).items()}
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Stripe payment intent creation failed: {response.text}")
    
    async def get_payment_intent(self, payment_intent_id: str) -> Dict[str, Any]:
        """Get payment intent status"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.api_url}/payment_intents/{payment_intent_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Stripe get payment intent failed: {response.text}")
    
    async def cancel_payment_intent(self, payment_intent_id: str) -> Dict[str, Any]:
        """Cancel a payment intent"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/payment_intents/{payment_intent_id}/cancel",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Stripe cancel payment intent failed: {response.text}")
    
    async def create_checkout_session(
        self,
        amount: int,
        currency: str,
        order_id: str,
        product_name: str,
        success_url: str,
        cancel_url: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe Checkout session
        
        Args:
            amount: Payment amount in cents
            currency: Currency code
            order_id: Order ID
            product_name: Product name
            success_url: URL to redirect on success
            cancel_url: URL to redirect on cancel
            metadata: Additional metadata
        
        Returns:
            Checkout session data with URL
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/checkout/sessions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data={
                    "mode": "payment",
                    "success_url": success_url,
                    "cancel_url": cancel_url,
                    "line_items[0][price_data][currency]": currency.lower(),
                    "line_items[0][price_data][product_data][name]": product_name,
                    "line_items[0][price_data][unit_amount]": amount,
                    "line_items[0][quantity]": 1,
                    "metadata[order_id]": order_id,
                    **{f"metadata[{k}]": v for k, v in (metadata or {}).items()}
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Stripe checkout session creation failed: {response.text}")
    
    def verify_webhook(self, payload: bytes, signature: str) -> Optional[Dict[str, Any]]:
        """Verify Stripe webhook signature"""
        try:
            import stripe
            stripe.api_key = self.api_key
            
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            return event
        except Exception as e:
            print(f"Webhook verification failed: {e}")
            return None


class PaymentService:
    """Unified payment service that handles both YooKassa and Stripe"""
    
    def __init__(self):
        self.yookassa = YooKassaService()
        self.stripe = StripeService()
    
    async def create_payment(
        self,
        amount: Decimal,
        currency: str,
        order_id: str,
        description: str,
        payment_method: str,
        return_url: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a payment using the specified payment method
        
        Args:
            amount: Payment amount
            currency: Currency code
            order_id: Order ID
            description: Payment description
            payment_method: Payment method (yookassa or stripe)
            return_url: URL to redirect after payment
            metadata: Additional metadata
        
        Returns:
            Payment data with confirmation URL or client secret
        """
        if payment_method == "yookassa":
            return await self.yookassa.create_payment(
                amount, currency, order_id, description, return_url, metadata
            )
        elif payment_method == "stripe":
            # Convert amount to cents for Stripe
            amount_cents = int(amount * 100)
            return await self.stripe.create_payment_intent(
                amount_cents, currency, order_id, description, metadata
            )
        else:
            raise ValueError(f"Unsupported payment method: {payment_method}")
    
    async def get_payment_status(
        self,
        payment_id: str,
        payment_method: str
    ) -> Dict[str, Any]:
        """Get payment status"""
        if payment_method == "yookassa":
            return await self.yookassa.get_payment(payment_id)
        elif payment_method == "stripe":
            return await self.stripe.get_payment_intent(payment_id)
        else:
            raise ValueError(f"Unsupported payment method: {payment_method}")
    
    async def cancel_payment(
        self,
        payment_id: str,
        payment_method: str
    ) -> Dict[str, Any]:
        """Cancel a payment"""
        if payment_method == "yookassa":
            return await self.yookassa.cancel_payment(payment_id)
        elif payment_method == "stripe":
            return await self.stripe.cancel_payment_intent(payment_id)
        else:
            raise ValueError(f"Unsupported payment method: {payment_method}")
