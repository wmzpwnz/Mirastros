# Mirastros Telegram Mini App

Telegram Mini App for Mirastros esoteric services platform.

## Features

- Telegram WebApp SDK integration
- Static export for hosting
- Tailwind CSS styling
- TypeScript support

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Export static files
npm run export
```

## Deployment

The app is configured for static export and can be hosted on any static hosting service or served from the main Mirastros domain at `/telegram`.

## Telegram Bot Setup

1. Create a bot with @BotFather
2. Set the Mini App URL in bot settings
3. Configure environment variables

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` - Telegram bot token

## Structure

```
telegram-mini/
├── src/
│   └── app/
│       ├── layout.tsx      # Root layout
│       ├── page.tsx        # Home page
│       └── globals.css     # Global styles
├── next.config.js          # Next.js config (static export)
├── tailwind.config.js      # Tailwind config
└── package.json
```

## Implementation Status

✅ **Completed:**
- Next.js 14 setup with App Router
- Telegram WebApp SDK integration
- Static export configuration
- Tailwind CSS styling with cosmic theme
- Telegram authentication with backend sync
- Simplified Z-Scroll effect for mobile
- Cosmic background with CSS animations
- Service pages:
  - Tarot reading (1, 3, and Celtic Cross spreads)
  - Horoscope (daily, weekly, monthly)
  - Natal chart calculation
- Telegram Stars payment integration
- Subscription management page
- Settings page with notification preferences
- Bot notification integration
- Haptic feedback and Telegram UI features
- Share and save readings to Telegram

## Features

### Authentication
- Automatic authentication using Telegram user data
- JWT token management with refresh
- Secure token storage in localStorage
- Account synchronization with backend

### Services
- **Tarot Reading**: Draw cards and receive AI interpretations
- **Horoscope**: Get daily, weekly, or monthly predictions
- **Natal Chart**: Calculate and interpret birth charts

### Telegram Integration
- **Telegram Stars Payments**: Subscribe using Telegram's in-app currency
- **Bot Notifications**: Receive horoscope, transit, and lunar alerts
- **Share Readings**: Share with Telegram contacts
- **Save to Telegram**: Save readings to Saved Messages
- **Haptic Feedback**: Enhanced UX with vibration feedback
- **Theme Integration**: Respects Telegram theme colors

### UI/UX
- Simplified Z-Scroll effect optimized for mobile
- Cosmic background with CSS animations
- Smooth scroll progress indicator
- Responsive design for all screen sizes
- Loading states and error handling

## Notes

- The app uses static export for easy deployment
- All images must be unoptimized for static export
- Telegram WebApp SDK provides user data and payment methods
- Requires Telegram version 6.1+ for payments
- Backend API must be configured in .env.local
