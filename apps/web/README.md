# Mirastros Web Application

Next.js 14 web application with Z-Scroll effect, 3D cosmic background, and esoteric services.

## Features

- ✨ **Z-Scroll Effect**: Immersive tunnel-like scroll animation using GSAP
- 🌌 **3D Cosmic Background**: Star field with Three.js
- 🎨 **Design System**: Tailwind CSS with custom preset
- 🔐 **Authentication**: Email/Password and Social login (Google, Apple)
- 💳 **Payments**: Stripe and YooKassa integration
- 📱 **Responsive**: Mobile-first design
- ⚡ **Performance**: Optimized with Next.js 14 App Router

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: GSAP, Framer Motion
- **3D Graphics**: Three.js, React Three Fiber
- **State Management**: React Context (planned: Redux)
- **API Client**: Fetch API (planned: shared-core package)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:8000

### Installation

```bash
# Install dependencies (from root)
npm install

# Copy environment variables
cd apps/web
cp .env.example .env.local

# Update .env.local with your values
```

### Development

```bash
# Run development server (from root)
nx serve web

# Or directly
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Build for production (from root)
nx build web

# Or directly
cd apps/web
npm run build
```

### Preview Production Build

```bash
npm run start
```

## Project Structure

```
apps/web/
├── public/              # Static assets
│   ├── favicon.ico
│   ├── logo.png
│   └── background.jpg
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── layout.tsx  # Root layout
│   │   ├── page.tsx    # Home page
│   │   ├── global.css  # Global styles
│   │   ├── about/      # About page
│   │   ├── services/   # Services page
│   │   ├── contacts/   # Contacts page
│   │   └── api/        # API routes
│   ├── components/     # React components
│   │   ├── sections/   # Page sections
│   │   ├── Background3D.tsx
│   │   ├── Navbar.tsx
│   │   └── ScrollLayout.tsx
│   ├── config/         # Configuration
│   │   └── index.ts    # App config
│   └── services/       # API services
│       └── api.ts
├── .env.example        # Environment variables template
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind configuration
└── tsconfig.json       # TypeScript configuration
```

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key
- `NEXT_PUBLIC_YOOKASSA_SHOP_ID`: YooKassa shop ID

## Features Implementation Status

### ✅ Completed
- [x] Next.js 14 setup with App Router
- [x] Tailwind CSS with design system
- [x] GSAP and Three.js dependencies
- [x] Z-Scroll effect components
- [x] 3D cosmic background
- [x] Landing page sections
- [x] Navbar component
- [x] Font configuration (Cinzel + Inter)

### 🚧 In Progress
- [ ] Authentication pages
- [ ] Dashboard
- [ ] Service pages
- [ ] Profile and subscription pages
- [ ] Shop pages
- [ ] API integration

### 📋 Planned
- [ ] Redux state management
- [ ] Shared-core package integration
- [ ] Payment integration (Stripe Elements)
- [ ] Social login
- [ ] PWA support
- [ ] i18n (internationalization)

## Design System

The app uses a custom Tailwind preset with:
- **Colors**: Dark cosmic theme (#050505) with gold accents (#FFD700)
- **Fonts**: 
  - Headings: Cinzel (serif)
  - Body: Inter (sans-serif)
- **Animations**: Custom animations (pulse-slow, float)

## Z-Scroll Effect

The Z-Scroll effect creates a tunnel-like animation as users scroll:
- Sections zoom in from small to full size
- Blur effect on entry and exit
- Zig-zag positioning (alternating left/right)
- Smooth scroll with GSAP ScrollTrigger

See `src/components/ScrollLayout.tsx` for implementation.

## 3D Background

The cosmic background features:
- 5000 star particles
- Rotation animation
- Fog and lighting effects
- Responsive to viewport size

See `src/components/Background3D.tsx` for implementation.

## API Integration

API calls should use the centralized service:

```typescript
import { api } from '@/services/api';

// Example: Get horoscope
const horoscope = await api.get('/horoscope/daily/aries');
```

## Deployment

### Production Build

```bash
nx build web
```

Output will be in `dist/apps/web/`.

### Deployment Options

1. **Vercel** (Recommended for Next.js)
   ```bash
   vercel deploy
   ```

2. **VPS with Nginx**
   - Build the app
   - Copy to server
   - Run with PM2 or systemd
   - Configure Nginx reverse proxy

3. **Docker**
   ```bash
   docker build -t mirastros-web .
   docker run -p 3000:3000 mirastros-web
   ```

## Performance Optimization

- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Font optimization with next/font
- CSS optimization with Tailwind purge
- Bundle analysis with @next/bundle-analyzer

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [repository]/issues
- Email: support@mirastros.ru
