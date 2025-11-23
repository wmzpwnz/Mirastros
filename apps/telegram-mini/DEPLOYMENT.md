# Telegram Mini App Deployment Guide

## Prerequisites

1. **Telegram Bot**: Create a bot using [@BotFather](https://t.me/BotFather)
2. **Domain**: A domain where the app will be hosted (e.g., `mirastros.com`)
3. **Backend API**: Running backend with Telegram auth support
4. **Node.js**: Version 18+ for building the app

## Step 1: Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://mirastros.com/api
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## Step 2: Build the App

```bash
cd apps/telegram-mini

# Install dependencies
npm install

# Build for production
npm run build

# Export static files
npm run export
```

This creates an `out/` directory with static files.

## Step 3: Deploy Static Files

### Option A: Serve from Main Domain

Upload the `out/` directory to your web server:

```bash
# Example: Copy to nginx web root
scp -r out/* user@server:/var/www/mirastros.com/telegram/
```

Configure nginx:

```nginx
location /telegram {
    alias /var/www/mirastros.com/telegram;
    try_files $uri $uri/ /telegram/index.html;
    
    # Enable CORS for Telegram
    add_header Access-Control-Allow-Origin "https://web.telegram.org";
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
}
```

### Option B: Use CDN

Upload to Cloudflare Pages, Vercel, or Netlify:

```bash
# Cloudflare Pages
npx wrangler pages publish out

# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=out
```

## Step 4: Configure Telegram Bot

1. Open [@BotFather](https://t.me/BotFather)
2. Send `/mybots`
3. Select your bot
4. Choose "Bot Settings" → "Menu Button"
5. Set Mini App URL: `https://mirastros.com/telegram`

Alternatively, use the API:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Open Mirastros",
      "web_app": {
        "url": "https://mirastros.com/telegram"
      }
    }
  }'
```

## Step 5: Configure Backend

Ensure your backend supports:

### Telegram Authentication

```python
# apps/backend/app/api/social_auth.py
@router.post("/auth/social/telegram")
async def telegram_login(telegram_data: TelegramAuthData):
    # Verify Telegram data
    # Create or find user
    # Return JWT tokens
```

### Telegram Payments

```python
# apps/backend/app/api/payments.py
@router.post("/payments/telegram/create-invoice")
async def create_telegram_invoice(
    title: str,
    description: str,
    amount: int,
    payload: str
):
    # Create invoice with Telegram Bot API
    # Return invoice_link
```

### Telegram Notifications

```python
# apps/backend/app/api/telegram.py
@router.get("/telegram/notifications/preferences")
async def get_notification_preferences():
    # Return user preferences

@router.put("/telegram/notifications/preferences")
async def update_notification_preferences(prefs: dict):
    # Update preferences
    # Configure bot notifications
```

## Step 6: Set Up Telegram Bot Notifications

Create a bot script to send notifications:

```python
import asyncio
from telegram import Bot

bot = Bot(token="YOUR_BOT_TOKEN")

async def send_daily_horoscope(user_telegram_id: int, horoscope: str):
    await bot.send_message(
        chat_id=user_telegram_id,
        text=f"🌟 Your Daily Horoscope\n\n{horoscope}",
        parse_mode="HTML"
    )

# Schedule with cron or celery
```

## Step 7: Configure Telegram Stars Payments

1. Enable payments in [@BotFather](https://t.me/BotFather):
   - Send `/mybots`
   - Select your bot
   - Choose "Payments" → "Telegram Stars"

2. Set up webhook for payment notifications:

```python
@router.post("/telegram/webhook")
async def telegram_webhook(update: dict):
    if "pre_checkout_query" in update:
        # Verify payment
        await bot.answer_pre_checkout_query(
            pre_checkout_query_id=update["pre_checkout_query"]["id"],
            ok=True
        )
    
    if "message" in update and "successful_payment" in update["message"]:
        # Payment successful
        # Update user subscription
        payload = json.loads(update["message"]["successful_payment"]["invoice_payload"])
        await update_subscription(
            user_id=update["message"]["from"]["id"],
            tier=payload["subscription_tier"]
        )
```

## Step 8: Test the Mini App

1. Open your bot in Telegram
2. Click the menu button
3. Test authentication
4. Test service pages (Tarot, Horoscope, Natal)
5. Test payment flow (use test mode first)
6. Test notifications

## Step 9: Enable Test Mode (Optional)

For testing payments without real charges:

```python
# Use test bot token
TEST_BOT_TOKEN = "your_test_bot_token"

# Create test invoices
invoice = await bot.create_invoice_link(
    title="Test Subscription",
    description="Test payment",
    payload="test",
    provider_token="",  # Empty for Telegram Stars
    currency="XTR",
    prices=[{"label": "Test", "amount": 1}],
    is_test=True  # Test mode
)
```

## Step 10: Monitor and Maintain

### Logging

Monitor logs for:
- Authentication errors
- Payment failures
- API errors
- User feedback

### Analytics

Track:
- User registrations
- Service usage
- Payment conversions
- Notification engagement

### Updates

To update the app:

```bash
# Build new version
npm run build && npm run export

# Deploy
scp -r out/* user@server:/var/www/mirastros.com/telegram/

# Clear Telegram cache (users may need to restart)
```

## Troubleshooting

### Mini App Not Loading

- Check CORS headers
- Verify HTTPS is enabled
- Check browser console for errors
- Ensure bot menu button is configured

### Authentication Failing

- Verify backend endpoint is accessible
- Check Telegram user data is being sent
- Verify JWT token generation
- Check CORS configuration

### Payments Not Working

- Ensure Telegram Stars is enabled in BotFather
- Verify webhook is configured
- Check payment provider settings
- Test with small amounts first

### Notifications Not Sending

- Verify bot token is correct
- Check user has started the bot
- Ensure webhook is receiving updates
- Check notification preferences

## Security Checklist

- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] JWT tokens secured
- [ ] Payment webhooks verified
- [ ] User data encrypted
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Set cache headers for static assets
- [ ] Minimize bundle size
- [ ] Lazy load images
- [ ] Use CDN for static files
- [ ] Optimize API response times

## Compliance

- [ ] Privacy policy accessible
- [ ] Terms of service accessible
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy
- [ ] User data deletion process

## Support

For issues or questions:
- Check logs in backend
- Review Telegram Bot API documentation
- Test in Telegram's test environment
- Contact Telegram support for platform issues

## Resources

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Stars Payments](https://core.telegram.org/bots/payments)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
