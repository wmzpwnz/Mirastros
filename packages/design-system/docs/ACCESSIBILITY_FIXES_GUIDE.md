# Accessibility Fixes Guide

## Overview

This guide provides step-by-step instructions for fixing common accessibility issues found during audits. All fixes must maintain WCAG 2.1 AA compliance.

**Validates: Requirements 8.1, 8.2, 8.3**

## Common Issues and Fixes

### Issue 1: Missing ARIA Labels

**Problem**: Interactive elements don't have accessible names.

**Impact**: Screen reader users can't identify the purpose of buttons, links, or form fields.

**Fix**:

```tsx
// ❌ Before
<button>×</button>

// ✅ After
<button aria-label="Close dialog">×</button>
```

**Checklist**:
- [ ] All buttons have text or aria-label
- [ ] All links have descriptive text
- [ ] All form inputs have associated labels
- [ ] All icons have aria-label if meaningful

### Issue 2: Missing Form Labels

**Problem**: Form inputs don't have associated labels.

**Impact**: Screen reader users can't identify what each form field is for.

**Fix**:

```tsx
// ❌ Before
<input type="email" placeholder="Enter email" />

// ✅ After
<label htmlFor="email">Email Address:</label>
<input id="email" type="email" placeholder="Enter email" />
```

**Checklist**:
- [ ] All inputs have associated labels
- [ ] Labels use htmlFor attribute
- [ ] Placeholder is not substitute for label
- [ ] Required fields are indicated

### Issue 3: Keyboard Navigation Not Working

**Problem**: Interactive elements can't be accessed via keyboard.

**Impact**: Keyboard-only users can't interact with the application.

**Fix**:

```tsx
// ❌ Before
<div onClick={handleClick}>Click me</div>

// ✅ After
<button onClick={handleClick}>Click me</button>
// Or if div is necessary:
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</div>
```

**Checklist**:
- [ ] All interactive elements are in tab order
- [ ] Tab order is logical
- [ ] Enter key activates buttons
- [ ] Space key activates buttons
- [ ] Escape key closes modals

### Issue 4: Focus Indicators Not Visible

**Problem**: Users can't see which element has focus.

**Impact**: Keyboard users can't navigate effectively.

**Fix**:

```tsx
// ✅ Add focus styles
button:focus {
  outline: 2px solid #ffc107;
  outline-offset: 2px;
}

// Or use Tailwind
<button className="focus:outline-2 focus:outline-gold-500 focus:outline-offset-2">
  Click me
</button>
```

**Checklist**:
- [ ] All interactive elements have visible focus indicators
- [ ] Focus indicators have sufficient contrast (3:1)
- [ ] Focus indicators are not removed
- [ ] Focus indicators are visible on all browsers

### Issue 5: Color Contrast Too Low

**Problem**: Text doesn't have sufficient contrast with background.

**Impact**: Users with low vision can't read the text.

**Fix**:

```tsx
// ❌ Before (2:1 contrast)
<div style={{ color: '#999', backgroundColor: '#fff' }}>
  Low contrast text
</div>

// ✅ After (4.5:1 contrast)
<div style={{ color: '#333', backgroundColor: '#fff' }}>
  High contrast text
</div>
```

**Checklist**:
- [ ] Normal text has 4.5:1 contrast
- [ ] Large text (18pt+) has 3:1 contrast
- [ ] UI components have 3:1 contrast
- [ ] Verify with contrast checker tool

### Issue 6: Missing Error Messages

**Problem**: Form validation errors aren't announced to screen readers.

**Impact**: Screen reader users don't know what went wrong.

**Fix**:

```tsx
// ❌ Before
<input type="email" value={email} onChange={handleChange} />
{error && <span style={{ color: 'red' }}>Invalid email</span>}

// ✅ After
<input
  type="email"
  value={email}
  onChange={handleChange}
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && (
  <span id="email-error" role="alert" style={{ color: 'red' }}>
    Invalid email
  </span>
)}
```

**Checklist**:
- [ ] Error messages are associated with inputs
- [ ] Error messages use aria-describedby
- [ ] Error messages have role="alert"
- [ ] Error messages are announced immediately

### Issue 7: Modal Focus Not Trapped

**Problem**: Tab key can move focus outside modal.

**Impact**: Keyboard users can interact with background content.

**Fix**:

```tsx
// ✅ Implement focus trap
const Modal = ({ isOpen, onClose, children }) => {
  const firstButtonRef = useRef(null);
  const lastButtonRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstButtonRef.current) {
          lastButtonRef.current?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastButtonRef.current) {
          firstButtonRef.current?.focus();
          e.preventDefault();
        }
      }
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div role="dialog" onKeyDown={handleKeyDown}>
      <button ref={firstButtonRef}>First</button>
      {children}
      <button ref={lastButtonRef}>Last</button>
    </div>
  );
};
```

**Checklist**:
- [ ] Focus stays within modal
- [ ] Tab wraps to first element
- [ ] Shift+Tab wraps to last element
- [ ] Escape key closes modal
- [ ] Focus is restored after closing

### Issue 8: Missing ARIA Roles

**Problem**: Complex components don't have proper ARIA roles.

**Impact**: Screen readers can't understand component structure.

**Fix**:

```tsx
// ❌ Before
<div>
  <div onClick={() => setOpen(!open)}>Menu</div>
  <div>{open && <div>Item 1</div>}</div>
</div>

// ✅ After
<div role="menubar">
  <button
    role="menuitem"
    aria-expanded={open}
    onClick={() => setOpen(!open)}
  >
    Menu
  </button>
  {open && (
    <div role="menu">
      <div role="menuitem">Item 1</div>
    </div>
  )}
</div>
```

**Checklist**:
- [ ] Modals have role="dialog"
- [ ] Alerts have role="alert"
- [ ] Tabs have role="tablist"
- [ ] Tab panels have role="tabpanel"
- [ ] Accordions have role="region"

### Issue 9: Images Missing Alt Text

**Problem**: Images don't have alt text.

**Impact**: Screen reader users can't understand images.

**Fix**:

```tsx
// ❌ Before
<img src="avatar.jpg" />

// ✅ After (descriptive)
<img src="avatar.jpg" alt="User profile picture" />

// ✅ After (decorative)
<img src="divider.jpg" alt="" aria-hidden="true" />
```

**Checklist**:
- [ ] All images have alt text
- [ ] Alt text is descriptive
- [ ] Decorative images have empty alt text
- [ ] Complex images have long descriptions

### Issue 10: Semantic HTML Not Used

**Problem**: Components use div instead of semantic elements.

**Impact**: Screen readers can't understand page structure.

**Fix**:

```tsx
// ❌ Before
<div>
  <div>Main Title</div>
  <div>Content here</div>
</div>

// ✅ After
<main>
  <h1>Main Title</h1>
  <p>Content here</p>
</main>
```

**Checklist**:
- [ ] Use `<button>` instead of `<div role="button">`
- [ ] Use `<a>` instead of `<div role="link">`
- [ ] Use `<nav>` for navigation
- [ ] Use `<main>` for main content
- [ ] Use `<header>` for page header
- [ ] Use `<footer>` for page footer
- [ ] Use `<section>` for sections
- [ ] Use `<article>` for articles

## Component-Specific Fixes

### Button Component

**Common Issues**:
- Missing aria-label for icon-only buttons
- No focus indicator
- Disabled state not announced

**Fixes**:

```tsx
// ✅ Icon-only button
<button aria-label="Close">×</button>

// ✅ With focus styles
<button className="focus:outline-2 focus:outline-gold-500">
  Click me
</button>

// ✅ Disabled state
<button disabled aria-disabled="true">
  Disabled
</button>
```

### Input Component

**Common Issues**:
- Missing associated label
- No error message association
- Placeholder used as label

**Fixes**:

```tsx
// ✅ Associated label
<label htmlFor="email">Email:</label>
<input id="email" type="email" />

// ✅ Error message
<input
  aria-invalid={!!error}
  aria-describedby={error ? 'error-id' : undefined}
/>
<span id="error-id" role="alert">
  {error}
</span>

// ✅ Required indicator
<label htmlFor="name">
  Name <span aria-label="required">*</span>
</label>
<input id="name" required />
```

### Modal Component

**Common Issues**:
- No focus trap
- No focus restoration
- Missing dialog role
- Escape key doesn't close

**Fixes**:

```tsx
// ✅ Complete modal
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-modal="true"
  onKeyDown={(e) => {
    if (e.key === 'Escape') onClose();
  }}
>
  <h2 id="modal-title">Modal Title</h2>
  <button onClick={onClose}>Close</button>
</div>
```

### Form Component

**Common Issues**:
- No fieldset for grouped inputs
- No legend for fieldset
- No error message association

**Fixes**:

```tsx
// ✅ Grouped form inputs
<fieldset>
  <legend>Select an option:</legend>
  <label>
    <input type="radio" name="option" value="1" />
    Option 1
  </label>
  <label>
    <input type="radio" name="option" value="2" />
    Option 2
  </label>
</fieldset>
```

## Testing Fixes

### Automated Testing

```bash
# Run accessibility tests
npm run test -- Accessibility.test.tsx

# Run validation
npm run validate-accessibility

# Run audit
npm run accessibility-audit
```

### Manual Testing

1. **Keyboard Navigation**
   - Tab through all elements
   - Verify focus order is logical
   - Verify focus indicators are visible

2. **Screen Reader Testing**
   - Enable screen reader (VoiceOver, NVDA, JAWS)
   - Navigate through page
   - Verify all content is announced

3. **Color Contrast**
   - Use contrast checker tool
   - Verify 4.5:1 for normal text
   - Verify 3:1 for large text

4. **Focus Management**
   - Tab to modal
   - Verify Tab stays within modal
   - Press Escape to close
   - Verify focus returns to trigger

## Verification Checklist

Before marking an issue as fixed:

- [ ] Automated tests pass
- [ ] Manual keyboard navigation works
- [ ] Screen reader announces content correctly
- [ ] Color contrast is sufficient
- [ ] Focus indicators are visible
- [ ] ARIA attributes are correct
- [ ] Semantic HTML is used
- [ ] Error messages are associated
- [ ] Focus is managed correctly
- [ ] Escape key works in modals

## Resources

- **WCAG 2.1 Techniques**: https://www.w3.org/WAI/WCAG21/Techniques/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility

## Issue Tracking

When fixing accessibility issues:

1. Create issue with component name and problem
2. Reference WCAG criterion
3. Implement fix
4. Run tests to verify
5. Update documentation
6. Close issue

## Continuous Improvement

- Review accessibility audit reports regularly
- Fix issues as they're discovered
- Test with real users with disabilities
- Stay updated with WCAG guidelines
- Share knowledge with team
