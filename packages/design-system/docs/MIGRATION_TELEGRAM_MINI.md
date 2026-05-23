# Telegram Mini App Migration Guide

## Overview

This guide provides step-by-step instructions for migrating the Mirastros Telegram Mini App from custom components to the unified design system. The Telegram Mini App has unique constraints and APIs that must be considered during migration.

## Prerequisites

- Node.js 18+ installed
- Next.js 14+ installed
- Design system package installed: `npm install @mirastros/design-system`
- Tailwind CSS configured to extend design system preset
- TypeScript configured for design system types
- Telegram Bot Token for testing
- Telegram Mini App SDK knowledge

## Telegram Mini App Specifics

### Platform Constraints

| Constraint | Impact | Solution |
|---|---|---|
| Limited viewport size | Mobile-first design required | Use responsive design system |
| No external links | Navigation must use Telegram API | Use Telegram WebApp API |
| Limited storage | LocalStorage only | Use browser storage utilities |
| No background execution | All work must be in foreground | Avoid long-running operations |
| Specific color scheme | Must match Telegram theme | Use Telegram color API |
| Safe area requirements | Notch and keyboard handling | Use safe area utilities |

### Telegram WebApp API

The Telegram Mini App uses the WebApp API for:

```typescript
// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp;

// Available methods
tg.ready(); // Signal app is ready
tg.expand(); // Expand to full height
tg.close(); // Close the app
tg.sendData(data); // Send data to bot
tg.openLink(url); // Open external link
tg.openTelegramLink(url); // Open Telegram link
tg.showPopup(params); // Show popup
tg.showAlert(message); // Show alert
tg.showConfirm(message); // Show confirmation
tg.HapticFeedback.impactOccurred(style); // Haptic feedback

// Available properties
tg.initData; // Init data from Telegram
tg.initDataUnsafe; // Unsafe init data
tg.colorScheme; // 'light' or 'dark'
tg.themeParams; // Theme colors
tg.viewportHeight; // Viewport height
tg.viewportStableHeight; // Stable viewport height
tg.isExpanded; // Is app expanded
tg.isClosingConfirmationEnabled; // Closing confirmation
```

## Component Mapping (Old → New)

### Layout Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom `<div>` wrapper | `<Container>` | Safe area wrapper with responsive padding |
| Custom flexbox layouts | `<Stack>` | Flexible layout for vertical/horizontal stacking |
| Custom scroll view | `<ScrollView>` | Scrollable container with momentum scrolling |
| Custom navbar | `<Navbar>` | Fixed navigation with Telegram integration |
| Custom bottom sheet | `<BottomSheet>` | Bottom sheet overlay for actions |

### Content Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom card with inline styles | `<Card>` | Container with shadow and padding |
| Custom list item | `<ListItem>` | List item with icon, title, subtitle |
| Custom section wrapper | `<Section>` | Full-width section container |

### Form Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom `<input>` | `<Input>` | Text input with validation states |
| Custom `<select>` | `<Select>` | Dropdown picker with search |
| Custom `<button>` | `<Button>` | Button with variants and Telegram integration |
| Custom `<textarea>` | `<Textarea>` | Multi-line text input |
| Custom checkbox | `<Checkbox>` | Single and group checkboxes |
| Custom radio | `<Radio>` | Single selection radio buttons |
| Custom form wrapper | `<FormGroup>` | Wrapper for label + input + error |

### Feedback Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom alert | `<Toast>` | Toast notifications (success, error, warning, info) |
| Custom tooltip | `<Tooltip>` | Tooltip with positioning |
| Custom loading spinner | `<Spinner>` | Loading indicator with animation |
| Custom skeleton | `<Skeleton>` | Placeholder during data loading |

### Navigation Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom tabs | `<Tabs>` | Tabbed interface with swipe support |
| Custom accordion | `<Accordion>` | Collapsible sections |
| Custom breadcrumb | `<Breadcrumb>` | Navigation path |

### Modal Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom modal | `<Modal>` | Dialog with backdrop |
| Custom alert dialog | `<AlertDialog>` | Confirmation dialog |
| Custom bottom sheet | `<BottomSheet>` | Bottom sheet overlay |

## Breaking Changes

### 1. CSS Class Names
**Old:** Custom CSS classes like `tg-section`, `tg-button`, `tg-input`
**New:** Tailwind CSS utility classes
**Migration:** Replace custom classes with Tailwind equivalents

```tsx
// Before
<div className="tg-section">
  <button className="tg-button tg-button-primary">
    Click me
  </button>
</div>

// After
<Section>
  <Button variant="primary">
    Click me
  </Button>
</Section>
```

### 2. Inline Styles
**Old:** Inline `style` attributes with custom properties
**New:** Tailwind CSS utility classes
**Migration:** Convert inline styles to Tailwind classes

```tsx
// Before
<div style={{ padding: '16px', marginBottom: '12px' }}>
  Content
</div>

// After
<div className="p-4 mb-3">
  Content
</div>
```

### 3. Telegram API Integration
**Old:** Direct Telegram API calls in components
**New:** Telegram integration hooks and utilities
**Migration:** Use design system Telegram utilities

```tsx
// Before
const tg = window.Telegram?.WebApp;
tg?.showAlert('Success!');

// After
import { useTelegram } from '@mirastros/design-system';

const { showAlert } = useTelegram();
showAlert('Success!');
```

### 4. Color Scheme
**Old:** Hardcoded colors
**New:** Telegram theme colors
**Migration:** Use Telegram theme API

```tsx
// Before
<div style={{ backgroundColor: '#FFC107' }}>
  Content
</div>

// After
<div className="bg-gold-500">
  Content
</div>
```

## Installation & Setup

### 1. Install Design System Package

```bash
npm install @mirastros/design-system
```

### 2. Update Tailwind Configuration

```javascript
// tailwind.config.js
const designSystemPreset = require('@mirastros/design-system/tailwind.preset.js');

module.exports = {
  presets: [designSystemPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@mirastros/design-system/**/*.{js,ts,jsx,tsx}',
  ],
};
```

### 3. Update TypeScript Configuration

```json
{
  "compilerOptions": {
    "types": ["@mirastros/design-system"]
  }
}
```

### 4. Initialize Telegram WebApp

```tsx
// app/layout.tsx
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 5. Import Design System Components

```tsx
import {
  Button,
  Card,
  Input,
  Modal,
  Section,
  Container,
  Stack,
  // ... other components
} from '@mirastros/design-system';
```

## Upgrade Path

### Phase 1: Setup (1-2 hours)
1. Install design system package
2. Update Tailwind configuration
3. Update TypeScript configuration
4. Initialize Telegram WebApp
5. Import design system components

### Phase 2: Layout Components (1-2 hours)
1. Replace custom containers with `<Container>`
2. Replace custom flexbox with `<Stack>`
3. Update navigation components
4. Update bottom sheet navigation

### Phase 3: Content Components (1 hour)
1. Replace custom cards with `<Card>`
2. Replace custom list items with `<ListItem>`
3. Update section wrappers

### Phase 4: Form Components (2-3 hours)
1. Replace custom inputs with `<Input>`
2. Replace custom selects with `<Select>`
3. Replace custom buttons with `<Button>`
4. Replace custom textareas with `<Textarea>`
5. Update form validation

### Phase 5: Feedback Components (1 hour)
1. Replace custom alerts with `<Toast>`
2. Replace custom tooltips with `<Tooltip>`
3. Replace custom spinners with `<Spinner>`
4. Replace custom skeletons with `<Skeleton>`

### Phase 6: Navigation Components (1 hour)
1. Replace custom tabs with `<Tabs>`
2. Replace custom accordions with `<Accordion>`
3. Update breadcrumbs

### Phase 7: Modal Components (1 hour)
1. Replace custom modals with `<Modal>`
2. Replace custom alert dialogs with `<AlertDialog>`
3. Replace custom bottom sheets with `<BottomSheet>`

### Phase 8: Telegram Integration (1-2 hours)
1. Integrate Telegram WebApp API
2. Add haptic feedback
3. Add data sending to bot
4. Test on Telegram platform

### Phase 9: Testing & Verification (2-3 hours)
1. Test all components visually on Telegram
2. Verify responsive behavior on different screen sizes
3. Test Telegram API integration
4. Test keyboard navigation
5. Test accessibility with screen readers
6. Test on actual Telegram app

### Phase 10: Cleanup (1 hour)
1. Remove old component files
2. Remove old style files
3. Update imports throughout app
4. Run final tests

## Telegram Integration Patterns

### Using Telegram WebApp API

```tsx
'use client';

import { useEffect } from 'react';
import { Button, Toast } from '@mirastros/design-system';

export function TelegramButton() {
  const handleClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.sendData(JSON.stringify({ action: 'button_clicked' }));
      tg.showAlert('Data sent to bot!');
    }
  };

  return (
    <Button onClick={handleClick}>
      Send to Bot
    </Button>
  );
}
```

### Using Telegram Theme Colors

```tsx
'use client';

import { useEffect, useState } from 'react';

export function TelegramThemedComponent() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setTheme(tg.themeParams);
    }
  }, []);

  if (!theme) return null;

  return (
    <div
      style={{
        backgroundColor: theme.bg_color,
        color: theme.text_color,
      }}
    >
      Content
    </div>
  );
}
```

### Using Haptic Feedback

```tsx
'use client';

import { Button } from '@mirastros/design-system';

export function HapticButton() {
  const handleClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }
  };

  return (
    <Button onClick={handleClick}>
      Click for Haptic
    </Button>
  );
}
```

## Migration Examples

### Example 1: Simple Card

**Before:**
```tsx
<div className="tg-card">
  <div className="tg-card-header">
    <h3 className="tg-card-title">Title</h3>
  </div>
  <div className="tg-card-body">
    <p className="tg-card-text">Content</p>
  </div>
</div>
```

**After:**
```tsx
import { Card, Stack, Text } from '@mirastros/design-system';

<Card>
  <Stack gap="md">
    <h3 className="text-lg font-bold">Title</h3>
    <Text>Content</Text>
  </Stack>
</Card>
```

### Example 2: Form Component

**Before:**
```tsx
<form onSubmit={handleSubmit}>
  <div className="tg-form-group">
    <label className="tg-label">Name</label>
    <input
      type="text"
      className="tg-input"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  </div>
  <button type="submit" className="tg-button tg-button-primary">
    Submit
  </button>
</form>
```

**After:**
```tsx
import { FormGroup, Input, Button, Stack } from '@mirastros/design-system';

<form onSubmit={handleSubmit}>
  <Stack gap="lg">
    <FormGroup label="Name">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </FormGroup>
    <Button type="submit" variant="primary">
      Submit
    </Button>
  </Stack>
</form>
```

### Example 3: Telegram Integration

**Before:**
```tsx
<button
  onClick={() => {
    const tg = window.Telegram?.WebApp;
    tg?.sendData(JSON.stringify({ action: 'clicked' }));
  }}
>
  Send to Bot
</button>
```

**After:**
```tsx
import { Button } from '@mirastros/design-system';

<Button
  onClick={() => {
    const tg = window.Telegram?.WebApp;
    tg?.sendData(JSON.stringify({ action: 'clicked' }));
  }}
>
  Send to Bot
</Button>
```

## Platform Constraints Handling

### Safe Area

```tsx
import { Container } from '@mirastros/design-system';

<Container>
  {/* Content automatically has safe area padding */}
</Container>
```

### Viewport Height

```tsx
'use client';

import { useEffect, useState } from 'react';

export function ResponsiveContainer() {
  const [height, setHeight] = useState('100vh');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setHeight(`${tg.viewportStableHeight}px`);
    }
  }, []);

  return (
    <div style={{ height }}>
      Content
    </div>
  );
}
```

### Keyboard Handling

```tsx
'use client';

import { useEffect } from 'react';

export function KeyboardAwareComponent() {
  useEffect(() => {
    const handleViewportChange = () => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        // Adjust layout based on viewport height
        console.log('Viewport height:', tg.viewportHeight);
      }
    };

    window.addEventListener('resize', handleViewportChange);
    return () => window.removeEventListener('resize', handleViewportChange);
  }, []);

  return <div>Content</div>;
}
```

## Testing on Telegram

### 1. Local Testing

```bash
# Start development server
npm run dev

# Use ngrok to expose local server
ngrok http 3000

# Use ngrok URL in Telegram bot webhook
```

### 2. Telegram Bot Setup

```python
# Python example using python-telegram-bot
from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler

async def start(update: Update, context):
    web_app = WebAppInfo(url="https://your-app-url.com")
    keyboard = [[KeyboardButton(text="Open App", web_app=web_app)]]
    reply_markup = ReplyKeyboardMarkup(keyboard)
    await update.message.reply_text("Click to open app", reply_markup=reply_markup)

app = Application.builder().token("YOUR_BOT_TOKEN").build()
app.add_handler(CommandHandler("start", start))
app.run_polling()
```

### 3. Testing Checklist

- [ ] App opens in Telegram
- [ ] All components render correctly
- [ ] Responsive behavior works on different screen sizes
- [ ] Telegram API integration works
- [ ] Data sending to bot works
- [ ] Haptic feedback works
- [ ] Theme colors match Telegram theme
- [ ] Safe area is respected
- [ ] Keyboard doesn't overlap content
- [ ] No console errors or warnings
- [ ] Performance is acceptable

## Common Issues & Solutions

### Issue 1: Telegram WebApp Not Initialized
**Solution:** Ensure `tg.ready()` is called in useEffect on component mount

### Issue 2: Components Not Responsive
**Solution:** Use design system responsive utilities and test on actual Telegram app

### Issue 3: Colors Not Matching Telegram Theme
**Solution:** Use Telegram theme API to get correct colors

### Issue 4: Safe Area Not Respected
**Solution:** Use Container component which handles safe area automatically

### Issue 5: Keyboard Overlapping Content
**Solution:** Use viewport height from Telegram API to adjust layout

### Issue 6: Haptic Feedback Not Working
**Solution:** Ensure device supports haptic feedback and API is available

## Support & Resources

- **Design System Documentation:** `packages/design-system/docs/`
- **Component Stories:** `packages/design-system/stories/`
- **Storybook:** Run `npm run storybook` to view interactive components
- **Telegram WebApp Documentation:** https://core.telegram.org/bots/webapps
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Requirements:** See `.kiro/specs/design-system-unification/requirements.md`
- **Design Document:** See `.kiro/specs/design-system-unification/design.md`

## Next Steps

After completing the telegram-mini migration:

1. Migrate vk-mini to design system
2. Perform accessibility audit
3. Optimize performance and bundle size
