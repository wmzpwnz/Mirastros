# Responsive Design Guide

## Overview

This guide documents breakpoint usage, mobile-first approach, touch target sizes, and responsive typography for the Mirastros design system.

## Table of Contents

1. [Breakpoint System](#breakpoint-system)
2. [Mobile-First Approach](#mobile-first-approach)
3. [Touch Target Sizes](#touch-target-sizes)
4. [Responsive Typography](#responsive-typography)
5. [Responsive Layouts](#responsive-layouts)
6. [Responsive Images](#responsive-images)
7. [Testing Responsive Design](#testing-responsive-design)

---

## Breakpoint System

### Breakpoint Definitions

The design system uses five breakpoints for responsive design:

```
Mobile:    320px - 767px   (Small phones to large phones)
Tablet:    768px - 1023px  (Tablets and small laptops)
Desktop:   1024px - 1279px (Desktops and large laptops)
Wide:      1280px - 1535px (Large desktops)
Ultrawide: 1536px+         (Ultra-wide displays)
```

### Tailwind Breakpoint Prefixes

Tailwind CSS uses prefixes for responsive design:

```
sm:  640px   (Small devices)
md:  768px   (Medium devices - tablets)
lg:  1024px  (Large devices - desktops)
xl:  1280px  (Extra large devices)
2xl: 1536px  (Ultra-wide devices)
```

### Using Breakpoints

#### Mobile-First Approach
Always start with mobile styles, then add breakpoint prefixes for larger screens:

```tsx
// Mobile first (320px)
<div className="grid grid-cols-1 gap-4">
  {/* Single column on mobile */}
</div>

// Tablet (768px+)
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Two columns on tablet */}
</div>

// Desktop (1024px+)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Three columns on desktop */}
</div>
```

#### Media Query Syntax
```css
/* Mobile first - no prefix needed */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    width: 90%;
    padding: 2rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    width: 80%;
    max-width: 1200px;
    padding: 3rem;
  }
}
```

### Breakpoint Usage Examples

#### Container Widths
```tsx
// Mobile: Full width with padding
<Container className="w-full px-4">
  {/* 100% - 32px (16px padding each side) */}
</Container>

// Tablet: 90% width
<Container className="md:w-11/12">
  {/* 90% width on tablet */}
</Container>

// Desktop: Max width
<Container className="lg:max-w-4xl">
  {/* Max 56rem (896px) on desktop */}
</Container>
```

#### Grid Columns
```tsx
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 3 columns
<Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</Grid>
```

#### Spacing
```tsx
// Mobile: Small spacing
// Tablet: Medium spacing
// Desktop: Large spacing
<Stack className="gap-4 md:gap-6 lg:gap-8">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Stack>
```

#### Display
```tsx
// Hide on mobile, show on tablet+
<div className="hidden md:block">
  Desktop navigation
</div>

// Show on mobile, hide on tablet+
<div className="md:hidden">
  Mobile menu
</div>
```

---

## Mobile-First Approach

### Principles

#### 1. Start with Mobile
- Design for smallest screen first (320px)
- Ensure core functionality works on mobile
- Progressively enhance for larger screens
- Don't hide features on mobile

#### 2. Progressive Enhancement
- Add features as screen size increases
- Enhance layout for better use of space
- Add advanced features on desktop
- Maintain functionality across all sizes

#### 3. Content Priority
- Prioritize content for mobile
- Remove non-essential elements on mobile
- Add supplementary content on desktop
- Maintain content hierarchy

### Implementation Strategy

#### Step 1: Mobile Design
```tsx
// Start with mobile-first styles
<div className="flex flex-col gap-4">
  <Header />
  <Sidebar />
  <Main />
  <Footer />
</div>
```

#### Step 2: Tablet Enhancement
```tsx
// Add tablet styles
<div className="flex flex-col md:flex-row gap-4">
  <Header className="md:col-span-2" />
  <Sidebar className="md:w-1/4" />
  <Main className="md:flex-1" />
  <Footer className="md:col-span-2" />
</div>
```

#### Step 3: Desktop Enhancement
```tsx
// Add desktop styles
<div className="flex flex-col lg:flex-row gap-6">
  <Header className="lg:col-span-3" />
  <Sidebar className="lg:w-1/5" />
  <Main className="lg:flex-1" />
  <Footer className="lg:col-span-3" />
</div>
```

### Mobile-First Best Practices

#### Do's
- ✅ Start with mobile design
- ✅ Use mobile-first media queries
- ✅ Test on real mobile devices
- ✅ Prioritize content for mobile
- ✅ Use progressive enhancement
- ✅ Keep mobile experience fast

#### Don'ts
- ❌ Design desktop first
- ❌ Hide features on mobile
- ❌ Use desktop-first media queries
- ❌ Ignore mobile performance
- ❌ Use heavy images on mobile
- ❌ Forget mobile testing

---

## Touch Target Sizes

### Minimum Touch Target Size

#### WCAG 2.1 AA Standard
- **Minimum**: 44x44 CSS pixels
- **Recommended**: 48x48 CSS pixels
- **Spacing**: 8px minimum between targets

#### Implementation

```tsx
// Good: 44x44px button
<button className="h-11 w-11 p-2">
  {/* 44px = 2.75rem */}
</button>

// Better: 48x48px button
<button className="h-12 w-12 p-3">
  {/* 48px = 3rem */}
</button>

// Excellent: 48x48px with spacing
<div className="flex gap-2">
  <button className="h-12 w-12">Button 1</button>
  <button className="h-12 w-12">Button 2</button>
</div>
```

### Touch Target Spacing

#### Minimum Spacing
- **Between targets**: 8px minimum
- **From edge**: 8px minimum
- **Avoid**: Overlapping targets

#### Implementation

```tsx
// Good: 8px spacing between buttons
<div className="flex gap-2">
  <button className="h-12 w-12">Button 1</button>
  <button className="h-12 w-12">Button 2</button>
</div>

// Better: 12px spacing
<div className="flex gap-3">
  <button className="h-12 w-12">Button 1</button>
  <button className="h-12 w-12">Button 2</button>
</div>

// Excellent: 16px spacing
<div className="flex gap-4">
  <button className="h-12 w-12">Button 1</button>
  <button className="h-12 w-12">Button 2</button>
</div>
```

### Touch-Friendly Components

#### Buttons
```tsx
// Mobile-friendly button
<button className="h-12 px-4 py-2 rounded">
  {/* 48px height, adequate padding */}
</button>

// Icon button
<button className="h-12 w-12 flex items-center justify-center">
  <Icon />
</button>
```

#### Form Fields
```tsx
// Mobile-friendly input
<input
  className="h-12 px-4 py-2 text-base"
  type="text"
  placeholder="Enter text"
/>

// Mobile-friendly select
<select className="h-12 px-4 py-2 text-base">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

#### Links
```tsx
// Mobile-friendly link
<a
  href="/page"
  className="block h-12 px-4 py-2 flex items-center"
>
  Link text
</a>

// Icon link
<a href="/page" className="h-12 w-12 flex items-center justify-center">
  <Icon />
</a>
```

### Touch Target Testing

#### Testing Checklist
- [ ] All buttons are 44x44px minimum
- [ ] All links are 44x44px minimum
- [ ] All form fields are 44px tall minimum
- [ ] Spacing between targets is 8px minimum
- [ ] No overlapping touch targets
- [ ] Test on real mobile devices
- [ ] Test with touch, not mouse

---

## Responsive Typography

### Font Size Scaling

#### Desktop Sizes
```
7xl: 4.5rem   (72px)  - Page titles
6xl: 3.75rem  (60px)  - Large headings
5xl: 3rem     (48px)  - Section headings
4xl: 2.25rem  (36px)  - Subsection headings
3xl: 1.875rem (30px)  - Card titles
2xl: 1.5rem   (24px)  - Subheadings
xl:  1.25rem  (20px)  - Labels
lg:  1.125rem (18px)  - Body text (large)
base: 1rem    (16px)  - Body text (default)
sm:  0.875rem (14px)  - Secondary text
xs:  0.75rem  (12px)  - Tertiary text
```

#### Mobile Scaling (80% of desktop)
```
7xl: 3.6rem   (57.6px) → 3.5rem (56px)
6xl: 3rem     (48px)   → 3rem (48px)
5xl: 2.4rem   (38.4px) → 2.25rem (36px)
4xl: 1.8rem   (28.8px) → 1.75rem (28px)
3xl: 1.5rem   (24px)   → 1.5rem (24px)
2xl: 1.2rem   (19.2px) → 1.125rem (18px)
xl:  1rem     (16px)   → 1rem (16px)
lg:  0.9rem   (14.4px) → 0.875rem (14px)
base: 0.8rem  (12.8px) → 0.75rem (12px)
sm:  0.7rem   (11.2px) → 0.7rem (11px)
xs:  0.6rem   (9.6px)  → 0.6rem (9px)
```

#### Tablet Scaling (90% of desktop)
```
7xl: 4.05rem  (64.8px) → 4rem (64px)
6xl: 3.375rem (54px)   → 3.25rem (52px)
5xl: 2.7rem   (43.2px) → 2.625rem (42px)
4xl: 2.025rem (32.4px) → 2rem (32px)
3xl: 1.6875rem (27px)  → 1.625rem (26px)
2xl: 1.35rem  (21.6px) → 1.375rem (22px)
xl:  1.125rem (18px)   → 1.125rem (18px)
lg:  1rem     (16px)   → 1rem (16px)
base: 0.9rem  (14.4px) → 0.875rem (14px)
sm:  0.7875rem (12.6px) → 0.75rem (12px)
xs:  0.675rem (10.8px) → 0.625rem (10px)
```

### Responsive Typography Implementation

#### Using Tailwind Classes
```tsx
// Mobile: base (16px)
// Tablet: lg (18px)
// Desktop: xl (20px)
<h1 className="text-base md:text-lg lg:text-xl">
  Heading
</h1>

// Mobile: sm (14px)
// Tablet: base (16px)
// Desktop: lg (18px)
<p className="text-sm md:text-base lg:text-lg">
  Body text
</p>
```

#### Using CSS Media Queries
```css
/* Mobile: 16px */
h1 {
  font-size: 1rem;
}

/* Tablet: 18px */
@media (min-width: 768px) {
  h1 {
    font-size: 1.125rem;
  }
}

/* Desktop: 20px */
@media (min-width: 1024px) {
  h1 {
    font-size: 1.25rem;
  }
}
```

### Responsive Line Height

#### Line Height Scaling
```
Mobile:  1.5 (normal)
Tablet:  1.5 (normal)
Desktop: 1.5 (normal)
```

#### Implementation
```tsx
// Consistent line height across all sizes
<p className="leading-normal">
  Body text with consistent line height
</p>

// Tighter line height for headings
<h1 className="leading-tight">
  Heading with tight line height
</h1>

// Looser line height for readability
<p className="leading-relaxed">
  Long-form content with loose line height
</p>
```

### Responsive Font Weight

#### Font Weight Scaling
```
Mobile:  400 (normal)
Tablet:  400 (normal)
Desktop: 400 (normal)
```

#### Implementation
```tsx
// Consistent font weight across all sizes
<p className="font-normal">
  Body text with normal weight
</p>

// Bold headings
<h1 className="font-bold">
  Bold heading
</h1>

// Semibold emphasis
<p className="font-semibold">
  Emphasized text
</p>
```

---

## Responsive Layouts

### Container Widths

#### Responsive Container
```tsx
// Mobile: Full width with padding
// Tablet: 90% width
// Desktop: Max width
<Container className="w-full px-4 md:w-11/12 lg:max-w-4xl">
  {/* Content */}
</Container>
```

#### Container Sizes
```
Mobile:    100% - 32px (16px padding each side)
Tablet:    90% width
Desktop:   80% width, max 1200px
Wide:      80% width, max 1400px
Ultrawide: 80% width, max 1600px
```

### Grid Layouts

#### Responsive Grid
```tsx
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 3 columns
<Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</Grid>
```

#### Grid Gap Scaling
```tsx
// Mobile: 4px gap
// Tablet: 6px gap
// Desktop: 8px gap
<Grid className="gap-1 md:gap-1.5 lg:gap-2">
  {/* Grid items */}
</Grid>
```

### Flexbox Layouts

#### Responsive Flex Direction
```tsx
// Mobile: Column (vertical)
// Desktop: Row (horizontal)
<Stack className="flex-col lg:flex-row gap-4">
  <Sidebar className="lg:w-1/4" />
  <Main className="lg:flex-1" />
</Stack>
```

#### Responsive Flex Wrap
```tsx
// Mobile: Wrap items
// Desktop: No wrap
<div className="flex flex-wrap lg:flex-nowrap gap-4">
  {items.map(item => (
    <Item key={item.id}>{item.name}</Item>
  ))}
</div>
```

### Responsive Padding & Margin

#### Padding Scaling
```tsx
// Mobile: 1rem (16px)
// Tablet: 1.5rem (24px)
// Desktop: 2rem (32px)
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>
```

#### Margin Scaling
```tsx
// Mobile: 1rem (16px)
// Tablet: 1.5rem (24px)
// Desktop: 2rem (32px)
<div className="m-4 md:m-6 lg:m-8">
  {/* Content */}
</div>
```

---

## Responsive Images

### Image Sizing

#### Responsive Image Width
```tsx
// Mobile: 100% width
// Tablet: 90% width
// Desktop: 80% width
<img
  src="image.jpg"
  alt="Description"
  className="w-full md:w-11/12 lg:w-4/5"
/>
```

#### Responsive Image Height
```tsx
// Maintain aspect ratio
<img
  src="image.jpg"
  alt="Description"
  className="w-full h-auto"
/>
```

### Responsive Images with srcset

#### Multiple Image Sizes
```tsx
<img
  src="image-medium.jpg"
  srcSet="
    image-small.jpg 320w,
    image-medium.jpg 768w,
    image-large.jpg 1024w,
    image-xlarge.jpg 1536w
  "
  sizes="
    (max-width: 320px) 100vw,
    (max-width: 768px) 90vw,
    (max-width: 1024px) 80vw,
    1200px
  "
  alt="Description"
/>
```

### Picture Element

#### Multiple Image Formats
```tsx
<picture>
  <source
    media="(min-width: 1024px)"
    srcSet="image-desktop.jpg"
  />
  <source
    media="(min-width: 768px)"
    srcSet="image-tablet.jpg"
  />
  <img
    src="image-mobile.jpg"
    alt="Description"
  />
</picture>
```

---

## Testing Responsive Design

### Device Testing

#### Real Devices
- Test on actual mobile devices
- Test on tablets
- Test on desktops
- Test on different browsers

#### Browser DevTools
- Chrome DevTools
- Firefox Developer Tools
- Safari Web Inspector
- Edge Developer Tools

### Breakpoint Testing

#### Test All Breakpoints
- [ ] 320px (Mobile)
- [ ] 480px (Large mobile)
- [ ] 768px (Tablet)
- [ ] 1024px (Desktop)
- [ ] 1280px (Wide)
- [ ] 1536px (Ultrawide)

### Responsive Testing Checklist

#### Layout
- [ ] Layout adapts to all breakpoints
- [ ] No horizontal scrolling
- [ ] Content is readable at all sizes
- [ ] Images scale properly
- [ ] Spacing is appropriate

#### Typography
- [ ] Font sizes scale properly
- [ ] Line heights are readable
- [ ] Text is not too small on mobile
- [ ] Text is not too large on desktop
- [ ] Line length is appropriate

#### Touch Targets
- [ ] Buttons are 44x44px minimum
- [ ] Links are 44x44px minimum
- [ ] Form fields are 44px tall
- [ ] Spacing between targets is adequate
- [ ] No overlapping targets

#### Performance
- [ ] Page loads quickly on mobile
- [ ] Images are optimized
- [ ] CSS is minified
- [ ] JavaScript is optimized
- [ ] No layout shifts

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader works
- [ ] Focus indicators visible
- [ ] Color contrast adequate
- [ ] Touch targets accessible

### Testing Tools

#### Browser DevTools
- Chrome DevTools: F12
- Firefox Developer Tools: F12
- Safari Web Inspector: Cmd+Option+I
- Edge Developer Tools: F12

#### Responsive Testing Tools
- [Responsively App](https://responsively.app/)
- [BrowserStack](https://www.browserstack.com/)
- [LambdaTest](https://www.lambdatest.com/)
- [Sauce Labs](https://saucelabs.com/)

#### Performance Testing
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## Best Practices

### Do's
- ✅ Start with mobile design
- ✅ Use mobile-first media queries
- ✅ Test on real devices
- ✅ Use responsive images
- ✅ Optimize for performance
- ✅ Maintain content hierarchy
- ✅ Use flexible layouts
- ✅ Test all breakpoints

### Don'ts
- ❌ Design desktop first
- ❌ Hide features on mobile
- ❌ Use fixed widths
- ❌ Forget mobile testing
- ❌ Use heavy images
- ❌ Ignore performance
- ❌ Use desktop-only features
- ❌ Forget touch targets

---

## Resources

### External References
- [MDN - Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google - Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Tailwind - Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Web.dev - Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)

### Tools
- [Responsively App](https://responsively.app/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Firefox Developer Tools](https://developer.mozilla.org/en-US/docs/Tools)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)

---

## Questions & Support

For responsive design questions:

1. Check this guide
2. Review Tailwind responsive documentation
3. Test with browser DevTools
4. Ask in the design system team channel
5. Create an issue in the repository
