# Mirastros VK Mini App

VK Mini App for Mirastros - мистический AI-оракул для эзотерических услуг.

## Features

- ✅ VK Bridge integration
- ✅ VK ID authentication
- ✅ VK Pay payments
- ✅ VK social features (sharing, wall posts)
- ✅ Simplified Z-Scroll effect
- ✅ Cosmic background animation
- ✅ Core services: Tarot, Horoscope, Natal Chart
- ✅ Subscription management
- ✅ Settings with VK features

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- VK Bridge SDK
- VK Mini Apps Platform

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3003
```

## Build

```bash
# Build for production
npm run build

# Export static files
npm run export
```

## Deployment

The VK Mini App should be deployed as a static web app and registered in VK Mini Apps platform.

### Steps:

1. Build and export the app:
   ```bash
   npm run build
   npm run export
   ```

2. Upload the `out/` directory to your hosting (e.g., VK Hosting, Vercel, Netlify)

3. Register the app in VK Mini Apps:
   - Go to https://vk.com/apps?act=manage
   - Create new Mini App
   - Set the app URL to your hosting URL
   - Configure VK Pay merchant settings
   - Set up OAuth redirect URLs

4. Update environment variables:
   ```
   NEXT_PUBLIC_VK_APP_ID=your_vk_app_id
   NEXT_PUBLIC_API_URL=your_backend_api_url
   ```

## VK Bridge Features

### Authentication
- Automatic VK ID authentication
- User info retrieval
- Access token management

### Payments
- VK Pay integration
- Premium subscription (999 RUB/month)
- Platinum subscription (2999 RUB/month)

### Social Features
- Share readings to VK wall
- Share as VK story
- Add to favorites
- Add to home screen
- Push notifications

## Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_VK_APP_ID=your_vk_app_id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page with Z-Scroll
│   ├── tarot/             # Tarot reading page
│   ├── horoscope/         # Horoscope page
│   ├── natal/             # Natal chart page
│   ├── subscription/      # Subscription management
│   └── settings/          # Settings page
├── components/            # React components
│   ├── CosmicBackground.tsx
│   └── ZScrollContainer.tsx
├── contexts/              # React contexts
│   └── AuthContext.tsx
└── lib/                   # Utilities
    ├── vk.ts             # VK Bridge integration
    └── auth.ts           # Authentication utilities
```

## API Integration

The app communicates with the Mirastros backend API:

- `POST /auth/vk` - VK authentication
- `POST /tarot/reading` - Get tarot reading
- `GET /horoscope/daily/:sign` - Get daily horoscope
- `POST /natal/calculate` - Calculate natal chart
- `POST /payments/vk/create-payment` - Create VK Pay payment

## VK Design Guidelines

The app follows VK design guidelines:
- Uses VK theme colors
- Responsive for mobile devices
- Optimized for VK web view
- Supports VK native features

## License

Proprietary - Mirastros Platform
