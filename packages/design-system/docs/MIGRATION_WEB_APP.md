# Web App Migration Guide

## Overview

This guide provides step-by-step instructions for migrating the Mirastros web application from custom components and inline styles to the unified design system. The migration preserves the Z-Scroll tunnel effect and cosmic aesthetic while improving consistency, maintainability, and accessibility.

## Prerequisites

- Node.js 18+ installed
- Design system package installed: `npm install @mirastros/design-system`
- Tailwind CSS configured to extend design system preset
- TypeScript configured for design system types

## Component Mapping (Old → New)

### Layout Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom `<section>` with inline styles | `<Section>` | Full-width container with consistent spacing |
| Custom `<div>` wrapper | `<Container>` | Max-width wrapper with responsive padding |
| Custom flexbox layouts | `<Stack>` | Flexible layout for vertical/horizontal stacking |
| Custom grid layouts | `<Grid>` | 12-column responsive grid system |
| Custom navbar | `<Navbar>` | Fixed navigation with logo, menu, user profile |
| Custom sidebar | `<Sidebar>` | Collapsible side navigation |

### Content Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom card with inline styles | `<Card>` | Container with shadow, border, padding |
| Service section wrapper | `<ServiceCard>` | Service showcase with icon, title, description |
| Hero banner | `<Hero>` | Large banner with background image and CTA |
| Section wrapper | `<Section>` | Full-width section container |

### Form Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom `<input>` | `<Input>` | Text input with validation states |
| Custom `<select>` | `<Select>` | Dropdown with search and multi-select |
| Custom `<button>` | `<Button>` | Button with variants (primary, secondary, danger) |
| Custom `<textarea>` | `<Textarea>` | Multi-line text input |
| Custom checkbox | `<Checkbox>` | Single and group checkboxes |
| Custom radio | `<Radio>` | Single selection radio buttons |
| Custom form wrapper | `<FormGroup>` | Wrapper for label + input + error |

### Feedback Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom notification | `<Toast>` | Auto-dismiss notifications (success, error, warning, info) |
| Custom tooltip | `<Tooltip>` | Hover-triggered information |
| Custom loading spinner | `<Spinner>` | Loading indicator with animation |
| Custom skeleton | `<Skeleton>` | Placeholder during data loading |

### Navigation Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom tabs | `<Tabs>` | Tabbed interface with content switching |
| Custom accordion | `<Accordion>` | Collapsible sections |
| Custom breadcrumb | `<Breadcrumb>` | Navigation path |
| Custom pagination | `<Pagination>` | Page navigation with prev/next |

### Data Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom table | `<Table>` | Data table with sorting, filtering, pagination |
| Custom chart | `<Chart>` | Bar, line, pie, area charts |
| Custom progress bar | `<ProgressBar>` | Linear progress with percentage |

### Modal Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom modal | `<Modal>` | Dialog with backdrop and close button |
| Custom alert dialog | `<AlertDialog>` | Confirmation dialog |
| Custom drawer | `<Drawer>` | Side panel overlay |

## Breaking Changes

### 1. CSS Class Names
**Old:** Custom CSS classes like `mira-section`, `section-content`, `section-layout`
**New:** Tailwind CSS utility classes
**Migration:** Replace custom classes with Tailwind equivalents

```tsx
// Before
<section className="mira-section mira-astrology">
  <div className="section-content">
    <h2 className="section-title">Title</h2>
  </div>
</section>

// After
<Section>
  <Container>
    <h2 className="text-4xl font-bold text-gold-500">Title</h2>
  </Container>
</Section>
```

### 2. Inline Styles
**Old:** Inline `style` attributes with custom properties
**New:** Tailwind CSS utility classes
**Migration:** Convert inline styles to Tailwind classes

```tsx
// Before
<div style={{ marginBottom: '16px', color: '#FFC107' }}>
  Content
</div>

// After
<div className="mb-4 text-gold-500">
  Content
</div>
```

### 3. Component Props
**Old:** Custom props like `variant`, `size`, `disabled`
**New:** Standardized design system props
**Migration:** Update prop names and values

```tsx
// Before
<button className="btn btn-primary btn-lg">
  Click me
</button>

// After
<Button variant="primary" size="lg">
  Click me
</Button>
```

### 4. Color Values
**Old:** Hex colors like `#FFC107`, `#00BCD4`
**New:** Design system color tokens
**Migration:** Use Tailwind color classes

```tsx
// Before
<div style={{ color: '#FFC107' }}>Gold text</div>

// After
<div className="text-gold-500">Gold text</div>
```

### 5. Typography
**Old:** Custom font sizes and weights
**New:** Design system typography tokens
**Migration:** Use Tailwind typography classes

```tsx
// Before
<h1 style={{ fontSize: '48px', fontWeight: 'bold' }}>
  Heading
</h1>

// After
<h1 className="text-5xl font-bold">
  Heading
</h1>
```

## Upgrade Path

### Phase 1: Setup (1-2 hours)
1. Install design system package
2. Update Tailwind configuration
3. Update TypeScript configuration
4. Import design system components

### Phase 2: Layout Components (2-3 hours)
1. Replace custom section wrappers with `<Section>`
2. Replace custom containers with `<Container>`
3. Replace custom flexbox with `<Stack>`
4. Replace custom grids with `<Grid>`
5. Update Navbar and Sidebar

### Phase 3: Content Components (2-3 hours)
1. Replace custom cards with `<Card>`
2. Replace service sections with `<ServiceCard>`
3. Update Hero sections
4. Update Section components

### Phase 4: Form Components (2-3 hours)
1. Replace custom inputs with `<Input>`
2. Replace custom selects with `<Select>`
3. Replace custom buttons with `<Button>`
4. Replace custom textareas with `<Textarea>`
5. Update form validation

### Phase 5: Feedback Components (1-2 hours)
1. Replace custom notifications with `<Toast>`
2. Replace custom tooltips with `<Tooltip>`
3. Replace custom spinners with `<Spinner>`
4. Replace custom skeletons with `<Skeleton>`

### Phase 6: Navigation Components (1-2 hours)
1. Replace custom tabs with `<Tabs>`
2. Replace custom accordions with `<Accordion>`
3. Replace custom breadcrumbs with `<Breadcrumb>`
4. Replace custom pagination with `<Pagination>`

### Phase 7: Data Components (2-3 hours)
1. Replace custom tables with `<Table>`
2. Replace custom charts with `<Chart>`
3. Replace custom progress bars with `<ProgressBar>`

### Phase 8: Modal Components (1-2 hours)
1. Replace custom modals with `<Modal>`
2. Replace custom alert dialogs with `<AlertDialog>`
3. Replace custom drawers with `<Drawer>`

### Phase 9: Testing & Verification (2-3 hours)
1. Test all components visually
2. Verify responsive behavior
3. Test accessibility with screen readers
4. Test keyboard navigation
5. Verify Z-Scroll tunnel effect still works

### Phase 10: Cleanup (1 hour)
1. Remove old CSS files
2. Remove old component files
3. Update imports throughout app
4. Run final tests

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

### 4. Import Design System Components

```tsx
import {
  Button,
  Card,
  Input,
  Modal,
  Section,
  Container,
  Stack,
  Grid,
  // ... other components
} from '@mirastros/design-system';
```

## Migration Examples

### Example 1: Simple Section

**Before:**
```tsx
<section className="mira-section mira-astrology" id="astrology">
  <div className="section-content">
    <div className="section-layout section-layout-overlay">
      <div className="section-media">
        <div className="section-category why-feature__tag">АСТРОЛОГИЯ</div>
        <img src="/astro.gif" alt="Астрология" />
      </div>
      <div className="section-text">
        <h2 className="section-title why-core-chip">Наука о звездах</h2>
        <p className="section-description">Изучите влияние планет</p>
      </div>
    </div>
  </div>
</section>
```

**After:**
```tsx
import { Section, Container, Stack, Badge } from '@mirastros/design-system';

<Section id="astrology">
  <Container>
    <Stack direction="row" gap="lg" align="center">
      <div className="flex-1">
        <Badge variant="primary">АСТРОЛОГИЯ</Badge>
        <h2 className="text-4xl font-bold text-gold-500 mt-4">Наука о звездах</h2>
        <p className="text-gray-300 mt-2">Изучите влияние планет</p>
      </div>
      <img src="/astro.gif" alt="Астрология" className="flex-1" />
    </Stack>
  </Container>
</Section>
```

### Example 2: Form Component

**Before:**
```tsx
<div className="form-group">
  <label className="form-label">Email</label>
  <input
    type="email"
    className="form-input"
    placeholder="Enter email"
  />
  <span className="form-error">Invalid email</span>
</div>
```

**After:**
```tsx
import { FormGroup, Input } from '@mirastros/design-system';

<FormGroup label="Email" error="Invalid email">
  <Input
    type="email"
    placeholder="Enter email"
  />
</FormGroup>
```

### Example 3: Button Component

**Before:**
```tsx
<button className="btn btn-primary btn-lg">
  Click me
</button>
```

**After:**
```tsx
import { Button } from '@mirastros/design-system';

<Button variant="primary" size="lg">
  Click me
</Button>
```

## Testing Checklist

- [ ] All components render without errors
- [ ] Responsive behavior works on mobile (320px), tablet (768px), desktop (1024px)
- [ ] Z-Scroll tunnel effect still works
- [ ] Colors match design system tokens
- [ ] Typography is consistent
- [ ] Spacing is consistent
- [ ] Keyboard navigation works
- [ ] Screen reader support works
- [ ] Touch targets are 44x44px minimum on mobile
- [ ] No console errors or warnings
- [ ] Performance is acceptable (Lighthouse score > 80)

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

3. **Clear build cache:**
   ```bash
   rm -rf .next node_modules/.cache
   ```

4. **Restart development server:**
   ```bash
   npm run dev
   ```

## Common Issues & Solutions

### Issue 1: Tailwind Classes Not Applied
**Solution:** Ensure Tailwind configuration includes design system preset and content paths

### Issue 2: Component Props Not Recognized
**Solution:** Check TypeScript types are imported and component props match design system interface

### Issue 3: Colors Not Matching
**Solution:** Verify Tailwind color tokens are defined in design system preset

### Issue 4: Responsive Behavior Broken
**Solution:** Use Tailwind responsive prefixes (sm:, md:, lg:, xl:) instead of custom media queries

### Issue 5: Z-Scroll Effect Not Working
**Solution:** Ensure animation tokens are preserved and CSS animations are not disabled

## Support & Resources

- **Design System Documentation:** `packages/design-system/docs/`
- **Component Stories:** `packages/design-system/stories/`
- **Storybook:** Run `npm run storybook` to view interactive components
- **Requirements:** See `.kiro/specs/design-system-unification/requirements.md`
- **Design Document:** See `.kiro/specs/design-system-unification/design.md`

## Next Steps

After completing the web app migration:

1. Migrate mobile app to design system
2. Migrate admin panel to design system
3. Migrate telegram-mini to design system
4. Migrate vk-mini to design system
5. Perform accessibility audit
6. Optimize performance and bundle size
