# Storybook Stories

This directory contains all Storybook stories for the Mirastros Design System.

## Structure

```
stories/
├── Introduction.stories.mdx       # Welcome page
├── Tokens/                        # Design tokens documentation
│   ├── Colors.stories.tsx
│   ├── Typography.stories.tsx
│   └── Spacing.stories.tsx
├── Components/                    # Component stories
│   ├── Button.stories.tsx
│   ├── Card.stories.tsx
│   └── ...
└── Guidelines/                    # Design guidelines
    ├── DesignPrinciples.stories.mdx
    ├── Accessibility.stories.mdx
    └── ...
```

## Creating Stories

### Basic Component Story

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../src/components/Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};
```

### MDX Documentation

```mdx
import { Meta } from '@storybook/blocks';

<Meta title="Guidelines/Design Principles" />

# Design Principles

Content here...
```

## Running Storybook

```bash
npm run storybook
```

Storybook will start on `http://localhost:6006`

## Building Storybook

```bash
npm run storybook:build
```

This generates a static build in the `storybook-static` directory.

## Best Practices

1. **One story per variant** - Create separate stories for each component variant
2. **Use descriptive names** - Story names should clearly describe what they show
3. **Include all states** - Show default, hover, focus, disabled, loading states
4. **Document props** - Use TypeScript types for automatic prop documentation
5. **Add accessibility info** - Include ARIA labels and keyboard navigation examples
6. **Use realistic content** - Avoid placeholder text, use meaningful examples

## Accessibility Testing

All stories are automatically tested for accessibility using the axe addon. Check the Accessibility tab in Storybook to see any issues.

## Resources

- [Storybook Documentation](https://storybook.js.org/)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)
- [MDX Documentation](https://storybook.js.org/docs/react/api/mdx)
