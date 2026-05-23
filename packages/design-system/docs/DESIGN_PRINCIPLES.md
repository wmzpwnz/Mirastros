# Design Principles & Guidelines

## Table of Contents

1. [Cosmic Theme Aesthetic](#cosmic-theme-aesthetic)
2. [Color Usage Guidelines](#color-usage-guidelines)
3. [Typography Hierarchy](#typography-hierarchy)
4. [Spacing & Layout Principles](#spacing--layout-principles)
5. [Animation & Motion Guidelines](#animation--motion-guidelines)
6. [Accessibility Principles](#accessibility-principles)
7. [Best Practices](#best-practices)

---

## Cosmic Theme Aesthetic

### Visual Language

The Mirastros design system embraces a **cosmic mystical aesthetic** that evokes wonder, spirituality, and the infinite universe. The visual language combines:

- **Dark, immersive backgrounds** that create a sense of depth and mystery
- **Gold and turquoise accents** that represent celestial bodies and spiritual energy
- **Smooth, flowing animations** that suggest cosmic movement and transformation
- **Elegant typography** that conveys sophistication and wisdom

### Core Design Values

#### 1. **Mystical Elegance**
Every element should feel intentional and refined. Avoid clutter and unnecessary decoration. Let whitespace and negative space create breathing room.

#### 2. **Cosmic Depth**
Use layering, shadows, and color gradients to create a sense of depth and dimension. Elements should feel like they exist in a three-dimensional cosmic space.

#### 3. **Spiritual Connection**
Design should evoke a sense of wonder and connection. Use subtle animations and transitions to guide users through their journey.

#### 4. **Accessibility First**
Mystical doesn't mean inaccessible. All design decisions must prioritize inclusivity and usability for all users.

### Color Foundation

The cosmic theme is built on a foundation of:

- **Primary Background**: `#050505` (Cosmic Black) - Deep, immersive, almost void-like
- **Secondary Background**: `#0a0a0a` (Void) - Slightly lighter for layering and depth
- **Primary Accent**: `#FFD700` (Gold) - Represents celestial bodies, wisdom, and enlightenment
- **Secondary Accent**: `#40E0D0` (Turquoise) - Represents spiritual energy, healing, and transformation

---

## Color Usage Guidelines

### Color Palette

#### Cosmic Neutrals
```
Cosmic Black:    #050505  (Primary background)
Void:            #0a0a0a  (Secondary background)
Silver:          #C0C0C0  (Tertiary text, borders)
```

#### Primary Accents
```
Gold:            #FFD700  (Primary CTA, highlights, premium features)
Turquoise:       #40E0D0  (Secondary CTA, interactive elements)
```

#### Semantic Colors
```
Success:         #10B981  (Confirmations, positive actions)
Warning:         #F59E0B  (Cautions, alerts)
Error:           #EF4444  (Errors, destructive actions)
Info:            #3B82F6  (Information, neutral notifications)
```

### Color Usage Rules

#### 1. **Background Colors**
- **Primary Background** (`#050505`): Use for main page backgrounds and large containers
- **Secondary Background** (`#0a0a0a`): Use for cards, modals, and layered elements
- **Tertiary Background** (`#1a103c`): Use for hover states and subtle depth

**Example**: A card on the main page should use `#0a0a0a` to create visual separation from the `#050505` page background.

#### 2. **Text Colors**
- **Primary Text** (`#FFFFFF`): Use for main body text and headings
- **Secondary Text** (`#C0C0C0`): Use for supporting text, labels, and descriptions
- **Tertiary Text** (`#808080`): Use for disabled text, hints, and placeholders
- **Accent Text** (`#FFD700`): Use sparingly for emphasis and important information

**Example**: A heading should use `#FFFFFF`, supporting text should use `#C0C0C0`, and disabled form fields should use `#808080`.

#### 3. **Accent Colors**
- **Gold** (`#FFD700`): Use for primary CTAs, premium features, and important highlights
- **Turquoise** (`#40E0D0`): Use for secondary CTAs, interactive elements, and hover states
- **Purple** (`#2E1065`): Use for special features and mystical elements

**Example**: A primary button should use gold background with cosmic black text. A secondary button should use turquoise.

#### 4. **Status Colors**
- **Success** (`#10B981`): Use for successful actions, confirmations, and positive feedback
- **Warning** (`#F59E0B`): Use for warnings, cautions, and attention-needed states
- **Error** (`#EF4444`): Use for errors, destructive actions, and critical alerts
- **Info** (`#3B82F6`): Use for informational messages and neutral notifications

**Example**: A success toast should use `#10B981` background with white text. An error message should use `#EF4444`.

### Contrast Requirements (WCAG 2.1 AA)

All color combinations must meet minimum contrast ratios:

- **Normal Text**: 4.5:1 contrast ratio minimum
- **Large Text** (18pt+): 3:1 contrast ratio minimum
- **UI Components**: 3:1 contrast ratio minimum

#### Approved Combinations

| Foreground | Background | Contrast | Use Case |
|-----------|-----------|----------|----------|
| #FFFFFF | #050505 | 21:1 | Primary text on cosmic background |
| #FFFFFF | #0a0a0a | 19.5:1 | Primary text on secondary background |
| #C0C0C0 | #050505 | 7.5:1 | Secondary text on cosmic background |
| #FFD700 | #050505 | 8.6:1 | Gold accent on cosmic background |
| #40E0D0 | #050505 | 8.2:1 | Turquoise accent on cosmic background |
| #FFFFFF | #EF4444 | 3.9:1 | White text on error background |
| #FFFFFF | #10B981 | 4.5:1 | White text on success background |

### Color-Blind Friendly Design

Never rely on color alone to convey meaning. Always provide additional visual cues:

- **Status Indicators**: Use icons or text labels in addition to color
- **Charts & Graphs**: Use patterns, textures, or labels in addition to color
- **Form Validation**: Use icons and text messages in addition to color

**Example**: An error field should have a red border (color), a red error icon (icon), and error text (text).

---

## Typography Hierarchy

### Font Families

#### Headings: Cinzel
- **Font**: Cinzel, serif
- **Use**: All headings (H1-H6), titles, and prominent text
- **Characteristics**: Elegant, sophisticated, mystical
- **Weights**: 400 (normal), 600 (semibold), 700 (bold)

#### Body: Inter
- **Font**: Inter, sans-serif
- **Use**: Body text, labels, descriptions, and UI text
- **Characteristics**: Clean, readable, modern
- **Weights**: 400 (normal), 500 (medium), 600 (semibold)

#### Code: Monospace
- **Font**: Monospace (system default)
- **Use**: Code blocks, technical content, and data
- **Characteristics**: Fixed-width, technical
- **Weights**: 400 (normal)

### Font Sizes & Hierarchy

```
7xl: 4.5rem   (72px)  - Page titles, hero text
6xl: 3.75rem  (60px)  - Large section headings
5xl: 3rem     (48px)  - Section headings
4xl: 2.25rem  (36px)  - Subsection headings
3xl: 1.875rem (30px)  - Card titles, prominent text
2xl: 1.5rem   (24px)  - Subheadings, emphasis
xl:  1.25rem  (20px)  - Labels, strong emphasis
lg:  1.125rem (18px)  - Body text (large)
base: 1rem    (16px)  - Body text (default)
sm:  0.875rem (14px)  - Secondary text, captions
xs:  0.75rem  (12px)  - Tertiary text, hints
```

### Font Weights

```
Light (300):      Rarely used, only for very subtle text
Normal (400):     Default weight for body text and regular headings
Medium (500):     Emphasis within body text, secondary labels
Semibold (600):   Subheadings, strong emphasis, button text
Bold (700):       Headings, important text, strong emphasis
Extrabold (800):  Page titles, hero text, maximum emphasis
```

### Line Heights

```
none (1):         Headings, single-line text
tight (1.25):     Headings, compact text
snug (1.375):     Subheadings, semi-compact text
normal (1.5):     Body text, default readability
relaxed (1.625):  Long-form content, increased readability
loose (2):        Accessibility-focused content, maximum readability
```

### Typography Usage Examples

#### Page Title (H1)
```
Font: Cinzel
Size: 5xl (48px)
Weight: 700 (bold)
Line Height: tight (1.25)
Color: #FFFFFF
```

#### Section Heading (H2)
```
Font: Cinzel
Size: 3xl (30px)
Weight: 600 (semibold)
Line Height: snug (1.375)
Color: #FFFFFF
```

#### Body Text
```
Font: Inter
Size: base (16px)
Weight: 400 (normal)
Line Height: normal (1.5)
Color: #FFFFFF
```

#### Secondary Text
```
Font: Inter
Size: sm (14px)
Weight: 400 (normal)
Line Height: normal (1.5)
Color: #C0C0C0
```

#### Button Text
```
Font: Inter
Size: base (16px)
Weight: 600 (semibold)
Line Height: normal (1.5)
Color: #050505 (on gold) or #050505 (on turquoise)
```

### Responsive Typography

Typography scales proportionally on mobile devices:

- **Mobile** (320px - 767px): 80% of desktop size
- **Tablet** (768px - 1023px): 90% of desktop size
- **Desktop** (1024px+): 100% (full size)

**Example**: A heading that is `3xl` (30px) on desktop becomes:
- Tablet: 27px (90%)
- Mobile: 24px (80%)

---

## Spacing & Layout Principles

### Spacing System

The design system uses an **8px base unit** for consistent spacing:

```
0:   0px
1:   4px   (0.25rem)
2:   8px   (0.5rem)
3:   12px  (0.75rem)
4:   16px  (1rem)
6:   24px  (1.5rem)
8:   32px  (2rem)
12:  48px  (3rem)
16:  64px  (4rem)
20:  80px  (5rem)
24:  96px  (6rem)
```

### Spacing Usage Rules

#### 1. **Padding** (Internal spacing)
- **Components**: Use `p-2` (8px) to `p-4` (16px) for internal padding
- **Cards**: Use `p-4` (16px) to `p-6` (24px) for card padding
- **Sections**: Use `p-6` (24px) to `p-12` (48px) for section padding

**Example**: A button should have `px-4 py-2` (16px horizontal, 8px vertical).

#### 2. **Margin** (External spacing)
- **Between elements**: Use `m-2` (8px) to `m-4` (16px)
- **Between sections**: Use `m-6` (24px) to `m-12` (48px)
- **Between pages**: Use `m-12` (48px) to `m-16` (64px)

**Example**: Two cards should have `m-4` (16px) spacing between them.

#### 3. **Gap** (Flex/Grid spacing)
- **Tight layouts**: Use `gap-2` (8px) or `gap-3` (12px)
- **Normal layouts**: Use `gap-4` (16px) or `gap-6` (24px)
- **Loose layouts**: Use `gap-8` (32px) or `gap-12` (48px)

**Example**: A grid of cards should have `gap-6` (24px) between items.

### Layout Principles

#### 1. **Grid System**
- **12-column grid** for responsive layouts
- **Mobile**: 1-2 columns
- **Tablet**: 2-3 columns
- **Desktop**: 3-4 columns

#### 2. **Container Widths**
```
sm:  640px   (Small containers, sidebars)
md:  768px   (Medium containers, cards)
lg:  1024px  (Large containers, main content)
xl:  1280px  (Extra large containers, full width)
2xl: 1536px  (Ultra wide containers, maximum width)
```

#### 3. **Responsive Breakpoints**
```
Mobile:    320px - 767px
Tablet:    768px - 1023px
Desktop:   1024px - 1279px
Wide:      1280px - 1535px
Ultrawide: 1536px+
```

#### 4. **Mobile-First Approach**
- Design for mobile first (320px)
- Progressively enhance for larger screens
- Use mobile-first media queries: `@media (min-width: 768px)`

### Whitespace & Breathing Room

- **Never** eliminate whitespace to fit more content
- Use whitespace to create visual hierarchy and focus
- Whitespace is as important as content
- Aim for 30-40% whitespace in layouts

---

## Animation & Motion Guidelines

### Animation Principles

#### 1. **Purpose-Driven**
Every animation must serve a purpose:
- **Feedback**: Confirm user actions (button clicks, form submissions)
- **Guidance**: Guide user attention to important elements
- **Transition**: Smooth transitions between states
- **Delight**: Add subtle personality and polish

#### 2. **Performance-First**
- Use GPU-accelerated properties: `transform`, `opacity`
- Avoid animating: `width`, `height`, `left`, `top`, `margin`, `padding`
- Target 60fps (16ms per frame)
- Measure and optimize animation performance

#### 3. **Accessibility-Conscious**
- Respect `prefers-reduced-motion` media query
- Provide non-animated alternatives
- Never use animations to convey critical information
- Test with users who have motion sensitivity

### Animation Timing

#### Durations
```
Fast:   150ms  (Micro-interactions, hover states)
Base:   300ms  (Standard transitions, state changes)
Slow:   500ms  (Entrance animations, complex transitions)
```

#### Easing Functions
```
ease-in:     cubic-bezier(0.4, 0, 1, 1)      (Accelerating)
ease-out:    cubic-bezier(0, 0, 0.2, 1)      (Decelerating)
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)    (Smooth)
linear:      linear                           (Constant speed)
```

### Animation Presets

#### 1. **Pulse Slow** (4s)
- **Use**: Loading states, attention-grabbing elements
- **Easing**: cubic-bezier(0.4, 0, 0.6, 1)
- **Example**: Pulsing icon indicating loading

#### 2. **Float** (6s)
- **Use**: Floating elements, subtle movement
- **Easing**: ease-in-out
- **Example**: Floating decorative elements, hero images

#### 3. **Bounce Slow** (3s)
- **Use**: Playful interactions, call-to-action elements
- **Easing**: ease-in-out
- **Example**: Bouncing button, animated icon

### Animation Best Practices

#### Do's
- ✅ Use animations to enhance user experience
- ✅ Keep animations subtle and purposeful
- ✅ Use consistent timing across the application
- ✅ Test animations on real devices
- ✅ Provide fallbacks for reduced motion
- ✅ Use animations to guide user attention

#### Don'ts
- ❌ Animate for the sake of animation
- ❌ Use animations that distract from content
- ❌ Create animations that are too fast or too slow
- ❌ Ignore accessibility requirements
- ❌ Animate properties that cause layout thrashing
- ❌ Use animations that reduce performance

### Reduced Motion Support

Always respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Principles

### WCAG 2.1 AA Compliance

All components and designs must meet **WCAG 2.1 Level AA** standards:

- **Perceivable**: Information must be perceivable to all users
- **Operable**: Users must be able to operate the interface
- **Understandable**: Information and operation must be understandable
- **Robust**: Content must be robust enough for assistive technologies

### Color & Contrast

#### Contrast Ratios
- **Normal Text**: Minimum 4.5:1
- **Large Text** (18pt+): Minimum 3:1
- **UI Components**: Minimum 3:1
- **Graphical Elements**: Minimum 3:1

#### Color-Blind Friendly Design
- Never rely on color alone to convey meaning
- Use icons, patterns, or text labels in addition to color
- Test designs with color-blind simulation tools
- Provide alternative text for color-dependent information

### Keyboard Navigation

#### Requirements
- All interactive elements must be keyboard accessible
- Tab order must be logical and intuitive
- Focus indicators must be visible and clear
- Keyboard shortcuts must be documented

#### Focus Management
- Focus indicator must have minimum 3:1 contrast
- Focus indicator must be at least 2px visible
- Focus must be managed when opening/closing modals
- Focus must return to trigger element when closing modals

### Screen Reader Support

#### ARIA Labels
- Use `aria-label` for icon-only buttons
- Use `aria-describedby` for additional descriptions
- Use `aria-live` for dynamic content updates
- Use `aria-hidden` for decorative elements

#### Semantic HTML
- Use semantic HTML elements: `<button>`, `<nav>`, `<main>`, `<article>`
- Use proper heading hierarchy: `<h1>` → `<h2>` → `<h3>`
- Use `<label>` for form fields
- Use `<fieldset>` and `<legend>` for form groups

### Form Accessibility

#### Labels
- Every form field must have an associated `<label>`
- Labels must be visible and descriptive
- Use `htmlFor` attribute to associate labels with inputs

#### Error Messages
- Error messages must be associated with form fields
- Use `aria-describedby` to link errors to fields
- Error messages must be clear and actionable
- Errors must be announced to screen readers

#### Validation
- Provide real-time validation feedback
- Indicate required fields clearly
- Provide helpful error messages
- Allow users to correct errors easily

### Motion & Animation

#### Reduced Motion
- Respect `prefers-reduced-motion` media query
- Provide non-animated alternatives
- Never use animations to convey critical information
- Test with users who have motion sensitivity

#### Seizure Prevention
- Avoid flashing content (more than 3 flashes per second)
- Avoid rapid color changes
- Avoid strobing effects
- Test animations for seizure risk

### Text & Readability

#### Font Size
- Minimum 14px for body text
- Minimum 12px for secondary text
- Larger text for users with low vision
- Support browser text size adjustments

#### Line Height
- Minimum 1.5 for body text
- Minimum 1.25 for headings
- Adequate spacing between lines
- Support user-defined line heights

#### Line Length
- Optimal line length: 50-75 characters
- Maximum line length: 100 characters
- Avoid very long lines that are hard to read
- Use columns for long-form content

### Images & Icons

#### Alt Text
- Provide descriptive alt text for all images
- Alt text should describe the image content
- Decorative images should have empty alt text (`alt=""`)
- Complex images should have longer descriptions

#### Icons
- Icon-only buttons must have `aria-label`
- Icons should have semantic meaning
- Provide text labels for important icons
- Test icons with screen readers

### Testing for Accessibility

#### Automated Testing
- Use axe accessibility scanner
- Use WAVE accessibility checker
- Use Lighthouse accessibility audit
- Run automated tests in CI/CD pipeline

#### Manual Testing
- Test with keyboard navigation only
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test with browser zoom (up to 200%)
- Test with high contrast mode
- Test with color-blind simulation

#### User Testing
- Test with users who have disabilities
- Test with assistive technology users
- Gather feedback on accessibility
- Iterate based on user feedback

---

## Best Practices

### Component Design

#### 1. **Consistency**
- Use consistent naming conventions
- Use consistent prop interfaces
- Use consistent styling patterns
- Use consistent behavior across components

#### 2. **Simplicity**
- Keep components simple and focused
- Avoid over-engineering
- Provide sensible defaults
- Allow customization when needed

#### 3. **Reusability**
- Design components for reuse
- Avoid component-specific styling
- Use composition over inheritance
- Document component usage

#### 4. **Performance**
- Minimize bundle size
- Optimize render performance
- Use code splitting
- Lazy load components when appropriate

### Documentation

#### 1. **Storybook Stories**
- Create stories for all component variants
- Include interactive controls (knobs)
- Provide usage examples
- Document props and behavior

#### 2. **Code Comments**
- Document complex logic
- Explain design decisions
- Provide usage examples
- Link to related components

#### 3. **README Files**
- Provide component overview
- Document props and types
- Provide usage examples
- Link to Storybook stories

### Testing

#### 1. **Unit Tests**
- Test component rendering
- Test component props
- Test component behavior
- Test accessibility features

#### 2. **Integration Tests**
- Test component interactions
- Test component composition
- Test state management
- Test event handling

#### 3. **Visual Tests**
- Capture component screenshots
- Compare against baseline images
- Alert on visual changes
- Test on different browsers

### Code Quality

#### 1. **TypeScript**
- Use TypeScript for type safety
- Define prop interfaces
- Export types for consumers
- Avoid `any` types

#### 2. **Linting**
- Use ESLint for code quality
- Use Prettier for code formatting
- Follow consistent code style
- Fix linting errors before committing

#### 3. **Version Control**
- Write clear commit messages
- Keep commits focused and atomic
- Use feature branches
- Create pull requests for review

---

## Resources

### External References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM - Web Accessibility](https://webaim.org/)
- [Inclusive Components](https://inclusive-components.design/)

### Internal Resources
- [Storybook Documentation](./STORYBOOK_SETUP.md)
- [Component Library](../src/components/)
- [Design Tokens](../src/tokens/)
- [Tailwind Configuration](../tailwind.preset.js)

---

## Questions & Support

For questions about design principles or guidelines, please:

1. Check this documentation
2. Review Storybook stories for examples
3. Check component source code
4. Ask in the design system team channel
5. Create an issue in the repository

