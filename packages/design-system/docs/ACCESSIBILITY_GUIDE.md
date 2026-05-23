# Accessibility Guide

## Overview

This guide documents WCAG 2.1 AA requirements, keyboard navigation patterns, screen reader testing, and color contrast requirements for the Mirastros design system.

## Table of Contents

1. [WCAG 2.1 AA Requirements](#wcag-21-aa-requirements)
2. [Keyboard Navigation Patterns](#keyboard-navigation-patterns)
3. [Screen Reader Testing](#screen-reader-testing)
4. [Color Contrast Requirements](#color-contrast-requirements)
5. [ARIA Patterns](#aria-patterns)
6. [Testing Checklist](#testing-checklist)

---

## WCAG 2.1 AA Requirements

### Overview

WCAG 2.1 Level AA is the standard accessibility level for web applications. It includes:

- **Perceivable**: Information must be perceivable to all users
- **Operable**: Users must be able to operate the interface
- **Understandable**: Information and operation must be understandable
- **Robust**: Content must be robust enough for assistive technologies

### Perceivable

#### 1.1 Text Alternatives
- **Requirement**: Provide text alternatives for all non-text content
- **Implementation**:
  - Use `alt` attribute for images
  - Use `aria-label` for icon-only buttons
  - Use `aria-describedby` for complex graphics
  - Provide text descriptions for charts and diagrams

**Example:**
```tsx
<img src="chart.png" alt="Monthly revenue chart showing 20% growth" />
<button aria-label="Close dialog">×</button>
```

#### 1.3 Adaptable
- **Requirement**: Content must be adaptable to different presentations
- **Implementation**:
  - Use semantic HTML elements
  - Use proper heading hierarchy
  - Use lists for list content
  - Use tables for tabular data
  - Use fieldsets for form groups

**Example:**
```tsx
<nav>
  <h1>Main Navigation</h1>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/services">Services</a></li>
  </ul>
</nav>
```

#### 1.4 Distinguishable
- **Requirement**: Make it easier for users to see and hear content
- **Implementation**:
  - Maintain 4.5:1 contrast ratio for text
  - Maintain 3:1 contrast ratio for UI components
  - Don't rely on color alone for meaning
  - Support text resizing up to 200%
  - Avoid flashing content (more than 3 flashes per second)

**Example:**
```tsx
// Good: Uses color + icon + text
<div className="error">
  <ErrorIcon />
  <span>This field is required</span>
</div>

// Bad: Uses color only
<div className="error">This field is required</div>
```

### Operable

#### 2.1 Keyboard Accessible
- **Requirement**: All functionality must be keyboard accessible
- **Implementation**:
  - All interactive elements must be focusable
  - Tab order must be logical
  - Keyboard shortcuts must be documented
  - No keyboard traps
  - Support standard keyboard patterns

**Example:**
```tsx
<button onClick={handleClick}>
  Click me
</button>

// Keyboard support:
// - Tab: Focus button
// - Enter/Space: Activate button
```

#### 2.4 Navigable
- **Requirement**: Provide ways to help users navigate
- **Implementation**:
  - Use descriptive page titles
  - Provide skip links
  - Use breadcrumbs for navigation
  - Show focus indicators
  - Maintain logical tab order

**Example:**
```tsx
<head>
  <title>Services - Mirastros</title>
</head>
<body>
  <a href="#main" className="skip-link">Skip to main content</a>
  <nav>Navigation</nav>
  <main id="main">Main content</main>
</body>
```

### Understandable

#### 3.1 Readable
- **Requirement**: Make text readable and understandable
- **Implementation**:
  - Use clear, simple language
  - Define abbreviations and acronyms
  - Use consistent terminology
  - Avoid jargon when possible
  - Use appropriate font sizes

**Example:**
```tsx
// Good: Clear and simple
<p>Save your changes before closing</p>

// Bad: Unclear and jargon-heavy
<p>Persist your modifications prior to terminating the session</p>
```

#### 3.2 Predictable
- **Requirement**: Make web pages appear and operate in predictable ways
- **Implementation**:
  - Consistent navigation
  - Consistent component behavior
  - No unexpected context changes
  - Clear form submission behavior
  - Predictable link behavior

**Example:**
```tsx
// Good: Predictable behavior
<button onClick={handleSave}>Save</button>

// Bad: Unexpected behavior
<button onClick={() => window.location.href = '/other-page'}>
  Save
</button>
```

#### 3.3 Input Assistance
- **Requirement**: Help users avoid and correct mistakes
- **Implementation**:
  - Identify form fields with errors
  - Provide error messages
  - Suggest corrections
  - Confirm before destructive actions
  - Allow undo for important actions

**Example:**
```tsx
<FormGroup>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-error"
  />
  {error && (
    <span id="email-error" className="error">
      Please enter a valid email address
    </span>
  )}
</FormGroup>
```

### Robust

#### 4.1 Compatible
- **Requirement**: Maximize compatibility with assistive technologies
- **Implementation**:
  - Use valid HTML
  - Use proper ARIA attributes
  - Use semantic HTML elements
  - Test with assistive technologies
  - Maintain proper element nesting

**Example:**
```tsx
// Good: Valid HTML with ARIA
<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  onClick={handleClose}
>
  ×
</button>

// Bad: Invalid HTML
<div onClick={handleClose} role="button">
  ×
</div>
```

---

## Keyboard Navigation Patterns

### Tab Navigation

#### Tab Order
- Tab order should follow visual order
- Use `tabIndex` only when necessary
- Avoid `tabIndex > 0`
- Test tab order with keyboard only

**Example:**
```tsx
<form>
  <input placeholder="First name" />
  <input placeholder="Last name" />
  <button>Submit</button>
</form>

// Tab order: First name → Last name → Submit
```

#### Skip Links
- Provide skip link to main content
- Skip link should be first focusable element
- Skip link should be visible on focus

**Example:**
```tsx
<a href="#main" className="skip-link">
  Skip to main content
</a>
<nav>Navigation</nav>
<main id="main">Main content</main>
```

### Focus Management

#### Focus Indicators
- Focus indicator must be visible
- Focus indicator must have 3:1 contrast
- Focus indicator must be at least 2px
- Don't remove focus outline

**Example:**
```css
button:focus {
  outline: 2px solid #FFD700;
  outline-offset: 2px;
}
```

#### Focus Trap
- Modal should trap focus inside
- Focus should cycle through focusable elements
- ESC should close modal and return focus

**Example:**
```tsx
<Modal isOpen={isOpen} onClose={handleClose}>
  <button>First button</button>
  <button>Second button</button>
  <button>Last button</button>
</Modal>

// Tab cycles through buttons, ESC closes modal
```

### Keyboard Shortcuts

#### Standard Patterns
- **Enter/Space**: Activate button
- **Tab**: Move to next element
- **Shift+Tab**: Move to previous element
- **Arrow Keys**: Navigate within components
- **ESC**: Close modal/menu
- **Enter**: Submit form

#### Custom Shortcuts
- Document all custom shortcuts
- Provide keyboard shortcut help
- Use standard key combinations
- Avoid conflicts with browser shortcuts

**Example:**
```tsx
<button
  onClick={handleSave}
  title="Save (Ctrl+S)"
  aria-label="Save changes (Ctrl+S)"
>
  Save
</button>
```

### Component-Specific Patterns

#### Button
- **Enter/Space**: Activate button
- **Tab**: Move focus to next element

#### Link
- **Enter**: Navigate to link
- **Tab**: Move focus to next element

#### Menu
- **Arrow Down**: Move to next item
- **Arrow Up**: Move to previous item
- **Enter**: Activate item
- **ESC**: Close menu

#### Dialog
- **Tab**: Move focus within dialog
- **Shift+Tab**: Move focus backward
- **ESC**: Close dialog
- **Enter**: Confirm action

#### Form
- **Tab**: Move to next field
- **Shift+Tab**: Move to previous field
- **Enter**: Submit form
- **Arrow Keys**: Select radio/checkbox options

---

## Screen Reader Testing

### Screen Readers

#### NVDA (Windows)
- Free and open-source
- Most commonly used on Windows
- Good for testing

**Installation:**
```
https://www.nvaccess.org/download/
```

#### JAWS (Windows)
- Commercial screen reader
- Most feature-rich
- Industry standard

**Installation:**
```
https://www.freedomscientific.com/products/software/jaws/
```

#### VoiceOver (macOS/iOS)
- Built-in to macOS and iOS
- Good for testing on Apple devices
- Enable: System Preferences → Accessibility → VoiceOver

#### TalkBack (Android)
- Built-in to Android
- Good for testing on Android devices
- Enable: Settings → Accessibility → TalkBack

### Testing Procedures

#### 1. Page Structure
- **Test**: Navigate page with screen reader
- **Expected**: Headings, landmarks, and content are announced clearly
- **Check**:
  - Proper heading hierarchy
  - Semantic HTML elements
  - Landmark regions (nav, main, aside)

**Example:**
```
Screen reader announces:
"Navigation, list with 3 items"
"Main content region"
"Heading level 1: Services"
"Paragraph: Explore our services"
```

#### 2. Form Fields
- **Test**: Navigate form with screen reader
- **Expected**: Labels, required indicators, and errors are announced
- **Check**:
  - Labels associated with inputs
  - Required fields indicated
  - Error messages announced
  - Helper text available

**Example:**
```
Screen reader announces:
"Email, edit text, required"
"Invalid email format"
```

#### 3. Interactive Elements
- **Test**: Interact with buttons, links, and menus
- **Expected**: Actions and state changes are announced
- **Check**:
  - Button purpose is clear
  - Link destination is clear
  - State changes are announced
  - Loading states are announced

**Example:**
```
Screen reader announces:
"Save button"
"Menu button, expanded"
"Loading, please wait"
```

#### 4. Dynamic Content
- **Test**: Update content dynamically
- **Expected**: Changes are announced to screen reader
- **Check**:
  - Use `aria-live` for updates
  - Use `aria-busy` for loading
  - Announce errors and confirmations
  - Update page title for page changes

**Example:**
```tsx
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading...' : content}
</div>
```

### Common Issues

#### Missing Labels
- **Issue**: Form fields without labels
- **Fix**: Add `<label>` element or `aria-label`

#### Unclear Link Text
- **Issue**: Links with text like "Click here"
- **Fix**: Use descriptive link text

#### Missing Alt Text
- **Issue**: Images without alt text
- **Fix**: Add descriptive alt text

#### Color-Only Information
- **Issue**: Information conveyed by color only
- **Fix**: Add icons, text, or patterns

#### Missing ARIA
- **Issue**: Custom components without ARIA
- **Fix**: Add appropriate ARIA attributes

---

## Color Contrast Requirements

### Contrast Ratios

#### WCAG AA Standards
- **Normal Text**: 4.5:1 minimum
- **Large Text** (18pt+ or 14pt+ bold): 3:1 minimum
- **UI Components**: 3:1 minimum
- **Graphical Elements**: 3:1 minimum

#### WCAG AAA Standards (Enhanced)
- **Normal Text**: 7:1 minimum
- **Large Text**: 4.5:1 minimum
- **UI Components**: 4.5:1 minimum

### Approved Color Combinations

#### Text on Backgrounds

| Foreground | Background | Contrast | Status |
|-----------|-----------|----------|--------|
| #FFFFFF | #050505 | 21:1 | ✅ AA & AAA |
| #FFFFFF | #0a0a0a | 19.5:1 | ✅ AA & AAA |
| #C0C0C0 | #050505 | 7.5:1 | ✅ AA & AAA |
| #FFD700 | #050505 | 8.6:1 | ✅ AA & AAA |
| #40E0D0 | #050505 | 8.2:1 | ✅ AA & AAA |
| #FFFFFF | #EF4444 | 3.9:1 | ⚠️ AA only |
| #FFFFFF | #10B981 | 4.5:1 | ✅ AA & AAA |
| #FFFFFF | #F59E0B | 3.5:1 | ⚠️ AA only |
| #FFFFFF | #3B82F6 | 3.9:1 | ⚠️ AA only |

#### UI Components

| Foreground | Background | Contrast | Status |
|-----------|-----------|----------|--------|
| #FFD700 | #050505 | 8.6:1 | ✅ AA & AAA |
| #40E0D0 | #050505 | 8.2:1 | ✅ AA & AAA |
| #EF4444 | #050505 | 5.2:1 | ✅ AA & AAA |
| #10B981 | #050505 | 6.3:1 | ✅ AA & AAA |

### Testing Contrast

#### Tools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Contrast Ratio**: https://contrast-ratio.com/
- **Accessible Colors**: https://accessible-colors.com/
- **Color Blindness Simulator**: https://www.color-blindness.com/coblis-color-blindness-simulator/

#### Process
1. Select foreground color
2. Select background color
3. Check contrast ratio
4. Verify meets WCAG AA (4.5:1 for text)
5. Test with color blindness simulator

### Color-Blind Friendly Design

#### Types of Color Blindness
- **Protanopia** (Red-blind): ~1% of males
- **Deuteranopia** (Green-blind): ~1% of males
- **Tritanopia** (Blue-yellow blind): ~0.001% of population
- **Achromatopsia** (Complete color blindness): ~0.003% of population

#### Design Strategies
- **Don't rely on color alone**: Use icons, patterns, or text
- **Use sufficient contrast**: Maintain 4.5:1 ratio
- **Test with simulators**: Use color blindness simulators
- **Provide alternatives**: Use text labels and icons

**Example:**
```tsx
// Good: Uses color + icon + text
<div className="status-error">
  <ErrorIcon />
  <span>Error: Invalid input</span>
</div>

// Bad: Uses color only
<div className="status-error">Invalid input</div>
```

#### Status Indicators
- **Success**: Green + checkmark icon + "Success" text
- **Error**: Red + X icon + "Error" text
- **Warning**: Orange + warning icon + "Warning" text
- **Info**: Blue + info icon + "Info" text

---

## ARIA Patterns

### ARIA Attributes

#### aria-label
- Provides accessible name for element
- Use when visible label not available
- Use for icon-only buttons

**Example:**
```tsx
<button aria-label="Close dialog">×</button>
<button aria-label="Search">🔍</button>
```

#### aria-labelledby
- Links element to another element that labels it
- Use for complex components
- Use for headings that label sections

**Example:**
```tsx
<h2 id="dialog-title">Confirm Action</h2>
<div role="dialog" aria-labelledby="dialog-title">
  Are you sure?
</div>
```

#### aria-describedby
- Provides additional description
- Use for error messages
- Use for helper text

**Example:**
```tsx
<input
  aria-describedby="email-error"
  type="email"
/>
<span id="email-error">Please enter a valid email</span>
```

#### aria-live
- Announces dynamic content changes
- Values: `polite`, `assertive`, `off`
- Use for notifications and updates

**Example:**
```tsx
<div aria-live="polite">
  {message}
</div>
```

#### aria-busy
- Indicates element is loading
- Use during async operations
- Announce with aria-live

**Example:**
```tsx
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? 'Loading...' : content}
</div>
```

#### aria-hidden
- Hides element from screen readers
- Use for decorative elements
- Use for duplicate content

**Example:**
```tsx
<span aria-hidden="true">→</span>
<span className="sr-only">Next page</span>
```

#### aria-expanded
- Indicates if element is expanded
- Use for collapsible sections
- Use for menus

**Example:**
```tsx
<button
  aria-expanded={isOpen}
  onClick={toggleMenu}
>
  Menu
</button>
```

#### aria-pressed
- Indicates if button is pressed
- Use for toggle buttons
- Use for state buttons

**Example:**
```tsx
<button
  aria-pressed={isBold}
  onClick={toggleBold}
>
  Bold
</button>
```

#### aria-disabled
- Indicates if element is disabled
- Use with disabled attribute
- Announce to screen readers

**Example:**
```tsx
<button disabled aria-disabled="true">
  Save
</button>
```

### ARIA Roles

#### button
- Use for clickable elements
- Keyboard: Enter/Space to activate
- Use `<button>` element when possible

**Example:**
```tsx
<div role="button" onClick={handleClick} tabIndex={0}>
  Click me
</div>
```

#### link
- Use for navigation
- Keyboard: Enter to navigate
- Use `<a>` element when possible

**Example:**
```tsx
<div role="link" onClick={handleNavigate} tabIndex={0}>
  Go to page
</div>
```

#### navigation
- Use for navigation regions
- Use `<nav>` element when possible
- Announce to screen readers

**Example:**
```tsx
<nav role="navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>
```

#### main
- Use for main content region
- Use `<main>` element when possible
- Only one per page

**Example:**
```tsx
<main role="main">
  Main content
</main>
```

#### dialog
- Use for modal dialogs
- Keyboard: ESC to close
- Manage focus

**Example:**
```tsx
<div role="dialog" aria-labelledby="title">
  <h2 id="title">Dialog Title</h2>
  Content
</div>
```

#### alert
- Use for important messages
- Announce immediately
- Use aria-live="assertive"

**Example:**
```tsx
<div role="alert" aria-live="assertive">
  Error: Please fix the form
</div>
```

#### tablist
- Use for tab components
- Keyboard: Arrow keys to navigate
- Use role="tab" for tab buttons

**Example:**
```tsx
<div role="tablist">
  <button role="tab" aria-selected={true}>Tab 1</button>
  <button role="tab" aria-selected={false}>Tab 2</button>
</div>
```

---

## Testing Checklist

### Automated Testing
- [ ] Run axe accessibility scanner
- [ ] Run WAVE accessibility checker
- [ ] Run Lighthouse accessibility audit
- [ ] Check color contrast with WebAIM
- [ ] Test with color blindness simulator

### Keyboard Testing
- [ ] Tab through all interactive elements
- [ ] Verify tab order is logical
- [ ] Test Enter/Space on buttons
- [ ] Test Arrow keys in menus
- [ ] Test ESC to close modals
- [ ] Verify focus indicators visible
- [ ] Test with keyboard only (no mouse)

### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS)
- [ ] Test with TalkBack (Android)
- [ ] Verify page structure announced
- [ ] Verify form labels announced
- [ ] Verify errors announced
- [ ] Verify dynamic content announced

### Visual Testing
- [ ] Test with 200% zoom
- [ ] Test with high contrast mode
- [ ] Test with color blindness simulator
- [ ] Verify focus indicators visible
- [ ] Verify text readable
- [ ] Verify images have alt text

### Content Testing
- [ ] Verify clear, simple language
- [ ] Verify consistent terminology
- [ ] Verify abbreviations defined
- [ ] Verify links descriptive
- [ ] Verify form instructions clear
- [ ] Verify error messages helpful

### Mobile Testing
- [ ] Test with screen reader on mobile
- [ ] Verify touch targets 44x44px
- [ ] Verify responsive layout
- [ ] Verify keyboard accessible
- [ ] Test with mobile browser zoom

---

## Resources

### External References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM - Web Accessibility](https://webaim.org/)
- [Inclusive Components](https://inclusive-components.design/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)

### Screen Readers
- [NVDA](https://www.nvaccess.org/)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/)
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677)

---

## Questions & Support

For accessibility questions or issues:

1. Check this guide
2. Review WCAG 2.1 guidelines
3. Test with accessibility tools
4. Ask in the design system team channel
5. Create an issue in the repository
