# Payment Integration Guide

This document describes the payment gateway integration for the Mirastros shop.

## Overview

The shop supports two payment gateways:
- **YooKassa (ЮKassa)**: For Russian market (RUB currency)
- **Stripe**: For international market (USD, EUR, etc.)

## Setup

### 1. YooKassa Setup

1. Register at [yookassa.ru](https://yookassa.ru)
2. Get your Shop ID and Secret Key from the dashboard
3. Add to `.env`:
```env
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
```

4. Configure webhook URL in YooKassa dashboard:
```
https://mirastros.ru/api/payments/webhook/yookassa
```

### 2. Stripe Setup

1. Register at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

4. Configure webhook endpoint in Stripe dashboard:
```
https://mirastros.ru/api/payments/webhook/stripe
```

5. Subscribe to these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

## API Endpoints

### Create Payment

**POST** `/payments/create`

Creates a payment for an order.

**Request:**
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_method": "stripe",
  "return_url": "https://mirastros.ru/orders/success"
}
```

**Response (Stripe):**
```json
{
  "payment_id": "pi_1234567890",
  "status": "requires_payment_method",
  "amount": 49.99,
  "currency": "USD",
  "client_secret": "pi_1234567890_secret_abcdef"
}
```

**Response (YooKassa):**
```json
{
  "payment_id": "2a5f6c8d-1234-5678-90ab-cdef12345678",
  "status": "pending",
  "amount": 49.99,
  "currency": "RUB",
  "confirmation_url": "https://yoomoney.ru/checkout/payments/v2/contract?orderId=..."
}
```

### Get Payment Status

**GET** `/payments/status/{payment_id}?payment_method=stripe`

Gets the current status of a payment.

**Response:**
```json
{
  "payment_id": "pi_1234567890",
  "status": "succeeded",
  "amount": 49.99,
  "currency": "USD",
  "paid": true,
  "created_at": "2025-01-22T10:30:00Z"
}
```

## Payment Flow

### Stripe Flow

1. **Create Order**: User creates an order via `/shop/orders`
2. **Create Payment**: Frontend calls `/payments/create` with `payment_method: "stripe"`
3. **Get Client Secret**: Backend returns `client_secret`
4. **Stripe Elements**: Frontend uses Stripe Elements to collect payment
5. **Confirm Payment**: Stripe confirms payment and sends webhook
6. **Update Order**: Webhook handler updates order status to "paid"

### YooKassa Flow

1. **Create Order**: User creates an order via `/shop/orders`
2. **Create Payment**: Frontend calls `/payments/create` with `payment_method: "yookassa"`
3. **Get Confirmation URL**: Backend returns `confirmation_url`
4. **Redirect**: Frontend redirects user to YooKassa payment page
5. **Complete Payment**: User completes payment on YooKassa
6. **Webhook**: YooKassa sends webhook notification
7. **Update Order**: Webhook handler updates order status to "paid"

## Frontend Integration

### Stripe Integration (React/Next.js)

```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key');

function CheckoutForm({ clientSecret, orderId }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      console.error(result.error.message);
    } else {
      // Payment succeeded
      console.log('Payment successful!');
      // Redirect to success page
      window.location.href = `/orders/${orderId}/success`;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
}

function PaymentPage({ orderId }) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment
    fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        payment_method: 'stripe',
        return_url: window.location.origin + '/orders/success',
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.client_secret));
  }, [orderId]);

  return (
    <Elements stripe={stripePromise}>
      {clientSecret && (
        <CheckoutForm clientSecret={clientSecret} orderId={orderId} />
      )}
    </Elements>
  );
}
```

### YooKassa Integration (React/Next.js)

```typescript
function PaymentPage({ orderId }) {
  const handleYooKassaPayment = async () => {
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        payment_method: 'yookassa',
        return_url: window.location.origin + '/orders/success',
      }),
    });

    const data = await response.json();
    
    // Redirect to YooKassa payment page
    window.location.href = data.confirmation_url;
  };

  return (
    <button onClick={handleYooKassaPayment}>
      Pay with YooKassa
    </button>
  );
}
```

## Testing

### Test Cards

**Stripe:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

**YooKassa:**
- Use test mode in YooKassa dashboard
- Test cards provided in YooKassa documentation

### Running Tests

```bash
# Install dependencies
pip install -r requirements.txt

# Run payment tests
python test_payments.py
```

## Webhook Security

### YooKassa

Webhooks are verified using HMAC-SHA256 signature:
```python
signature = hmac.new(
    secret_key.encode(),
    payload.encode(),
    hashlib.sha256
).hexdigest()
```

### Stripe

Webhooks are verified using Stripe's webhook signature:
```python
event = stripe.Webhook.construct_event(
    payload, signature, webhook_secret
)
```

## Order Status Flow

1. **pending**: Order created, awaiting payment
2. **paid**: Payment successful
3. **processing**: Order being prepared
4. **shipped**: Order shipped (tracking number added)
5. **delivered**: Order delivered
6. **cancelled**: Order cancelled (payment failed or refunded)

## Error Handling

### Common Errors

- `400 Bad Request`: Invalid payment method or order already paid
- `404 Not Found`: Order not found
- `500 Internal Server Error`: Payment gateway error

### Retry Logic

- Failed payments should be retried by the user
- Webhook failures are automatically retried by payment gateways
- Order status is eventually consistent

## Production Checklist

- [ ] Replace test API keys with production keys
- [ ] Configure webhook URLs in payment gateway dashboards
- [ ] Test webhook delivery
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications for payment events
- [ ] Test refund flow
- [ ] Set up fraud detection rules
- [ ] Configure 3D Secure for Stripe
- [ ] Test currency conversion
- [ ] Set up payment reconciliation

## Support

For issues with:
- **YooKassa**: support@yookassa.ru
- **Stripe**: https://support.stripe.com

## References

- [YooKassa API Documentation](https://yookassa.ru/developers/api)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [YooKassa Checkout](https://yookassa.ru/developers/payment-forms/basics)
