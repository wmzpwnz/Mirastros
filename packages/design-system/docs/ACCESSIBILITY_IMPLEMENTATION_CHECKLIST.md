# Accessibility Implementation Checklist

## Component Accessibility Requirements

This checklist ensures all components meet WCAG 2.1 AA standards.

**Validates: Requirements 8.1, 8.2, 8.3**

## Primitive Components

### Button

- [ ] Has accessible name (text or aria-label)
- [ ] Keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicator visible (outline or custom)
- [ ] Disabled state announced (aria-disabled)
- [ ] Loading state announced (aria-busy)
- [ ] Color contrast 4.5:1 for text
- [ ] Touch target at least 44x44px
- [ ] No keyboard trap
- [ ] Semantic `<button>` element used

**Implementation**:
```tsx
<button
  aria-label={ariaLabel}
  disabled={disabled}
  aria-disabled={disabled}
  aria-busy={loading}
  className="focus:outline-2 focus:outline-gold-500"
>
  {children}
</button>
```

### Input

- [ ] Associated label (htmlFor/id)
- [ ] Placeholder not used as label
- [ ] Input type correct (email, password, etc.)
- [ ] Error message associated (aria-describedby)
- [ ] Error message has role="alert"
- [ ] Required state indicated (required attribute)
- [ ] Focus indicator visible
- [ ] Color contrast 4.5:1 for text
- [ ] Semantic `<input>` element used

**Implementation**:
```tsx
<label htmlFor="email">Email:</label>
<input
  id="email"
  type="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'error-id' : undefined}
/>
{error && (
  <span id="error-id" role="alert">
    {error}
  </span>
)}
```

### Label

- [ ] Associated with input (htmlFor/id)
- [ ] Visible text (not hidden)
- [ ] Color contrast 4.5:1
- [ ] Required indicator visible
- [ ] Semantic `<label>` element used

**Implementation**:
```tsx
<label htmlFor="field">
  Field Name
  {required && <span aria-label="required">*</span>}
</label>
```

### Icon

- [ ] Has aria-label if meaningful
- [ ] Hidden from screen readers if decorative (aria-hidden)
- [ ] Color contrast 3:1 if standalone
- [ ] Size at least 44x44px for interactive icons
- [ ] SVG with proper role

**Implementation**:
```tsx
// Meaningful icon
<button aria-label="Close">
  <CloseIcon />
</button>

// Decorative icon
<span aria-hidden="true">
  <DecorativeIcon />
</span>
```

### Badge

- [ ] Text is announced
- [ ] Color contrast 4.5:1
- [ ] Color not only means of conveying meaning
- [ ] Semantic HTML used

**Implementation**:
```tsx
<span className="bg-gold-500 text-cosmic">
  <span aria-label="status">●</span> Active
</span>
```

### Avatar

- [ ] Image has alt text or aria-label
- [ ] Fallback text if image fails
- [ ] Color contrast 4.5:1 for text
- [ ] Size at least 44x44px

**Implementation**:
```tsx
<img
  src={src}
  alt={`${name}'s avatar`}
  onError={() => setShowFallback(true)}
/>
```

## Form Components

### Select

- [ ] Associated label
- [ ] Keyboard navigation (Arrow keys)
- [ ] Escape key closes dropdown
- [ ] Focus management
- [ ] Options announced
- [ ] Selected option indicated
- [ ] Semantic `<select>` or proper ARIA roles

**Implementation**:
```tsx
<label htmlFor="select">Choose:</label>
<select id="select" aria-label="Choose option">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Checkbox

- [ ] Associated label
- [ ] Checked state announced
- [ ] Keyboard accessible (Tab, Space)
- [ ] Focus indicator visible
- [ ] Indeterminate state announced
- [ ] Semantic `<input type="checkbox">` used

**Implementation**:
```tsx
<label>
  <input
    type="checkbox"
    checked={checked}
    onChange={handleChange}
    aria-checked={checked}
  />
  Checkbox label
</label>
```

### Radio

- [ ] Associated label
- [ ] Grouped with fieldset/legend
- [ ] Checked state announced
- [ ] Keyboard accessible (Tab, Arrow keys)
- [ ] Focus indicator visible
- [ ] Semantic `<input type="radio">` used

**Implementation**:
```tsx
<fieldset>
  <legend>Select one:</legend>
  <label>
    <input type="radio" name="group" value="1" />
    Option 1
  </label>
  <label>
    <input type="radio" name="group" value="2" />
    Option 2
  </label>
</fieldset>
```

### Textarea

- [ ] Associated label
- [ ] Character count announced
- [ ] Focus indicator visible
- [ ] Required state indicated
- [ ] Semantic `<textarea>` element used

**Implementation**:
```tsx
<label htmlFor="textarea">Message:</label>
<textarea
  id="textarea"
  aria-describedby="char-count"
  maxLength={500}
/>
<span id="char-count">{count}/500 characters</span>
```

### DatePicker

- [ ] Associated label
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Selected date announced
- [ ] Calendar structure announced
- [ ] Escape key closes calendar

**Implementation**:
```tsx
<label htmlFor="date">Date:</label>
<input
  id="date"
  type="date"
  aria-label="Select date"
/>
```

### FormGroup

- [ ] Label associated with input
- [ ] Error message associated
- [ ] Required state indicated
- [ ] Helper text associated
- [ ] Focus indicator visible

**Implementation**:
```tsx
<div>
  <label htmlFor="field">Field:</label>
  <input
    id="field"
    aria-describedby={`helper-${id} error-${id}`}
  />
  <span id={`helper-${id}`}>Helper text</span>
  {error && <span id={`error-${id}`} role="alert">{error}</span>}
</div>
```

## Feedback Components

### Toast

- [ ] Message announced to screen readers
- [ ] Type (success, error, etc.) announced
- [ ] Auto-dismisses after 5 seconds
- [ ] Escape key dismisses
- [ ] Focus not trapped
- [ ] Multiple toasts stack without overlapping
- [ ] aria-live="polite" or "assertive"

**Implementation**:
```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {message}
</div>
```

### Tooltip

- [ ] Text announced on focus
- [ ] Escape key closes
- [ ] Positioned correctly
- [ ] Color contrast 4.5:1
- [ ] aria-describedby association

**Implementation**:
```tsx
<button aria-describedby="tooltip">
  Help
</button>
<div id="tooltip" role="tooltip">
  Tooltip text
</div>
```

### Spinner

- [ ] Loading state announced
- [ ] Animation respects prefers-reduced-motion
- [ ] Color contrast 3:1
- [ ] aria-busy="true"

**Implementation**:
```tsx
<div aria-busy="true" aria-label="Loading">
  <Spinner />
</div>
```

### Skeleton

- [ ] Announced as loading
- [ ] Animation respects prefers-reduced-motion
- [ ] Placeholder matches component layout
- [ ] aria-busy="true"

**Implementation**:
```tsx
<div aria-busy="true" aria-label="Loading content">
  <Skeleton />
</div>
```

## Layout Components

### Container

- [ ] Responsive on all breakpoints
- [ ] Appropriate max-width
- [ ] Appropriate padding
- [ ] Semantic HTML used

### Grid

- [ ] Responsive on all breakpoints
- [ ] Columns appropriate for breakpoint
- [ ] Gap consistent
- [ ] Semantic HTML used

### Stack

- [ ] Responsive on all breakpoints
- [ ] Direction appropriate
- [ ] Gap consistent
- [ ] Semantic HTML used

### Navbar

- [ ] Navigation announced
- [ ] Tab key navigates menu items
- [ ] Focus indicator visible
- [ ] Mobile menu keyboard accessible
- [ ] Current page indicated
- [ ] Semantic `<nav>` element used

**Implementation**:
```tsx
<nav aria-label="Main navigation">
  <ul>
    <li>
      <a href="/" aria-current={current === '/' ? 'page' : undefined}>
        Home
      </a>
    </li>
  </ul>
</nav>
```

### Sidebar

- [ ] Sidebar announced
- [ ] Tab key navigates items
- [ ] Focus indicator visible
- [ ] Toggle keyboard accessible
- [ ] Current page indicated
- [ ] Semantic `<aside>` element used

**Implementation**:
```tsx
<aside aria-label="Sidebar navigation">
  <nav>
    <a href="/" aria-current={current === '/' ? 'page' : undefined}>
      Home
    </a>
  </nav>
</aside>
```

## Content Components

### Card

- [ ] Semantic HTML used
- [ ] Heading hierarchy correct
- [ ] Interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast 4.5:1 for text

### ServiceCard

- [ ] Icon announced or hidden
- [ ] Title and description announced
- [ ] Card keyboard accessible if interactive
- [ ] Focus indicator visible
- [ ] Color contrast 4.5:1 for text

### Hero

- [ ] Hero text announced
- [ ] CTA button announced
- [ ] CTA button keyboard accessible
- [ ] Background image has alt text or is decorative
- [ ] Color contrast 4.5:1 for text
- [ ] Semantic HTML used

### Section

- [ ] Semantic `<section>` element used
- [ ] Section has heading
- [ ] Heading hierarchy correct
- [ ] Appropriate padding
- [ ] Background color has sufficient contrast

## Navigation Components

### Tabs

- [ ] Tabs announced
- [ ] Tab panels announced
- [ ] Tab key focuses first tab
- [ ] Arrow keys navigate tabs
- [ ] Enter/Space activates tab
- [ ] Focus indicator visible
- [ ] Selected tab indicated
- [ ] Proper ARIA roles (tablist, tab, tabpanel)

**Implementation**:
```tsx
<div role="tablist">
  <button
    role="tab"
    aria-selected={selected === 0}
    aria-controls="panel-0"
  >
    Tab 1
  </button>
  <div id="panel-0" role="tabpanel" aria-labelledby="tab-0">
    Content
  </div>
</div>
```

### Accordion

- [ ] Accordion items announced
- [ ] Expanded/collapsed state announced
- [ ] Tab key focuses items
- [ ] Enter/Space toggles item
- [ ] Focus indicator visible
- [ ] Proper ARIA roles and attributes

**Implementation**:
```tsx
<div>
  <button
    aria-expanded={expanded}
    aria-controls="content"
  >
    Accordion Title
  </button>
  <div id="content" hidden={!expanded}>
    Content
  </div>
</div>
```

### Breadcrumb

- [ ] Breadcrumb announced
- [ ] Current page indicated
- [ ] Links keyboard accessible
- [ ] Focus indicator visible
- [ ] Proper ARIA roles (nav, ol, li)

**Implementation**:
```tsx
<nav aria-label="Breadcrumb">
  <ol>
    <li>
      <a href="/">Home</a>
    </li>
    <li aria-current="page">Current</li>
  </ol>
</nav>
```

### Pagination

- [ ] Pagination announced
- [ ] Current page indicated
- [ ] Links keyboard accessible
- [ ] Focus indicator visible
- [ ] Proper ARIA roles and attributes

**Implementation**:
```tsx
<nav aria-label="Pagination">
  <ul>
    <li>
      <a href="?page=1" aria-current={page === 1 ? 'page' : undefined}>
        1
      </a>
    </li>
  </ul>
</nav>
```

## Data Components

### Table

- [ ] Table structure announced
- [ ] Headers announced
- [ ] Data cells associated with headers
- [ ] Sortable columns keyboard accessible
- [ ] Focus indicator visible
- [ ] Proper ARIA roles and attributes

**Implementation**:
```tsx
<table>
  <thead>
    <tr>
      <th scope="col">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

### Chart

- [ ] Chart title announced
- [ ] Chart data accessible
- [ ] Chart keyboard accessible
- [ ] Color not only means of conveying data
- [ ] Legend provided

### ProgressBar

- [ ] Progress announced
- [ ] Percentage announced
- [ ] Color contrast 3:1
- [ ] aria-valuenow updated
- [ ] aria-valuemin and aria-valuemax set

**Implementation**:
```tsx
<div
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Progress"
>
  {value}%
</div>
```

## Modal Components

### Modal

- [ ] Modal announced
- [ ] Modal title announced
- [ ] Tab key stays within modal (focus trap)
- [ ] Escape key closes modal
- [ ] Focus indicator visible
- [ ] Focus restored after closing
- [ ] Proper ARIA roles (dialog, aria-modal)

**Implementation**:
```tsx
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-modal="true"
>
  <h2 id="modal-title">Modal Title</h2>
  <button onClick={onClose}>Close</button>
</div>
```

### AlertDialog

- [ ] Dialog announced
- [ ] Alert type announced
- [ ] Tab key stays within dialog
- [ ] Escape key closes dialog
- [ ] Focus indicator visible
- [ ] Proper ARIA roles (alertdialog)

**Implementation**:
```tsx
<div
  role="alertdialog"
  aria-labelledby="alert-title"
  aria-describedby="alert-desc"
>
  <h2 id="alert-title">Confirm Action</h2>
  <p id="alert-desc">Are you sure?</p>
</div>
```

### Drawer

- [ ] Drawer announced
- [ ] Drawer title announced
- [ ] Tab key stays within drawer
- [ ] Escape key closes drawer
- [ ] Focus indicator visible
- [ ] Animation respects prefers-reduced-motion
- [ ] Proper ARIA roles (dialog)

**Implementation**:
```tsx
<div
  role="dialog"
  aria-labelledby="drawer-title"
  aria-modal="true"
>
  <h2 id="drawer-title">Drawer Title</h2>
  <button onClick={onClose}>Close</button>
</div>
```

## General Requirements

### All Components

- [ ] Keyboard accessible (Tab, Enter, Space, Arrow keys, Escape)
- [ ] Focus indicators visible
- [ ] Color contrast 4.5:1 for text (3:1 for large text)
- [ ] Semantic HTML used
- [ ] ARIA attributes correct
- [ ] Screen reader support
- [ ] Mobile touch targets 44x44px
- [ ] Animations respect prefers-reduced-motion
- [ ] No keyboard traps
- [ ] No flashing content (no more than 3 flashes per second)

## Testing Verification

Before marking component as accessible:

- [ ] Automated tests pass
- [ ] Manual keyboard navigation works
- [ ] Screen reader announces content correctly
- [ ] Color contrast verified
- [ ] Focus indicators visible
- [ ] ARIA attributes correct
- [ ] Semantic HTML used
- [ ] Error messages associated
- [ ] Focus managed correctly
- [ ] Escape key works in modals

## Sign-off

Component: _______________

Implemented by: _________________________ Date: _____________

Tested by: _________________________ Date: _____________

Approved by: _________________________ Date: _____________
