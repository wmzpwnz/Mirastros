# VK Mini App Migration Guide

## Overview

This guide provides step-by-step instructions for migrating the Mirastros VK Mini App from custom components to the unified design system. The VK Mini App has unique constraints and APIs that must be considered during migration.

## Prerequisites

- Node.js 18+ installed
- Next.js 14+ installed
- Design system package installed: `npm install @mirastros/design-system`
- Tailwind CSS configured to extend design system preset
- TypeScript configured for design system types
- VK Mini Apps SDK knowledge
- VK App ID for testing

## VK Mini App Specifics

### Platform Constraints

| Constraint | Impact | Solution |
|---|---|---|
| Limited viewport size | Mobile-first design required | Use responsive design system |
| VK Bridge API | Communication with VK app | Use VK Bridge utilities |
| Limited storage | LocalStorage only | Use browser storage utilities |
| Specific color scheme | Must match VK theme | Use VK color API |
| Safe area requirements | Notch and keyboard handling | Use safe area utilities |
| VK authentication | User context required | Use VK user context |

### VK Bridge API

The VK Mini App uses the VK Bridge API for:

```typescript
// Initialize VK Bridge
import bridge from '@vkontakte/vk-bridge';

// Available methods
bridge.send('VKWebAppInit'); // Initialize app
bridge.send('VKWebAppGetUserInfo'); // Get user info
bridge.send('VKWebAppGetAuthToken', { app_id: APP_ID, scope: 'friends' }); // Get auth token
bridge.send('VKWebAppShare', { link: url }); // Share link
bridge.send('VKWebAppShowNativeAds'); // Show ads
bridge.send('VKWebAppShowWallPostBox', { message: text }); // Show post box
bridge.send('VKWebAppCallAPIMethod', { method: 'users.get', params: {} }); // Call VK API
bridge.send('VKWebAppSetTitle', { title: 'New Title' }); // Set app title
bridge.send('VKWebAppShowAlert', { title: 'Alert', text: 'Message' }); // Show alert
bridge.send('VKWebAppShowConfirm', { title: 'Confirm', text: 'Message' }); // Show confirm

// Available events
bridge.subscribe(({ detail: { type, data } }) => {
  if (type === 'VKWebAppUpdateConfig') {
    // Handle config update (theme, etc.)
  }
});
```

## Component Mapping (Old → New)

### Layout Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom `<div>` wrapper | `<Container>` | Safe area wrapper with responsive padding |
| Custom flexbox layouts | `<Stack>` | Flexible layout for vertical/horizontal stacking |
| Custom scroll view | `<ScrollView>` | Scrollable container with momentum scrolling |
| Custom navbar | `<Navbar>` | Fixed navigation with VK integration |
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
| Custom `<button>` | `<Button>` | Button with variants and VK integration |
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
**Old:** Custom CSS classes like `vk-section`, `vk-button`, `vk-input`
**New:** Tailwind CSS utility classes
**Migration:** Replace custom classes with Tailwind equivalents

```tsx
// Before
<div className="vk-section">
  <button className="vk-button vk-button-primary">
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

### 3. VK Bridge Integration
**Old:** Direct VK Bridge calls in components
**New:** VK Bridge integration hooks and utilities
**Migration:** Use design system VK utilities

```tsx
// Before
import bridge from '@vkontakte/vk-bridge';

bridge.send('VKWebAppShowAlert', {
  title: 'Success',
  text: 'Operation completed',
});

// After
import { useVKBridge } from '@mirastros/design-system';

const { showAlert } = useVKBridge();
showAlert('Success', 'Operation completed');
```

### 4. Color Scheme
**Old:** Hardcoded colors
**New:** VK theme colors
**Migration:** Use VK theme API

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

### 2. Install VK Bridge

```bash
npm install @vkontakte/vk-bridge
```

### 3. Update Tailwind Configuration

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

### 4. Update TypeScript Configuration

```json
{
  "compilerOptions": {
    "types": ["@mirastros/design-system"]
  }
}
```

### 5. Initialize VK Bridge

```tsx
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';

export default function RootLayout({ children }) {
  useEffect(() => {
    bridge.send('VKWebAppInit');
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 6. Import Design System Components

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
2. Install VK Bridge
3. Update Tailwind configuration
4. Update TypeScript configuration
5. Initialize VK Bridge
6. Import design system components

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

### Phase 8: VK Integration (1-2 hours)
1. Integrate VK Bridge API
2. Add user context
3. Add sharing functionality
4. Add VK API calls
5. Test on VK platform

### Phase 9: Testing & Verification (2-3 hours)
1. Test all components visually on VK
2. Verify responsive behavior on different screen sizes
3. Test VK Bridge integration
4. Test keyboard navigation
5. Test accessibility with screen readers
6. Test on actual VK app

### Phase 10: Cleanup (1 hour)
1. Remove old component files
2. Remove old style files
3. Update imports throughout app
4. Run final tests

## VK Integration Patterns

### Using VK Bridge API

```tsx
'use client';

import { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { Button, Stack, Text } from '@mirastros/design-system';

export function VKUserInfo() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    bridge.send('VKWebAppGetUserInfo').then((data) => {
      setUser(data);
    });
  }, []);

  if (!user) return null;

  return (
    <Stack gap="md">
      <Text className="text-lg font-bold">{user.first_name} {user.last_name}</Text>
      <img src={user.photo_200} alt="User" className="w-32 h-32 rounded-full" />
    </Stack>
  );
}
```

### Using VK Share

```tsx
'use client';

import bridge from '@vkontakte/vk-bridge';
import { Button } from '@mirastros/design-system';

export function VKShareButton() {
  const handleShare = () => {
    bridge.send('VKWebAppShare', {
      link: 'https://your-app-url.com',
    });
  };

  return (
    <Button onClick={handleShare}>
      Share App
    </Button>
  );
}
```

### Using VK API

```tsx
'use client';

import { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';

export function VKAPICall() {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    bridge.send('VKWebAppCallAPIMethod', {
      method: 'friends.get',
      params: {
        fields: 'photo_100',
        v: '5.131',
      },
    }).then((data) => {
      setFriends(data.response.items);
    });
  }, []);

  return (
    <div>
      {friends.map((friend) => (
        <div key={friend.id}>{friend.first_name} {friend.last_name}</div>
      ))}
    </div>
  );
}
```

### Using VK Theme

```tsx
'use client';

import { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';

export function VKThemedComponent() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    bridge.subscribe(({ detail: { type, data } }) => {
      if (type === 'VKWebAppUpdateConfig') {
        setTheme(data.appearance);
      }
    });
  }, []);

  if (!theme) return null;

  return (
    <div
      style={{
        backgroundColor: theme === 'dark' ? '#000' : '#fff',
        color: theme === 'dark' ? '#fff' : '#000',
      }}
    >
      Content
    </div>
  );
}
```

## Migration Examples

### Example 1: Simple Card

**Before:**
```tsx
<div className="vk-card">
  <div className="vk-card-header">
    <h3 className="vk-card-title">Title</h3>
  </div>
  <div className="vk-card-body">
    <p className="vk-card-text">Content</p>
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
  <div className="vk-form-group">
    <label className="vk-label">Name</label>
    <input
      type="text"
      className="vk-input"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  </div>
  <button type="submit" className="vk-button vk-button-primary">
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

### Example 3: VK Integration

**Before:**
```tsx
import bridge from '@vkontakte/vk-bridge';

<button
  onClick={() => {
    bridge.send('VKWebAppShare', {
      link: 'https://your-app-url.com',
    });
  }}
>
  Share
</button>
```

**After:**
```tsx
import { Button } from '@mirastros/design-system';
import bridge from '@vkontakte/vk-bridge';

<Button
  onClick={() => {
    bridge.send('VKWebAppShare', {
      link: 'https://your-app-url.com',
    });
  }}
>
  Share
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
    // VK Mini Apps typically use full viewport
    setHeight(window.innerHeight);
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
    const handleResize = () => {
      // Adjust layout based on viewport height
      console.log('Viewport height:', window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div>Content</div>;
}
```

## Testing on VK

### 1. Local Testing

```bash
# Start development server
npm run dev

# Use ngrok to expose local server
ngrok http 3000

# Use ngrok URL in VK Mini App settings
```

### 2. VK Mini App Setup

1. Go to VK Developer Console
2. Create a new Mini App
3. Set the app URL to your ngrok URL
4. Get the App ID
5. Add to your environment variables

### 3. Testing Checklist

- [ ] App opens in VK
- [ ] All components render correctly
- [ ] Responsive behavior works on different screen sizes
- [ ] VK Bridge integration works
- [ ] User info loads correctly
- [ ] Sharing functionality works
- [ ] VK API calls work
- [ ] Theme colors match VK theme
- [ ] Safe area is respected
- [ ] Keyboard doesn't overlap content
- [ ] No console errors or warnings
- [ ] Performance is acceptable

## Common Issues & Solutions

### Issue 1: VK Bridge Not Initialized
**Solution:** Ensure `bridge.send('VKWebAppInit')` is called in useEffect on component mount

### Issue 2: Components Not Responsive
**Solution:** Use design system responsive utilities and test on actual VK app

### Issue 3: Colors Not Matching VK Theme
**Solution:** Use VK theme API to get correct colors

### Issue 4: Safe Area Not Respected
**Solution:** Use Container component which handles safe area automatically

### Issue 5: Keyboard Overlapping Content
**Solution:** Use viewport height to adjust layout

### Issue 6: VK Bridge Methods Not Working
**Solution:** Ensure VK Bridge is initialized and methods are called correctly

### Issue 7: CORS Issues
**Solution:** Ensure your backend allows requests from VK Mini App domain

## Support & Resources

- **Design System Documentation:** `packages/design-system/docs/`
- **Component Stories:** `packages/design-system/stories/`
- **Storybook:** Run `npm run storybook` to view interactive components
- **VK Bridge Documentation:** https://dev.vk.com/en/mini-apps/bridge
- **VK Mini Apps Documentation:** https://dev.vk.com/en/mini-apps
- **VK API Documentation:** https://dev.vk.com/en/api/overview
- **Requirements:** See `.kiro/specs/design-system-unification/requirements.md`
- **Design Document:** See `.kiro/specs/design-system-unification/design.md`

## Next Steps

After completing the vk-mini migration:

1. Perform accessibility audit
2. Optimize performance and bundle size
3. Complete design system documentation
