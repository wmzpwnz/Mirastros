# Component Usage Guide

## Overview

This guide documents when to use each component, best practices, common mistakes, and anti-patterns.

## Table of Contents

1. [Primitive Components](#primitive-components)
2. [Form Components](#form-components)
3. [Feedback Components](#feedback-components)
4. [Layout Components](#layout-components)
5. [Content Components](#content-components)
6. [Navigation Components](#navigation-components)
7. [Data Components](#data-components)
8. [Modal Components](#modal-components)

---

## Primitive Components

### Button

**When to use:**
- Primary call-to-action (CTA) for user actions
- Form submissions
- Navigation triggers
- Confirmations and cancellations

**Variants:**
- `primary`: Main CTAs, important actions
- `secondary`: Alternative actions, less important
- `danger`: Destructive actions (delete, remove)
- `ghost`: Tertiary actions, minimal visual weight

**Do's:**
- ✅ Use descriptive button text (e.g., "Save Changes" not "OK")
- ✅ Use appropriate variant for action importance
- ✅ Provide loading state during async operations
- ✅ Use icons to enhance meaning
- ✅ Ensure minimum 44x44px touch target on mobile

**Don'ts:**
- ❌ Use buttons for navigation (use links instead)
- ❌ Use multiple primary buttons in one section
- ❌ Use vague button text (e.g., "Click here")
- ❌ Disable buttons without explanation
- ❌ Use buttons for decorative purposes

**Common Mistakes:**
- Using `primary` variant for all buttons
- Not providing loading feedback during async operations
- Using buttons for navigation instead of links
- Inconsistent button sizing across the application

**Example:**
```tsx
<Button variant="primary" size="md" onClick={handleSave}>
  Save Changes
</Button>
```

### Input

**When to use:**
- Text input fields in forms
- Search functionality
- Email, password, number inputs
- Any single-line text entry

**Types:**
- `text`: General text input
- `email`: Email validation
- `password`: Masked password input
- `number`: Numeric input with validation
- `search`: Search with autocomplete

**Do's:**
- ✅ Always pair with a `<Label>`
- ✅ Provide placeholder text for guidance
- ✅ Show validation errors clearly
- ✅ Use appropriate input type for data
- ✅ Provide helper text for complex fields

**Don'ts:**
- ❌ Use inputs without labels
- ❌ Rely on placeholder as label
- ❌ Use generic placeholder text
- ❌ Hide error messages
- ❌ Use inputs for non-text content

**Common Mistakes:**
- Missing associated labels
- Unclear error messages
- No validation feedback
- Inconsistent placeholder text

**Example:**
```tsx
<FormGroup>
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    error={errors.email}
  />
</FormGroup>
```

### Label

**When to use:**
- Associate text with form fields
- Provide context for inputs
- Indicate required fields
- Improve form accessibility

**Do's:**
- ✅ Always use with form fields
- ✅ Use descriptive label text
- ✅ Indicate required fields with asterisk
- ✅ Use `htmlFor` to associate with input
- ✅ Keep labels concise

**Don'ts:**
- ❌ Use labels as placeholders
- ❌ Use vague label text
- ❌ Hide labels for space
- ❌ Use labels for decorative text
- ❌ Forget to associate labels with inputs

**Example:**
```tsx
<Label htmlFor="username" required>
  Username
</Label>
<Input id="username" placeholder="Enter username" />
```

### Icon

**When to use:**
- Enhance button meaning
- Indicate status or state
- Provide visual feedback
- Improve visual hierarchy

**Do's:**
- ✅ Use icons with semantic meaning
- ✅ Provide ARIA labels for icon-only buttons
- ✅ Use consistent icon sizing
- ✅ Pair icons with text when possible
- ✅ Use icons to enhance, not replace, text

**Don'ts:**
- ❌ Use ambiguous icons
- ❌ Use icon-only buttons without labels
- ❌ Mix icon styles
- ❌ Use decorative icons for critical information
- ❌ Use too many icons in one section

**Example:**
```tsx
<Button icon={<CheckIcon />}>
  Confirm
</Button>
```

### Badge

**When to use:**
- Display status indicators
- Show tags or categories
- Highlight important information
- Display counts or notifications

**Variants:**
- `default`: General information
- `success`: Positive status
- `warning`: Caution status
- `error`: Error status
- `info`: Informational status

**Do's:**
- ✅ Use for short, concise information
- ✅ Use appropriate color variant for meaning
- ✅ Combine with icons for clarity
- ✅ Use in lists and tables for status
- ✅ Keep badge text brief

**Don'ts:**
- ❌ Use badges for long text
- ❌ Use multiple badges for single information
- ❌ Use badges for navigation
- ❌ Rely on color alone for meaning
- ❌ Use badges for decorative purposes

**Example:**
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
```

### Avatar

**When to use:**
- Display user profile pictures
- Show user identity in comments or posts
- Display team member photos
- Show profile information

**Do's:**
- ✅ Use consistent sizing
- ✅ Provide fallback initials
- ✅ Use appropriate image aspect ratio (1:1)
- ✅ Provide alt text for images
- ✅ Use in user-related contexts

**Don'ts:**
- ❌ Use avatars for decorative purposes
- ❌ Use inconsistent sizing
- ❌ Use low-quality images
- ❌ Forget fallback initials
- ❌ Use avatars outside user context

**Example:**
```tsx
<Avatar
  src="https://example.com/avatar.jpg"
  alt="John Doe"
  initials="JD"
/>
```

---

## Form Components

### Select

**When to use:**
- Choose from predefined options
- Dropdown menus with many options
- Multi-select scenarios
- Searchable option lists

**Do's:**
- ✅ Provide clear option labels
- ✅ Use placeholder for guidance
- ✅ Support keyboard navigation
- ✅ Show search for many options
- ✅ Indicate selected value clearly

**Don'ts:**
- ❌ Use for binary choices (use Checkbox instead)
- ❌ Use for 2-3 options (use Radio instead)
- ❌ Hide selected value
- ❌ Use unclear option labels
- ❌ Disable search for large lists

**Common Mistakes:**
- Using Select for simple yes/no choices
- Not providing search for large option lists
- Unclear option labels
- Missing placeholder text

**Example:**
```tsx
<Select
  label="Choose a service"
  options={services}
  placeholder="Select a service..."
  onChange={handleChange}
/>
```

### Checkbox

**When to use:**
- Multiple selections from a list
- Toggle boolean options
- Agree to terms or conditions
- Enable/disable features

**Do's:**
- ✅ Use for multiple selections
- ✅ Provide clear labels
- ✅ Group related checkboxes
- ✅ Support indeterminate state
- ✅ Use FormGroup for organization

**Don'ts:**
- ❌ Use for single selection (use Radio instead)
- ❌ Use without labels
- ❌ Mix with other input types
- ❌ Use for navigation
- ❌ Hide checkboxes

**Example:**
```tsx
<FormGroup>
  <Checkbox id="terms" label="I agree to terms" />
  <Checkbox id="newsletter" label="Subscribe to newsletter" />
</FormGroup>
```

### Radio

**When to use:**
- Single selection from mutually exclusive options
- Choose one option from a list
- Binary choices with clear labels
- Preference selection

**Do's:**
- ✅ Use for mutually exclusive options
- ✅ Provide clear labels
- ✅ Group related radios
- ✅ Show default selection
- ✅ Use FormGroup for organization

**Don'ts:**
- ❌ Use for multiple selections (use Checkbox instead)
- ❌ Use without labels
- ❌ Mix with other input types
- ❌ Use for navigation
- ❌ Hide radio buttons

**Example:**
```tsx
<FormGroup label="Choose a plan">
  <Radio name="plan" value="free" label="Free" />
  <Radio name="plan" value="pro" label="Pro" />
  <Radio name="plan" value="premium" label="Premium" />
</FormGroup>
```

### Textarea

**When to use:**
- Multi-line text input
- Long-form content
- Comments or feedback
- Descriptions or notes

**Do's:**
- ✅ Pair with Label
- ✅ Show character count for limits
- ✅ Provide placeholder text
- ✅ Allow resizing
- ✅ Show validation errors

**Don'ts:**
- ❌ Use for single-line input (use Input instead)
- ❌ Use without labels
- ❌ Hide character limits
- ❌ Force fixed height
- ❌ Use for code input

**Example:**
```tsx
<FormGroup>
  <Label htmlFor="feedback">Your Feedback</Label>
  <Textarea
    id="feedback"
    placeholder="Tell us what you think..."
    maxLength={500}
  />
</FormGroup>
```

### DatePicker

**When to use:**
- Select dates from calendar
- Date range selection
- Schedule or booking
- Filter by date

**Do's:**
- ✅ Show calendar interface
- ✅ Support keyboard navigation
- ✅ Allow manual date entry
- ✅ Show date format clearly
- ✅ Provide range selection when needed

**Don'ts:**
- ❌ Use for time-only input (use TimePicker instead)
- ❌ Hide calendar interface
- ❌ Use unclear date formats
- ❌ Disable keyboard input
- ❌ Force specific date ranges

**Example:**
```tsx
<DatePicker
  label="Select date"
  value={date}
  onChange={setDate}
/>
```

### FormGroup

**When to use:**
- Organize related form fields
- Group inputs with labels and errors
- Create consistent form layouts
- Manage form field spacing

**Do's:**
- ✅ Use for all form fields
- ✅ Include label and error message
- ✅ Maintain consistent spacing
- ✅ Group related fields
- ✅ Show validation feedback

**Don'ts:**
- ❌ Use inputs without FormGroup
- ❌ Mix different field types
- ❌ Hide error messages
- ❌ Use inconsistent spacing
- ❌ Nest FormGroups deeply

**Example:**
```tsx
<FormGroup>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
  {error && <span className="error">{error}</span>}
</FormGroup>
```

---

## Feedback Components

### Toast

**When to use:**
- Confirm successful actions
- Display error messages
- Show temporary notifications
- Provide user feedback

**Variants:**
- `success`: Action completed successfully
- `error`: Action failed or error occurred
- `warning`: Caution or warning message
- `info`: Informational message

**Do's:**
- ✅ Use for temporary feedback
- ✅ Auto-dismiss after 5 seconds
- ✅ Stack multiple toasts
- ✅ Use appropriate variant
- ✅ Provide action buttons when needed

**Don'ts:**
- ❌ Use for critical information
- ❌ Use for persistent messages (use Alert instead)
- ❌ Show too many toasts at once
- ❌ Use unclear messages
- ❌ Ignore user dismissal

**Example:**
```tsx
showToast({
  type: 'success',
  message: 'Changes saved successfully',
  duration: 5000
})
```

### Tooltip

**When to use:**
- Provide additional context on hover
- Explain icon meanings
- Show keyboard shortcuts
- Display truncated text

**Do's:**
- ✅ Use for supplementary information
- ✅ Keep tooltip text brief
- ✅ Position tooltip clearly
- ✅ Support keyboard access
- ✅ Use for icon explanations

**Don'ts:**
- ❌ Use for critical information
- ❌ Use for long text
- ❌ Hide important information in tooltips
- ❌ Use on touch devices without alternative
- ❌ Use for navigation

**Example:**
```tsx
<Tooltip content="Save your changes">
  <Button icon={<SaveIcon />} />
</Tooltip>
```

### Spinner

**When to use:**
- Indicate loading state
- Show async operation in progress
- Provide visual feedback during wait
- Replace content during loading

**Do's:**
- ✅ Use during async operations
- ✅ Provide loading text
- ✅ Show progress when possible
- ✅ Use appropriate size
- ✅ Provide fallback content

**Don'ts:**
- ❌ Use for static content
- ❌ Use without context
- ❌ Show multiple spinners
- ❌ Use for decorative purposes
- ❌ Forget to remove when done

**Example:**
```tsx
{isLoading ? (
  <Spinner />
) : (
  <Content />
)}
```

### Skeleton

**When to use:**
- Show placeholder during data loading
- Indicate content structure
- Improve perceived performance
- Provide loading feedback

**Do's:**
- ✅ Match content structure
- ✅ Use pulse animation
- ✅ Show multiple skeletons for lists
- ✅ Replace with content when loaded
- ✅ Use appropriate sizing

**Don'ts:**
- ❌ Use for static content
- ❌ Use without animation
- ❌ Show skeletons too long
- ❌ Use for decorative purposes
- ❌ Forget to replace with content

**Example:**
```tsx
{isLoading ? (
  <Skeleton count={3} />
) : (
  <List items={items} />
)}
```

---

## Layout Components

### Container

**When to use:**
- Wrap page content
- Set max-width for readability
- Center content horizontally
- Add consistent padding

**Do's:**
- ✅ Use for main content wrapper
- ✅ Set appropriate max-width
- ✅ Add responsive padding
- ✅ Center content
- ✅ Use consistent sizing

**Don'ts:**
- ❌ Nest containers deeply
- ❌ Use for small sections
- ❌ Remove padding on mobile
- ❌ Use inconsistent widths
- ❌ Use for layout structure

**Example:**
```tsx
<Container maxWidth="lg">
  <h1>Page Title</h1>
  <Content />
</Container>
```

### Grid

**When to use:**
- Create responsive layouts
- Display items in columns
- Build card grids
- Organize content structure

**Do's:**
- ✅ Use 12-column grid
- ✅ Adjust columns per breakpoint
- ✅ Use consistent gaps
- ✅ Maintain responsive behavior
- ✅ Use for content organization

**Don'ts:**
- ❌ Use for single-column layouts (use Stack instead)
- ❌ Use inconsistent column counts
- ❌ Remove gaps on mobile
- ❌ Use for navigation
- ❌ Nest grids deeply

**Example:**
```tsx
<Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap={6}>
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</Grid>
```

### Stack

**When to use:**
- Arrange items vertically or horizontally
- Create consistent spacing
- Build simple layouts
- Organize component groups

**Do's:**
- ✅ Use for simple layouts
- ✅ Use consistent spacing
- ✅ Choose direction (vertical/horizontal)
- ✅ Use for component groups
- ✅ Maintain responsive behavior

**Don'ts:**
- ❌ Use for complex layouts (use Grid instead)
- ❌ Use inconsistent spacing
- ❌ Nest stacks deeply
- ❌ Use for navigation
- ❌ Remove spacing on mobile

**Example:**
```tsx
<Stack direction="vertical" gap={4}>
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
</Stack>
```

### Navbar

**When to use:**
- Main site navigation
- Logo and branding
- User profile menu
- Search functionality

**Do's:**
- ✅ Keep navigation items clear
- ✅ Use consistent styling
- ✅ Provide mobile menu
- ✅ Show active state
- ✅ Include user profile

**Don'ts:**
- ❌ Overcrowd navbar
- ❌ Use unclear labels
- ❌ Hide navigation on mobile
- ❌ Use inconsistent styling
- ❌ Forget accessibility

**Example:**
```tsx
<Navbar
  logo={<Logo />}
  items={navItems}
  userMenu={<UserMenu />}
/>
```

### Sidebar

**When to use:**
- Secondary navigation
- Filters or options
- Related content
- Dashboard navigation

**Do's:**
- ✅ Keep sidebar organized
- ✅ Use clear section labels
- ✅ Show active state
- ✅ Make collapsible on mobile
- ✅ Use consistent styling

**Don'ts:**
- ❌ Overcrowd sidebar
- ❌ Use unclear labels
- ❌ Hide on mobile without toggle
- ❌ Use inconsistent styling
- ❌ Forget accessibility

**Example:**
```tsx
<Sidebar
  sections={sidebarSections}
  activeItem={activeItem}
  onItemClick={handleClick}
/>
```

---

## Content Components

### Card

**When to use:**
- Display grouped content
- Create visual containers
- Show related information
- Build card-based layouts

**Variants:**
- `default`: Standard card with subtle shadow
- `elevated`: Card with prominent shadow
- `outlined`: Card with border only

**Do's:**
- ✅ Use for content grouping
- ✅ Maintain consistent sizing
- ✅ Use appropriate padding
- ✅ Add hover effects
- ✅ Use in grids or lists

**Don'ts:**
- ❌ Use for single elements
- ❌ Use inconsistent sizing
- ❌ Overcrowd card content
- ❌ Use for navigation only
- ❌ Forget hover states

**Example:**
```tsx
<Card variant="elevated">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### ServiceCard

**When to use:**
- Showcase services or features
- Display service offerings
- Create service grids
- Highlight key features

**Do's:**
- ✅ Include icon, title, description
- ✅ Use consistent sizing
- ✅ Add hover effects
- ✅ Include CTA button
- ✅ Use in grids

**Don'ts:**
- ❌ Use for non-service content
- ❌ Overcrowd with information
- ❌ Use inconsistent styling
- ❌ Forget hover states
- ❌ Use unclear descriptions

**Example:**
```tsx
<ServiceCard
  icon={<TarotIcon />}
  title="Tarot Reading"
  description="Get personalized tarot insights"
  onClick={handleClick}
/>
```

### Hero

**When to use:**
- Page header with background
- Large banner sections
- Call-to-action sections
- Feature highlights

**Do's:**
- ✅ Use compelling background
- ✅ Include clear CTA
- ✅ Use readable text overlay
- ✅ Maintain responsive behavior
- ✅ Keep text concise

**Don'ts:**
- ❌ Use for every section
- ❌ Use unclear text
- ❌ Forget mobile optimization
- ❌ Use low-quality images
- ❌ Overcrowd with content

**Example:**
```tsx
<Hero
  backgroundImage="hero.jpg"
  title="Discover Your Cosmic Path"
  subtitle="Explore mystical services"
  cta={{ text: 'Get Started', onClick: handleClick }}
/>
```

### Section

**When to use:**
- Organize page sections
- Create full-width containers
- Group related content
- Add background colors

**Do's:**
- ✅ Use for content organization
- ✅ Add background colors
- ✅ Maintain consistent padding
- ✅ Use clear section titles
- ✅ Keep sections focused

**Don'ts:**
- ❌ Use for single elements
- ❌ Use inconsistent padding
- ❌ Overcrowd sections
- ❌ Use unclear titles
- ❌ Nest sections deeply

**Example:**
```tsx
<Section title="Our Services" backgroundColor="cosmic">
  <Grid columns={3}>
    {services.map(service => (
      <ServiceCard key={service.id} {...service} />
    ))}
  </Grid>
</Section>
```

---

## Navigation Components

### Tabs

**When to use:**
- Switch between related content
- Organize content into sections
- Create tabbed interfaces
- Show multiple views

**Do's:**
- ✅ Use for related content
- ✅ Show active tab clearly
- ✅ Support keyboard navigation
- ✅ Keep tab labels short
- ✅ Use 2-5 tabs maximum

**Don'ts:**
- ❌ Use for navigation (use Navbar instead)
- ❌ Use too many tabs
- ❌ Use unclear labels
- ❌ Hide tab content
- ❌ Use for sequential steps (use Stepper instead)

**Example:**
```tsx
<Tabs
  tabs={[
    { label: 'Overview', content: <Overview /> },
    { label: 'Details', content: <Details /> }
  ]}
/>
```

### Accordion

**When to use:**
- Collapse/expand content sections
- FAQ sections
- Organize long content
- Save vertical space

**Do's:**
- ✅ Use for collapsible content
- ✅ Show expand/collapse icons
- ✅ Support keyboard navigation
- ✅ Keep section titles clear
- ✅ Allow multiple sections open

**Don'ts:**
- ❌ Use for navigation
- ❌ Use unclear titles
- ❌ Hide important content
- ❌ Use for sequential steps
- ❌ Forget keyboard support

**Example:**
```tsx
<Accordion
  sections={[
    { title: 'Question 1', content: <Answer1 /> },
    { title: 'Question 2', content: <Answer2 /> }
  ]}
/>
```

### Breadcrumb

**When to use:**
- Show navigation path
- Indicate current location
- Enable quick navigation
- Show hierarchy

**Do's:**
- ✅ Show current page last
- ✅ Use clear labels
- ✅ Make items clickable
- ✅ Show hierarchy clearly
- ✅ Use on deep pages

**Don'ts:**
- ❌ Use on home page
- ❌ Use unclear labels
- ❌ Hide current page
- ❌ Use too many levels
- ❌ Use for navigation only

**Example:**
```tsx
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Tarot', href: '/services/tarot' }
  ]}
/>
```

### Pagination

**When to use:**
- Navigate through pages
- Display large datasets
- Show page numbers
- Enable quick navigation

**Do's:**
- ✅ Show current page
- ✅ Provide prev/next buttons
- ✅ Show page numbers
- ✅ Support keyboard navigation
- ✅ Show total pages

**Don'ts:**
- ❌ Use for small datasets
- ❌ Hide current page
- ❌ Use unclear labels
- ❌ Show too many page numbers
- ❌ Forget keyboard support

**Example:**
```tsx
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

---

## Data Components

### Table

**When to use:**
- Display tabular data
- Show structured information
- Enable sorting and filtering
- Display large datasets

**Do's:**
- ✅ Use for structured data
- ✅ Support sorting
- ✅ Enable filtering
- ✅ Show pagination
- ✅ Use clear headers

**Don'ts:**
- ❌ Use for layout
- ❌ Use unclear headers
- ❌ Hide important columns
- ❌ Use for single rows
- ❌ Forget accessibility

**Example:**
```tsx
<Table
  columns={columns}
  data={data}
  sortable
  filterable
/>
```

### Chart

**When to use:**
- Visualize data trends
- Show statistics
- Display comparisons
- Analyze patterns

**Types:**
- `bar`: Compare values
- `line`: Show trends
- `pie`: Show proportions
- `area`: Show cumulative trends

**Do's:**
- ✅ Use appropriate chart type
- ✅ Label axes clearly
- ✅ Show legends
- ✅ Use color coding
- ✅ Provide data table alternative

**Don'ts:**
- ❌ Use for single values
- ❌ Use unclear labels
- ❌ Use too many data series
- ❌ Use 3D effects
- ❌ Forget accessibility

**Example:**
```tsx
<Chart
  type="line"
  data={chartData}
  title="Monthly Revenue"
/>
```

### ProgressBar

**When to use:**
- Show progress of tasks
- Display completion percentage
- Indicate loading progress
- Show file upload progress

**Do's:**
- ✅ Show percentage
- ✅ Use appropriate color
- ✅ Update in real-time
- ✅ Show label
- ✅ Use for long operations

**Don'ts:**
- ❌ Use for quick operations
- ❌ Hide percentage
- ❌ Use unclear labels
- ❌ Use for decorative purposes
- ❌ Forget to complete

**Example:**
```tsx
<ProgressBar
  value={progress}
  max={100}
  label="Uploading..."
/>
```

---

## Modal Components

### Modal

**When to use:**
- Display important information
- Require user confirmation
- Collect user input
- Show detailed content

**Do's:**
- ✅ Use for important content
- ✅ Provide close button
- ✅ Support ESC to close
- ✅ Manage focus
- ✅ Use backdrop

**Don'ts:**
- ❌ Use for navigation
- ❌ Use for simple messages (use Toast instead)
- ❌ Hide close button
- ❌ Use multiple modals
- ❌ Forget focus management

**Example:**
```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
>
  <p>Are you sure?</p>
  <Button onClick={handleConfirm}>Confirm</Button>
</Modal>
```

### AlertDialog

**When to use:**
- Confirm destructive actions
- Get user confirmation
- Show warnings
- Require explicit action

**Do's:**
- ✅ Use for destructive actions
- ✅ Show clear warning
- ✅ Provide cancel option
- ✅ Use danger variant
- ✅ Require explicit confirmation

**Don'ts:**
- ❌ Use for non-critical actions
- ❌ Use unclear messages
- ❌ Hide cancel option
- ❌ Use multiple dialogs
- ❌ Forget focus management

**Example:**
```tsx
<AlertDialog
  title="Delete Item?"
  description="This action cannot be undone"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

### Drawer

**When to use:**
- Side panel navigation
- Filters or options
- Additional content
- Mobile navigation

**Do's:**
- ✅ Use for side content
- ✅ Support slide animation
- ✅ Provide close button
- ✅ Use on mobile
- ✅ Manage focus

**Don'ts:**
- ❌ Use for main content
- ❌ Hide close button
- ❌ Use multiple drawers
- ❌ Forget focus management
- ❌ Use for navigation only

**Example:**
```tsx
<Drawer
  isOpen={isOpen}
  onClose={handleClose}
  title="Filters"
>
  <FilterOptions />
</Drawer>
```

---

## Summary

This guide provides comprehensive usage recommendations for all design system components. Always refer to Storybook for interactive examples and test your implementations thoroughly.

For questions or clarifications, please refer to the [Design Principles](./DESIGN_PRINCIPLES.md) or check component stories in Storybook.
