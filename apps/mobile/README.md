# Mirastros Mobile App

React Native mobile application built with Expo and NativeWind.

## Features

- **Daily Horoscope**: Zodiac sign selection with AI predictions
- **Tarot Reading**: Interactive 3-card spread
- **Natal Chart**: Birth info form with chart generation
- **NativeWind**: Tailwind CSS styling for React Native
- **Expo Router**: File-based routing

## Tech Stack

- React Native (Expo SDK 51)
- Expo Router for navigation
- NativeWind for styling
- TypeScript

## Setup

1. **Install dependencies**:
   ```bash
   cd apps/mobile
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Run on device**:
   - iOS: Press `i` or scan QR code with Camera app
   - Android: Press `a` or scan QR code with Expo Go app
   - Web: Press `w`

## Project Structure

```
apps/mobile/
├── app/
│   ├── _layout.tsx       # Root layout
│   ├── index.tsx         # Home screen
│   ├── horoscope.tsx     # Horoscope screen
│   ├── tarot.tsx         # Tarot screen
│   └── natal.tsx         # Natal chart screen
├── app.json              # Expo configuration
├── package.json
├── tailwind.config.js
└── global.css
```

## Screens

### Home Screen
- Service cards (Horoscope, Tarot, Natal)
- Features list
- CTA button

### Horoscope Screen
- 12 zodiac signs grid
- Sign selection
- AI prediction display

### Tarot Screen
- 10 tarot cards
- 3-card selection
- Reading display

### Natal Chart Screen
- Birth date/time/place form
- Chart generation
- Interpretation display

## API Integration

All screens connect to the backend API:
```typescript
POST http://localhost:8000/ai/predict
{
  "query": "...",
  "service_type": "horoscope|tarot|natal",
  "use_rag": true
}
```

## Styling

Uses NativeWind (Tailwind for React Native):
- Same design tokens as web app
- Cosmic background (#0F0A1F)
- Gold accents (#D4AF37)
- Glassmorphism effects

## Build for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## Future Enhancements

- [ ] RevenueCat subscriptions
- [ ] Push notifications
- [ ] Offline mode
- [ ] User authentication
- [ ] Favorites/history
