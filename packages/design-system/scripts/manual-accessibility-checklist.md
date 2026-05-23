# Manual Accessibility Testing Checklist

## Component Testing Matrix

### Primitive Components

#### Button Component
- [ ] **Screen Reader**: Button text is announced
- [ ] **Keyboard**: Tab key focuses button
- [ ] **Keyboard**: Enter key activates button
- [ ] **Keyboard**: Space key activates button
- [ ] **Focus**: Focus indicator is visible
- [ ] **Color Contrast**: Text meets 4.5:1 ratio
- [ ] **Disabled State**: Disabled state is announced
- [ ] **Loading State**: Loading state is announced

#### Input Component
- [ ] **Screen Reader**: Label is associated with input
- [ ] **Screen Reader**: Input type is announced
- [ ] **Screen Reader**: Error messages are announced
- [ ] **Keyboard**: Tab key focuses input
- [ ] **Keyboard**: Type text in input
- [ ] **Focus**: Focus indicator is visible
- [ ] **Color Contrast**: Text meets 4.5:1 ratio
- [ ] **Required**: Required state is indicated
- [ ] **Placeholder**: Placeholder is not substitute for label

#### Label Component
- [ ] **Screen Reader**: Label is announced
- [ ] **Association**: Label is associated with input
- [ ] **Required**: Required indicator is visible
- [ ] **Color Contrast**: Text meets 4.5:1 ratio

#### Icon Component
- [ ] **Screen Reader**: Icon has aria-label if meaningful
- [ ] **Decorative**: Decorative icons are hidden from screen readers
- [ ] **Color Contrast**: Icon meets 3:1 ratio
- [ ] **Size**: Icon is at least 44x44px for touch targets

#### Badge Component
- [ ] **Screen Reader**: Badge text is announced
- [ ] **Color Contrast**: Text meets 4.5:1 ratio
- [ ] **Meaning**: Color is not only means of conveying meaning

#### Avatar Component
- [ ] **Screen Reader**: Avatar has alt text or aria-label
- [ ] **Image**: Image has alt text
- [ ] **Fallback**: Initials are displayed if image fails

### Form Components

#### Select Component
- [ ] **Screen Reader**: Label is associated with select
- [ ] **Keyboard**: Tab key focuses select
- [ ] **Keyboard**: Enter/Space opens dropdown
- [ ] **Keyboard**: Arrow keys navigate options
- [ ] **Keyboard**: Escape closes dropdown
- [ ] **Focus**: Focus indicator is visible
- [ ] **Options**: Options are announced
- [ ] **Selected**: Selected option is indicated

#### Checkbox Component
- [ ] **Screen Reader**: Label is associated with checkbox
- [ ] **Screen Reader**: Checked state is announced
- [ ] **Keyboard**: Tab key focuses checkbox
- [ ] **Keyboard**: Space key toggles checkbox
- [ ] **Focus**: Focus indicator is visible
- [ ] **Indeterminate**: Indeterminate state is announced

#### Radio Component
- [ ] **Screen Reader**: Label is associated with radio
- [ ] **Screen Reader**: Checked state is announced
- [ ] **Keyboard**: Tab key focuses radio group
- [ ] **Keyboard**: Arrow keys navigate options
- [ ] **Focus**: Focus indicator is visible
- [ ] **Group**: Radio group is properly grouped

#### Textarea Component
- [ ] **Screen Reader**: Label is associated with textarea
- [ ] **Keyboard**: Tab key focuses textarea
- [ ] **Keyboard**: Type text in textarea
- [ ] **Focus**: Focus indicator is visible
- [ ] **Character Count**: Character count is announced
- [ ] **Required**: Required state is indicated

#### DatePicker Component
- [ ] **Screen Reader**: Label is associated with input
- [ ] **Keyboard**: Tab key focuses input
- [ ] **Keyboard**: Enter opens calendar
- [ ] **Keyboard**: Arrow keys navigate dates
- [ ] **Focus**: Focus indicator is visible
- [ ] **Selected**: Selected date is indicated

#### FormGroup Component
- [ ] **Screen Reader**: Label is associated with input
- [ ] **Screen Reader**: Error messages are announced
- [ ] **Keyboard**: Tab key focuses input
- [ ] **Focus**: Focus indicator is visible
- [ ] **Error**: Error state is indicated
- [ ] **Required**: Required state is indicated

### Feedback Components

#### Toast Component
- [ ] **Screen Reader**: Toast message is announced
- [ ] **Screen Reader**: Toast type (success, error, etc.) is announced
- [ ] **Auto-dismiss**: Toast auto-dismisses after 5 seconds
- [ ] **Keyboard**: Escape key dismisses toast
- [ ] **Focus**: Focus is not trapped in toast
- [ ] **Stacking**: Multiple toasts stack without overlapping

#### Tooltip Component
- [ ] **Screen Reader**: Tooltip text is announced
- [ ] **Keyboard**: Tooltip appears on focus
- [ ] **Keyboard**: Escape key closes tooltip
- [ ] **Positioning**: Tooltip is positioned correctly
- [ ] **Color Contrast**: Text meets 4.5:1 ratio

#### Spinner Component
- [ ] **Screen Reader**: Loading state is announced
- [ ] **Animation**: Animation respects prefers-reduced-motion
- [ ] **Color Contrast**: Spinner meets 3:1 ratio

#### Skeleton Component
- [ ] **Screen Reader**: Skeleton is announced as loading
- [ ] **Animation**: Animation respects prefers-reduced-motion
- [ ] **Placeholder**: Placeholder matches component layout

### Layout Components

#### Container Component
- [ ] **Responsive**: Container is responsive on all breakpoints
- [ ] **Max-width**: Container has appropriate max-width
- [ ] **Padding**: Container has appropriate padding

#### Grid Component
- [ ] **Responsive**: Grid is responsive on all breakpoints
- [ ] **Columns**: Grid columns are appropriate for breakpoint
- [ ] **Gap**: Grid gap is consistent

#### Stack Component
- [ ] **Responsive**: Stack is responsive on all breakpoints
- [ ] **Direction**: Stack direction is appropriate
- [ ] **Gap**: Stack gap is consistent

#### Navbar Component
- [ ] **Screen Reader**: Navigation is announced
- [ ] **Keyboard**: Tab key navigates through menu items
- [ ] **Focus**: Focus indicator is visible
- [ ] **Mobile**: Mobile menu is keyboard accessible
- [ ] **Current**: Current page is indicated

#### Sidebar Component
- [ ] **Screen Reader**: Sidebar is announced
- [ ] **Keyboard**: Tab key navigates through items
- [ ] **Focus**: Focus indicator is visible
- [ ] **Toggle**: Sidebar toggle is keyboard accessible
- [ ] **Current**: Current page is indicated

### Content Components

#### Card Component
- [ ] **Semantic**: Card uses semantic HTML
- [ ] **Heading**: Card has proper heading hierarchy
- [ ] **Interactive**: Interactive elements are keyboard accessible
- [ ] **Focus**: Focus indicators are visible

#### ServiceCard Component
- [ ] **Screen Reader**: Icon is announced or hidden
- [ ] **Screen Reader**: Title and description are announced
- [ ] **Keyboard**: Card is keyboard accessible if interactive
- [ ] **Focus**: Focus indicator is visible

#### Hero Component
- [ ] **Screen Reader**: Hero text is announced
- [ ] **Screen Reader**: CTA button is announced
- [ ] **Keyboard**: CTA button is keyboard accessible
- [ ] **Image**: Background image has alt text or is decorative
- [ ] **Color Contrast**: Text meets 4.5:1 ratio

#### Section Component
- [ ] **Semantic**: Section uses semantic HTML
- [ ] **Heading**: Section has proper heading
- [ ] **Padding**: Section has appropriate padding
- [ ] **Background**: Background color has sufficient contrast

### Navigation Components

#### Tabs Component
- [ ] **Screen Reader**: Tabs are announced
- [ ] **Screen Reader**: Tab panels are announced
- [ ] **Keyboard**: Tab key focuses first tab
- [ ] **Keyboard**: Arrow keys navigate tabs
- [ ] **Keyboard**: Enter/Space activates tab
- [ ] **Focus**: Focus indicator is visible
- [ ] **Selected**: Selected tab is indicated
- [ ] **ARIA**: Proper ARIA roles and attributes

#### Accordion Component
- [ ] **Screen Reader**: Accordion items are announced
- [ ] **Screen Reader**: Expanded/collapsed state is announced
- [ ] **Keyboard**: Tab key focuses items
- [ ] **Keyboard**: Enter/Space toggles item
- [ ] **Focus**: Focus indicator is visible
- [ ] **ARIA**: Proper ARIA roles and attributes

#### Breadcrumb Component
- [ ] **Screen Reader**: Breadcrumb is announced
- [ ] **Screen Reader**: Current page is indicated
- [ ] **Keyboard**: Links are keyboard accessible
- [ ] **Focus**: Focus indicator is visible
- [ ] **ARIA**: Proper ARIA roles and attributes

#### Pagination Component
- [ ] **Screen Reader**: Pagination is announced
- [ ] **Screen Reader**: Current page is indicated
- [ ] **Keyboard**: Links are keyboard accessible
- [ ] **Focus**: Focus indicator is visible
- [ ] **ARIA**: Proper ARIA roles and attributes

### Data Components

#### Table Component
- [ ] **Screen Reader**: Table structure is announced
- [ ] **Screen Reader**: Headers are announced
- [ ] **Screen Reader**: Data cells are associated with headers
- [ ] **Keyboard**: Sortable columns are keyboard accessible
- [ ] **Focus**: Focus indicator is visible
- [ ] **ARIA**: Proper ARIA roles and attributes

#### Chart Component
- [ ] **Screen Reader**: Chart title is announced
- [ ] **Screen Reader**: Chart data is accessible
- [ ] **Keyboard**: Chart is keyboard accessible
- [ ] **Color**: Color is not only means of conveying data
- [ ] **Legend**: Legend is provided

#### ProgressBar Component
- [ ] **Screen Reader**: Progress is announced
- [ ] **Screen Reader**: Percentage is announced
- [ ] **Color Contrast**: Bar meets 3:1 ratio
- [ ] **ARIA**: aria-valuenow is updated

### Modal Components

#### Modal Component
- [ ] **Screen Reader**: Modal is announced
- [ ] **Screen Reader**: Modal title is announced
- [ ] **Keyboard**: Tab key stays within modal (focus trap)
- [ ] **Keyboard**: Escape key closes modal
- [ ] **Focus**: Focus indicator is visible
- [ ] **Focus**: Focus is restored after closing
- [ ] **ARIA**: Proper ARIA roles and attributes

#### AlertDialog Component
- [ ] **Screen Reader**: Dialog is announced
- [ ] **Screen Reader**: Alert type is announced
- [ ] **Keyboard**: Tab key stays within dialog
- [ ] **Keyboard**: Escape key closes dialog
- [ ] **Focus**: Focus indicator is visible
- [ ] **ARIA**: Proper ARIA roles and attributes

#### Drawer Component
- [ ] **Screen Reader**: Drawer is announced
- [ ] **Screen Reader**: Drawer title is announced
- [ ] **Keyboard**: Tab key stays within drawer
- [ ] **Keyboard**: Escape key closes drawer
- [ ] **Focus**: Focus indicator is visible
- [ ] **Animation**: Animation respects prefers-reduced-motion

## Testing Results

### Date: _______________

### Tester: _______________

### Overall Status: [ ] Pass [ ] Fail

### Issues Found:

1. **Component**: _______________
   - **Issue**: _______________
   - **Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
   - **WCAG Criterion**: _______________
   - **Fix**: _______________

2. **Component**: _______________
   - **Issue**: _______________
   - **Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
   - **WCAG Criterion**: _______________
   - **Fix**: _______________

### Notes:

_______________________________________________________________________________

_______________________________________________________________________________

### Sign-off:

Tester: _________________________ Date: _____________

Reviewer: _________________________ Date: _____________
