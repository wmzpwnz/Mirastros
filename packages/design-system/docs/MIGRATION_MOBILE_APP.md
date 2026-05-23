# Mobile App Migration Guide

## Overview

This guide provides step-by-step instructions for migrating the Mirastros mobile application from custom React Native components to the unified design system using NativeWind. The migration maintains platform-specific optimizations while ensuring consistency with the web and admin applications.

## Prerequisites

- Node.js 18+ installed
- React Native 0.72+ installed
- Expo SDK 50+ installed
- Design system package installed: `npm install @mirastros/design-system`
- NativeWind 4+ configured
- TypeScript configured for design system types

## Platform-Specific Considerations

### React Native vs Web

| Aspect | Web | Mobile |
|---|---|---|
| Styling | Tailwind CSS | NativeWind (Tailwind for React Native) |
| Components | React | React Native |
| Layout | Flexbox, Grid | Flexbox only |
| Animations | CSS, Framer Motion | React Native Animated, Reanimated |
| Touch | Mouse events | Touch events |
| Navigation | React Router | React Navigation |
| Icons | SVG | React Native Vector Icons |

### NativeWind Specifics

NativeWind brings Tailwind CSS to React Native with these considerations:

1. **Limited Tailwind Support:** Not all Tailwind utilities are available in React Native
2. **Platform-Specific Styles:** Use `ios:` and `android:` prefixes for platform-specific styling
3. **No CSS Pseudo-classes:** Hover, focus, active states use React state instead
4. **No CSS Grid:** Only Flexbox is available
5. **Limited Animations:** Use React Native Animated or Reanimated instead of CSS animations

## Component Mapping (Old → New)

### Layout Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom `<View>` with inline styles | `<Container>` | Safe area wrapper with responsive padding |
| Custom flexbox layouts | `<Stack>` | Flexible layout for vertical/horizontal stacking |
| Custom scroll view | `<ScrollView>` | Scrollable container with momentum scrolling |
| Custom tab navigation | `<Tabs>` | Tab navigation with swipe support |
| Custom drawer navigation | `<Drawer>` | Side drawer with slide animation |

### Content Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom card with inline styles | `<Card>` | Container with shadow and padding |
| Service section wrapper | `<ServiceCard>` | Service showcase with icon, title, description |
| Custom list item | `<ListItem>` | List item with icon, title, subtitle |

### Form Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom `<TextInput>` | `<Input>` | Text input with validation states |
| Custom picker | `<Select>` | Dropdown picker with search |
| Custom `<TouchableOpacity>` button | `<Button>` | Button with variants and touch feedback |
| Custom `<TextInput>` multiline | `<Textarea>` | Multi-line text input |
| Custom checkbox | `<Checkbox>` | Single and group checkboxes |
| Custom radio | `<Radio>` | Single selection radio buttons |
| Custom form wrapper | `<FormGroup>` | Wrapper for label + input + error |

### Feedback Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom alert | `<Toast>` | Toast notifications (success, error, warning, info) |
| Custom tooltip | `<Tooltip>` | Tooltip with positioning |
| Custom activity indicator | `<Spinner>` | Loading indicator with animation |
| Custom skeleton | `<Skeleton>` | Placeholder during data loading |

### Navigation Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom tabs | `<Tabs>` | Tabbed interface with swipe support |
| Custom accordion | `<Accordion>` | Collapsible sections |
| Custom breadcrumb | `<Breadcrumb>` | Navigation path |

### Data Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom list | `<List>` | Scrollable list with items |
| Custom chart | `<Chart>` | Bar, line, pie charts |
| Custom progress bar | `<ProgressBar>` | Linear progress with percentage |

### Modal Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom modal | `<Modal>` | Dialog with backdrop |
| Custom alert dialog | `<AlertDialog>` | Confirmation dialog |
| Custom bottom sheet | `<BottomSheet>` | Bottom sheet overlay |

## Breaking Changes

### 1. Styling System
**Old:** Inline `style` objects with custom properties
**New:** NativeWind Tailwind classes
**Migration:** Convert inline styles to Tailwind classes

```tsx
// Before
<View style={{ marginBottom: 16, paddingHorizontal: 12 }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFC107' }}>
    Title
  </Text>
</View>

// After
<View className="mb-4 px-3">
  <Text className="text-lg font-bold text-gold-500">
    Title
  </Text>
</View>
```

### 2. Component Props
**Old:** Custom props like `variant`, `size`, `disabled`
**New:** Standardized design system props
**Migration:** Update prop names and values

```tsx
// Before
<TouchableOpacity
  style={[styles.button, styles.buttonPrimary]}
  disabled={isLoading}
>
  <Text style={styles.buttonText}>Click me</Text>
</TouchableOpacity>

// After
<Button variant="primary" disabled={isLoading}>
  Click me
</Button>
```

### 3. Color Values
**Old:** Hex colors like `#FFC107`, `#00BCD4`
**New:** Design system color tokens
**Migration:** Use Tailwind color classes

```tsx
// Before
<Text style={{ color: '#FFC107' }}>Gold text</Text>

// After
<Text className="text-gold-500">Gold text</Text>
```

### 4. Typography
**Old:** Custom font sizes and weights
**New:** Design system typography tokens
**Migration:** Use Tailwind typography classes

```tsx
// Before
<Text style={{ fontSize: 24, fontWeight: 'bold' }}>
  Heading
</Text>

// After
<Text className="text-2xl font-bold">
  Heading
</Text>
```

### 5. Touch Feedback
**Old:** `<TouchableOpacity>` with custom opacity
**New:** Built-in touch feedback in design system components
**Migration:** Use design system Button and interactive components

```tsx
// Before
<TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
  <Text>Press me</Text>
</TouchableOpacity>

// After
<Button onPress={handlePress}>
  Press me
</Button>
```

## NativeWind Configuration

### 1. Install NativeWind

```bash
npm install nativewind
npm install --save-dev tailwindcss
```

### 2. Update Tailwind Configuration

```javascript
// tailwind.config.js
const designSystemPreset = require('@mirastros/design-system/tailwind.preset.js');

module.exports = {
  presets: [designSystemPreset],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@mirastros/design-system/**/*.{js,ts,jsx,tsx}',
  ],
};
```

### 3. Update Metro Configuration

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

### 4. Create Global CSS File

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Import Global CSS

```tsx
// app/_layout.tsx
import '../global.css';

export default function RootLayout() {
  return (
    // ... layout code
  );
}
```

## Upgrade Path

### Phase 1: Setup (1-2 hours)
1. Install design system package
2. Install and configure NativeWind
3. Update Tailwind configuration
4. Update TypeScript configuration
5. Import design system components

### Phase 2: Layout Components (2-3 hours)
1. Replace custom View wrappers with `<Container>`
2. Replace custom flexbox with `<Stack>`
3. Update navigation components
4. Update drawer navigation

### Phase 3: Content Components (1-2 hours)
1. Replace custom cards with `<Card>`
2. Replace service sections with `<ServiceCard>`
3. Update list items

### Phase 4: Form Components (2-3 hours)
1. Replace custom TextInput with `<Input>`
2. Replace custom pickers with `<Select>`
3. Replace custom buttons with `<Button>`
4. Replace custom textareas with `<Textarea>`
5. Update form validation

### Phase 5: Feedback Components (1-2 hours)
1. Replace custom alerts with `<Toast>`
2. Replace custom tooltips with `<Tooltip>`
3. Replace custom activity indicators with `<Spinner>`
4. Replace custom skeletons with `<Skeleton>`

### Phase 6: Navigation Components (1-2 hours)
1. Replace custom tabs with `<Tabs>`
2. Replace custom accordions with `<Accordion>`
3. Update breadcrumbs

### Phase 7: Data Components (1-2 hours)
1. Replace custom lists with `<List>`
2. Replace custom charts with `<Chart>`
3. Replace custom progress bars with `<ProgressBar>`

### Phase 8: Modal Components (1 hour)
1. Replace custom modals with `<Modal>`
2. Replace custom alert dialogs with `<AlertDialog>`
3. Replace custom bottom sheets with `<BottomSheet>`

### Phase 9: Testing & Verification (2-3 hours)
1. Test all components visually on iOS and Android
2. Verify responsive behavior on different screen sizes
3. Test accessibility with screen readers
4. Test keyboard navigation
5. Test touch interactions

### Phase 10: Cleanup (1 hour)
1. Remove old component files
2. Remove old style files
3. Update imports throughout app
4. Run final tests

## Migration Examples

### Example 1: Simple Card

**Before:**
```tsx
<View style={styles.card}>
  <Image source={{ uri: imageUrl }} style={styles.image} />
  <View style={styles.content}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </View>
</View>

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#D1D5DB',
  },
});
```

**After:**
```tsx
import { Card, Stack, Image, Text } from '@mirastros/design-system';

<Card>
  <Stack gap="md">
    <Image source={{ uri: imageUrl }} className="w-full h-48 rounded-lg" />
    <Stack gap="sm">
      <Text className="text-lg font-bold text-gold-500">{title}</Text>
      <Text className="text-sm text-gray-300">{description}</Text>
    </Stack>
  </Stack>
</Card>
```

### Example 2: Form Component

**Before:**
```tsx
<View style={styles.formGroup}>
  <Text style={styles.label}>Email</Text>
  <TextInput
    style={styles.input}
    placeholder="Enter email"
    placeholderTextColor="#6B7280"
    value={email}
    onChangeText={setEmail}
  />
  {error && <Text style={styles.error}>{error}</Text>}
</View>

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#E5E7EB',
    fontSize: 14,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});
```

**After:**
```tsx
import { FormGroup, Input } from '@mirastros/design-system';

<FormGroup label="Email" error={error}>
  <Input
    placeholder="Enter email"
    value={email}
    onChangeText={setEmail}
  />
</FormGroup>
```

### Example 3: Button Component

**Before:**
```tsx
<TouchableOpacity
  style={[styles.button, styles.buttonPrimary]}
  onPress={handlePress}
  activeOpacity={0.7}
>
  <Text style={styles.buttonText}>Click me</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#FFC107',
  },
  buttonText: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**After:**
```tsx
import { Button } from '@mirastros/design-system';

<Button variant="primary" onPress={handlePress}>
  Click me
</Button>
```

## Platform-Specific Styling

### iOS-Specific Styles

```tsx
<View className="ios:pt-4 android:pt-2">
  <Text>Platform-specific padding</Text>
</View>
```

### Android-Specific Styles

```tsx
<View className="android:px-4 ios:px-3">
  <Text>Platform-specific padding</Text>
</View>
```

### Safe Area Handling

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MyComponent() {
  const insets = useSafeAreaInsets();
  
  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <Text>Content with safe area</Text>
    </View>
  );
}
```

## Testing Checklist

- [ ] All components render without errors on iOS
- [ ] All components render without errors on Android
- [ ] Responsive behavior works on different screen sizes
- [ ] Colors match design system tokens
- [ ] Typography is consistent
- [ ] Spacing is consistent
- [ ] Touch interactions work correctly
- [ ] Keyboard navigation works
- [ ] Screen reader support works (iOS VoiceOver, Android TalkBack)
- [ ] No console errors or warnings
- [ ] Performance is acceptable (60 FPS)
- [ ] Safe area is respected on notched devices

## Rollback Procedure

If migration fails at any point:

1. **Revert to previous commit:**
   ```bash
   git revert HEAD
   ```

2. **Reinstall dependencies:**
   ```bash
   npm install
   ```

3. **Clear cache:**
   ```bash
   npm start -- --reset-cache
   ```

4. **Restart development server:**
   ```bash
   npm start
   ```

## Common Issues & Solutions

### Issue 1: NativeWind Classes Not Applied
**Solution:** Ensure Tailwind configuration includes design system preset and content paths. Restart Metro bundler.

### Issue 2: Component Props Not Recognized
**Solution:** Check TypeScript types are imported and component props match design system interface

### Issue 3: Colors Not Matching
**Solution:** Verify Tailwind color tokens are defined in design system preset

### Issue 4: Touch Feedback Not Working
**Solution:** Use design system Button component which includes built-in touch feedback

### Issue 5: Platform-Specific Styles Not Working
**Solution:** Use `ios:` and `android:` prefixes correctly in Tailwind classes

### Issue 6: Safe Area Not Respected
**Solution:** Use `useSafeAreaInsets` hook or wrap content in `<SafeAreaView>`

## Support & Resources

- **Design System Documentation:** `packages/design-system/docs/`
- **Component Stories:** `packages/design-system/stories/`
- **NativeWind Documentation:** https://www.nativewind.dev/
- **React Native Documentation:** https://reactnative.dev/
- **Requirements:** See `.kiro/specs/design-system-unification/requirements.md`
- **Design Document:** See `.kiro/specs/design-system-unification/design.md`

## Next Steps

After completing the mobile app migration:

1. Migrate admin panel to design system
2. Migrate telegram-mini to design system
3. Migrate vk-mini to design system
4. Perform accessibility audit
5. Optimize performance and bundle size
