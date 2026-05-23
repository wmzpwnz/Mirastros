# Accessibility Testing Guide

## Overview

This guide provides comprehensive instructions for manual and automated accessibility testing of the Mirastros design system components. All components must meet WCAG 2.1 AA standards.

**Validates: Requirements 8.1, 8.2, 8.3**

## Automated Testing

### Running Accessibility Audit

```bash
# Run automated accessibility audit
npm run accessibility-audit

# This generates:
# - JSON report: accessibility-reports/accessibility-report-[timestamp].json
# - HTML report: accessibility-reports/accessibility-report-[timestamp].html
```

### Storybook Accessibility Panel

1. Open Storybook: `npm run storybook`
2. Navigate to any component story
3. Click the "Accessibility" tab in the bottom panel
4. Review violations and passes
5. Fix any violations before merging

### Automated Tools

- **axe DevTools**: Browser extension for automated scanning
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Chrome DevTools built-in accessibility audit

## Manual Testing

### Screen Reader Testing

#### macOS (VoiceOver)

1. **Enable VoiceOver**: Cmd + F5
2. **Navigate**: VO + Arrow Keys
3. **Interact**: VO + Space
4. **Read all**: VO + A
5. **Disable**: Cmd + F5

**Test Checklist:**
- [ ] All interactive elements are announced
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced
- [ ] Navigation structure is clear
- [ ] Headings are properly hierarchical

#### Windows (NVDA)

1. **Download**: https://www.nvaccess.org/
2. **Enable**: Run NVDA
3. **Navigate**: Arrow Keys
4. **Interact**: Enter or Space
5. **Read all**: Ctrl + A

**Test Checklist:**
- [ ] All interactive elements are announced
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced
- [ ] Navigation structure is clear
- [ ] Headings are properly hierarchical

#### Windows (JAWS)

1. **Download**: https://www.freedomscientific.com/products/software/jaws/
2. **Enable**: Run JAWS
3. **Navigate**: Arrow Keys
4. **Interact**: Enter or Space
5. **Read all**: Insert + A

**Test Checklist:**
- [ ] All interactive elements are announced
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced
- [ ] Navigation structure is clear
- [ ] Headings are properly hierarchical

### Keyboard Navigation Testing

**Test Checklist:**
- [ ] All interactive elements are reachable via Tab key
- [ ] Tab order is logical and intuitive
- [ ] Focus indicators are visible
- [ ] Escape key closes modals and dropdowns
- [ ] Enter key activates buttons
- [ ] Space key activates buttons and checkboxes
- [ ] Arrow keys navigate select/dropdown options
- [ ] Arrow keys navigate tabs
- [ ] Arrow keys navigate accordion items

**Testing Steps:**

1. **Tab Navigation**
   ```
   Press Tab repeatedly to navigate through all interactive elements
   Verify focus order is logical (left-to-right, top-to-bottom)
   ```

2. **Shift+Tab Navigation**
   ```
   Press Shift+Tab to navigate backwards
   Verify reverse order is correct
   ```

3. **Focus Indicators**
   ```
   Verify each focused element has a visible focus indicator
   Focus indicator should have sufficient contrast (3:1 minimum)
   ```

4. **Modal/Dialog Navigation**
   ```
   Open a modal
   Verify Tab key stays within modal (focus trap)
   Verify Escape key closes modal
   Verify focus returns to trigger element after closing
   ```

5. **Form Navigation**
   ```
   Tab through form fields
   Verify labels are associated with inputs
   Verify error messages are announced
   Verify required fields are indicated
   ```

### Color Contrast Testing

**WCAG AA Requirements:**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Testing Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Lighthouse: Chrome DevTools > Lighthouse > Accessibility
- axe DevTools: Browser extension

**Test Checklist:**
- [ ] All text meets 4.5:1 contrast ratio
- [ ] All large text meets 3:1 contrast ratio
- [ ] All UI components meet 3:1 contrast ratio
- [ ] Color is not the only means of conveying information
- [ ] Status indicators have text/icon alternatives

### Focus Management Testing

**Test Checklist:**
- [ ] Focus indicators are visible on all interactive elements
- [ ] Focus indicators have sufficient contrast
- [ ] Focus order is logical and intuitive
- [ ] Focus is managed correctly in modals (focus trap)
- [ ] Focus is restored after closing modals
- [ ] Focus is managed correctly in dropdowns
- [ ] Focus is managed correctly in tabs
- [ ] Focus is managed correctly in accordions

**Testing Steps:**

1. **Focus Visibility**
   ```
   Tab through all interactive elements
   Verify each element has a visible focus indicator
   Verify focus indicator has sufficient contrast
   ```

2. **Focus Order**
   ```
   Tab through page
   Verify focus order is logical (left-to-right, top-to-bottom)
   Verify focus order matches visual order
   ```

3. **Focus Trap (Modals)**
   ```
   Open a modal
   Tab through modal elements
   Verify Tab key stays within modal
   Verify Shift+Tab stays within modal
   Verify focus wraps from last to first element
   ```

4. **Focus Restoration**
   ```
   Click button to open modal
   Close modal (Escape or close button)
   Verify focus returns to button
   ```

## Component-Specific Testing

### Button Component

**Accessibility Checks:**
- [ ] Has accessible name (text or aria-label)
- [ ] Keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicator visible
- [ ] Disabled state is announced
- [ ] Loading state is announced

**Manual Testing:**
```
1. Tab to button
2. Verify focus indicator is visible
3. Press Enter to activate
4. Press Space to activate
5. Test with screen reader
6. Verify disabled state is announced
```

### Input Component

**Accessibility Checks:**
- [ ] Associated label
- [ ] Placeholder is not a substitute for label
- [ ] Error messages are announced
- [ ] Required state is indicated
- [ ] Input type is correct (email, password, etc.)

**Manual Testing:**
```
1. Tab to input
2. Verify label is associated
3. Enter invalid data
4. Verify error message is announced
5. Test with screen reader
6. Verify required state is indicated
```

### Select Component

**Accessibility Checks:**
- [ ] Associated label
- [ ] Keyboard navigation (Arrow keys)
- [ ] Escape key closes dropdown
- [ ] Focus management
- [ ] Options are announced

**Manual Testing:**
```
1. Tab to select
2. Press Enter or Space to open
3. Use Arrow keys to navigate options
4. Press Enter to select
5. Verify Escape closes dropdown
6. Test with screen reader
```

### Modal Component

**Accessibility Checks:**
- [ ] Dialog role
- [ ] aria-labelledby or aria-label
- [ ] Focus trap (Tab stays within modal)
- [ ] Escape key closes modal
- [ ] Focus restoration
- [ ] Backdrop click closes modal

**Manual Testing:**
```
1. Open modal
2. Tab through elements
3. Verify Tab stays within modal
4. Press Escape to close
5. Verify focus returns to trigger
6. Test with screen reader
```

### Form Component

**Accessibility Checks:**
- [ ] All inputs have associated labels
- [ ] Error messages are announced
- [ ] Required fields are indicated
- [ ] Form submission is announced
- [ ] Success/error feedback is provided

**Manual Testing:**
```
1. Tab through form fields
2. Verify labels are associated
3. Submit with invalid data
4. Verify error messages are announced
5. Submit with valid data
6. Verify success message is announced
```

## Accessibility Checklist

### General

- [ ] Page has proper heading hierarchy (h1, h2, h3, etc.)
- [ ] Page has descriptive title
- [ ] Page has skip navigation link
- [ ] Page has proper language attribute
- [ ] Page has proper viewport meta tag

### Navigation

- [ ] Navigation is keyboard accessible
- [ ] Navigation has proper ARIA roles
- [ ] Current page is indicated
- [ ] Navigation structure is clear
- [ ] Links have descriptive text

### Content

- [ ] Text has sufficient contrast (4.5:1)
- [ ] Text is resizable (up to 200%)
- [ ] Text is not justified
- [ ] Line spacing is adequate
- [ ] Color is not the only means of conveying information

### Forms

- [ ] All inputs have associated labels
- [ ] Labels are positioned correctly
- [ ] Error messages are clear and associated
- [ ] Required fields are indicated
- [ ] Form validation is clear
- [ ] Form submission is confirmed

### Images

- [ ] All images have alt text
- [ ] Alt text is descriptive
- [ ] Decorative images have empty alt text
- [ ] Complex images have long descriptions
- [ ] Images of text are avoided

### Media

- [ ] Videos have captions
- [ ] Videos have audio descriptions
- [ ] Audio has transcripts
- [ ] Media controls are keyboard accessible

### Interactive Elements

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Focus order is logical
- [ ] Buttons have accessible names
- [ ] Links have descriptive text
- [ ] Modals have focus management

### Animations

- [ ] Animations respect prefers-reduced-motion
- [ ] Animations don't cause seizures (no flashing)
- [ ] Animations can be paused
- [ ] Animations don't distract from content

## Testing Workflow

### Before Merging

1. **Run Automated Tests**
   ```bash
   npm run accessibility-audit
   npm run test -- Accessibility.test.tsx
   ```

2. **Review Storybook**
   - Open Storybook
   - Navigate to component
   - Check Accessibility panel
   - Fix any violations

3. **Manual Testing**
   - Test with keyboard navigation
   - Test with screen reader
   - Test color contrast
   - Test focus management

4. **Fix Issues**
   - Update component code
   - Re-run tests
   - Verify fixes

5. **Document Changes**
   - Update component documentation
   - Update accessibility guide
   - Add test cases if needed

## Resources

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/
- **Deque University**: https://dequeuniversity.com/
- **A11y Project**: https://www.a11yproject.com/

## Accessibility Standards

### WCAG 2.1 Levels

- **Level A**: Basic accessibility
- **Level AA**: Enhanced accessibility (target for this project)
- **Level AAA**: Advanced accessibility (optional)

### Target: WCAG 2.1 AA

All components must meet WCAG 2.1 AA standards:
- Perceivable: Information is perceivable to all users
- Operable: All functionality is operable via keyboard
- Understandable: Content is understandable to all users
- Robust: Content works with assistive technologies

## Reporting Issues

When reporting accessibility issues:

1. **Component**: Which component has the issue?
2. **Issue**: What is the accessibility problem?
3. **WCAG Criterion**: Which WCAG criterion is violated?
4. **Steps to Reproduce**: How to reproduce the issue?
5. **Expected Behavior**: What should happen?
6. **Actual Behavior**: What actually happens?
7. **Severity**: Critical, High, Medium, Low?

## Continuous Improvement

- Review accessibility audit reports regularly
- Update components based on feedback
- Test with real users with disabilities
- Stay updated with WCAG guidelines
- Participate in accessibility community
