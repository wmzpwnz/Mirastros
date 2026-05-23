# Storybook Infrastructure Setup

## Overview

Storybook has been successfully set up for the Mirastros Design System. This document outlines what was configured and how to use it.

## What Was Implemented

### 1. Storybook Configuration Files

#### `.storybook/main.ts`
- Configured Storybook with React and Webpack5
- Added all essential addons:
  - Accessibility (a11y) testing
  - Controls for interactive prop manipulation
  - Docs for automatic documentation
  - Viewport for responsive testing
  - Interactions for user event testing
  - Links for navigation
  - Essentials (actions, backgrounds, toolbars)
- Configured TypeScript support with react-docgen-typescript
- Set up story discovery pattern: `../stories/**/*.stories.@(ts|tsx|js|jsx|mdx)`

#### `.storybook/preview.ts`
- Imported global styles (globals.css, animations.css, accessibility.css, theme.css)
- Configured viewport presets (mobile, tablet, desktop)
- Set up accessibility testing rules
- Added decorator for cosmic theme background
- Configured controls matchers for colors and dates

#### `.storybook/manager.ts`
- Created custom Storybook theme with Mirastros branding
- Applied cosmic color scheme (#050505 background, #FFC107 gold accents)
- Configured UI layout and sidebar behavior
- Set typography to Inter (body) and Fira Code (monospace)

#### `.storybook/tsconfig.json`
- Extended base TypeScript configuration
- Enabled JSX support for React
- Configured module resolution for stories

### 2. Global Styles

#### `src/styles/globals.css`
- Base Tailwind CSS imports
- Global element resets
- Scrollbar styling
- Selection styling
- Font smoothing

#### `src/styles/animations.css`
- Animation keyframes (pulse-slow, float, bounce-slow, fade-in, slide-in, scale-in)
- Animation utility classes
- Prefers-reduced-motion support for accessibility

#### `src/styles/accessibility.css`
- Focus visible styles for keyboard navigation
- Screen reader only content (.sr-only)
- Skip to main content link
- Reduced motion support
- High contrast mode support
- Forced colors mode support
- Form group focus styling
- Error, success, warning, info message styles

#### `src/styles/theme.css`
- CSS custom properties for all design tokens
- Dark theme variables (default)
- Light theme variables
- Color, typography, spacing, shadow, animation, and breakpoint variables

### 3. Initial Story Structure

#### `stories/Introduction.stories.mdx`
- Welcome page with overview
- Getting started guide
- Design principles explanation
- Navigation guide
- Platform information
- Resource links

#### `stories/Tokens/Colors.stories.tsx`
- Complete color palette visualization
- Cosmic theme colors
- Gold accent palette (50-900)
- Turquoise accent palette (50-900)
- Semantic colors (success, warning, error, info)
- Grayscale palette

#### `stories/Tokens/Typography.stories.tsx`
- Font families showcase (Cinzel, Inter, Fira Code)
- Font sizes (xs through 7xl)
- Font weights (light through extrabold)
- Line heights (none through loose)

#### `stories/Tokens/Spacing.stories.tsx`
- Spacing scale visualization (8px base unit)
- Spacing in layout examples
- Gap examples with visual representation

#### `stories/Components/Button.stories.tsx`
- Button variants (primary, secondary, danger, ghost)
- Button sizes (small, medium, large)
- Button states (default, disabled, loading)
- All variants showcase

#### `stories/Components/Card.stories.tsx`
- Card variants (default, elevated, outlined)
- Interactive card with hover effects
- Card with image header
- Card with action button
- Card grid layout

#### `stories/README.md`
- Documentation for creating stories
- Story structure guidelines
- Best practices
- Accessibility testing information

### 4. Package Configuration

Updated `package.json` with:
- Storybook scripts:
  - `npm run storybook` - Start Storybook dev server on port 6006
  - `npm run storybook:build` - Build static Storybook
- Storybook dependencies (v8.0.0):
  - @storybook/react
  - @storybook/react-webpack5
  - @storybook/addon-essentials
  - @storybook/addon-interactions
  - @storybook/addon-a11y
  - @storybook/addon-viewport
  - @storybook/addon-controls
  - @storybook/addon-docs
  - @storybook/addon-links
  - @storybook/blocks
  - @storybook/test
  - storybook

## How to Use

### Starting Storybook

```bash
cd packages/design-system
npm run storybook
```

Storybook will start on `http://localhost:6006`

### Building Storybook

```bash
cd packages/design-system
npm run storybook:build
```

This generates a static build in `storybook-static/` directory.

### Creating New Stories

1. Create a new file in `stories/` directory with `.stories.tsx` or `.stories.mdx` extension
2. Follow the story format:

```tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/YourComponent',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <YourComponent />,
};
```

## Features

### Accessibility Testing
- Automatic axe accessibility scanning
- Color contrast validation
- ARIA role validation
- Button name validation

### Responsive Testing
- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Desktop viewport (1280x720)
- Custom viewport support

### Interactive Controls
- Automatic prop controls
- Color picker for color props
- Date picker for date props
- Custom control matchers

### Documentation
- Automatic prop documentation
- MDX support for custom documentation
- Code snippet generation
- Component source code display

### Theme Support
- Dark theme (default) with cosmic aesthetic
- Custom Storybook UI theme
- CSS variable support for theming
- Light theme variables available

## File Structure

```
packages/design-system/
├── .storybook/
│   ├── main.ts                 # Main Storybook config
│   ├── preview.ts              # Preview config with styles
│   ├── manager.ts              # Custom UI theme
│   ├── tsconfig.json           # TypeScript config
│   └── .gitignore
├── src/
│   ├── styles/
│   │   ├── globals.css         # Global styles
│   │   ├── animations.css      # Animation definitions
│   │   ├── accessibility.css   # A11y utilities
│   │   └── theme.css           # CSS variables
│   ├── tokens/                 # Design tokens
│   ├── components/             # Components
│   └── types/                  # TypeScript types
├── stories/
│   ├── Introduction.stories.mdx
│   ├── Tokens/
│   │   ├── Colors.stories.tsx
│   │   ├── Typography.stories.tsx
│   │   └── Spacing.stories.tsx
│   ├── Components/
│   │   ├── Button.stories.tsx
│   │   ├── Card.stories.tsx
│   │   └── ...
│   └── README.md
├── package.json                # Updated with Storybook deps
└── STORYBOOK_SETUP.md         # This file
```

## Next Steps

1. **Add More Component Stories** - Create stories for remaining components (Input, Select, Modal, etc.)
2. **Create Guidelines Stories** - Add MDX stories for design principles, accessibility, responsive design
3. **Add Pattern Stories** - Document common UI patterns and layouts
4. **Configure CI/CD** - Set up automated Storybook builds and deployments
5. **Add Visual Regression Testing** - Integrate visual testing tools
6. **Document Migration Guides** - Create stories for platform-specific migration guides

## Troubleshooting

### Storybook won't start
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Storybook cache: `rm -rf .storybook-cache`

### Styles not loading
- Ensure Tailwind CSS is properly configured
- Check that CSS files are imported in preview.ts
- Verify tailwind.preset.js is correctly configured

### TypeScript errors
- Ensure tsconfig.json has jsx: "react-jsx"
- Check that all imports are correct
- Run `npm run storybook` to see full error messages

## Resources

- [Storybook Documentation](https://storybook.js.org/)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)
- [MDX Documentation](https://storybook.js.org/docs/react/api/mdx)
- [Accessibility Testing](https://storybook.js.org/docs/react/writing-tests/accessibility-testing)
- [Responsive Testing](https://storybook.js.org/docs/react/essentials/viewport)
