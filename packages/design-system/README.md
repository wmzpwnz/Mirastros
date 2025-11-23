# @mirastros-universal/design-system

Design system for Mirastros Universal platform with Tailwind CSS configuration.

## Features

- Color palette (cosmic dark theme with gold accents)
- Typography (Cinzel for headings, Inter for body)
- Animation presets (pulse-slow, float, bounce)
- Tailwind CSS preset

## Usage

### In Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  presets: [require('@mirastros-universal/design-system/tailwind')],
  // ... your config
};
```

### In TypeScript

```typescript
import { colors, fonts, animations } from '@mirastros-universal/design-system';

console.log(colors.gold); // #FFD700
console.log(fonts.heading); // Cinzel
```

## Colors

- **Background**: #050505 (deepest black)
- **Gold**: #FFD700 (primary accent)
- **Silver**: #C0C0C0 (secondary text)
- **Turquoise**: #40E0D0 (accent)
- **Purple**: #2E1065 (deep purple)

## Fonts

- **Heading**: Cinzel (serif)
- **Body**: Inter (sans-serif)

## Animations

- **pulse-slow**: 4s pulse animation
- **float**: 6s floating animation
- **bounce**: Standard bounce animation
