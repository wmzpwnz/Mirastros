# Admin Panel Migration Guide

## Overview

This guide provides step-by-step instructions for migrating the Mirastros admin panel from custom components and inline styles to the unified design system. The admin panel has unique requirements for data-heavy features like tables, charts, and forms, which are addressed in this migration.

## Prerequisites

- Node.js 18+ installed
- Next.js 14+ installed
- Design system package installed: `npm install @mirastros/design-system`
- Tailwind CSS configured to extend design system preset
- TypeScript configured for design system types

## Admin Panel Specifics

The admin panel differs from the web app in several ways:

| Aspect | Web App | Admin Panel |
|---|---|---|
| Primary Use | User-facing features | Data management |
| Key Components | Cards, Sections, Forms | Tables, Charts, Modals |
| Data Volume | Low to medium | High (1000+ records) |
| Interactions | Navigation, Services | CRUD operations, Filtering |
| Performance | Important | Critical |
| Accessibility | Important | Important |

## Component Mapping (Old → New)

### Layout Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom `<div>` wrapper | `<Container>` | Max-width wrapper with responsive padding |
| Custom flexbox layouts | `<Stack>` | Flexible layout for vertical/horizontal stacking |
| Custom grid layouts | `<Grid>` | 12-column responsive grid system |
| Custom navbar | `<Navbar>` | Fixed navigation with logo, menu, user profile |
| Custom sidebar | `<Sidebar>` | Collapsible side navigation |

### Content Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom card with inline styles | `<Card>` | Container with shadow, border, padding |
| Custom stat card | `<StatCard>` | Metric display with value and trend |
| Custom section wrapper | `<Section>` | Full-width section container |

### Form Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom `<input>` | `<Input>` | Text input with validation states |
| Custom `<select>` | `<Select>` | Dropdown with search and multi-select |
| Custom `<button>` | `<Button>` | Button with variants (primary, secondary, danger) |
| Custom `<textarea>` | `<Textarea>` | Multi-line text input |
| Custom checkbox | `<Checkbox>` | Single and group checkboxes |
| Custom radio | `<Radio>` | Single selection radio buttons |
| Custom form wrapper | `<FormGroup>` | Wrapper for label + input + error |
| Custom form layout | `<FormLayout>` | Multi-column form layouts |

### Feedback Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom notification | `<Toast>` | Auto-dismiss notifications (success, error, warning, info) |
| Custom tooltip | `<Tooltip>` | Hover-triggered information |
| Custom loading spinner | `<Spinner>` | Loading indicator with animation |
| Custom skeleton | `<Skeleton>` | Placeholder during data loading |

### Navigation Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom tabs | `<Tabs>` | Tabbed interface with content switching |
| Custom accordion | `<Accordion>` | Collapsible sections |
| Custom breadcrumb | `<Breadcrumb>` | Navigation path |
| Custom pagination | `<Pagination>` | Page navigation with prev/next |

### Data Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom table | `<Table>` | Data table with sorting, filtering, pagination |
| Custom chart | `<Chart>` | Bar, line, pie, area charts |
| Custom progress bar | `<ProgressBar>` | Linear progress with percentage |
| Custom data grid | `<DataGrid>` | Advanced table with inline editing |
| Custom timeline | `<Timeline>` | Chronological event display |

### Modal Components

| Old Component | New Component | Notes |
|---|---|---|
| Custom modal | `<Modal>` | Dialog with backdrop and close button |
| Custom alert dialog | `<AlertDialog>` | Confirmation dialog |
| Custom drawer | `<Drawer>` | Side panel overlay |

## Breaking Changes

### 1. CSS Class Names
**Old:** Custom CSS classes like `admin-table`, `data-row`, `action-cell`
**New:** Tailwind CSS utility classes
**Migration:** Replace custom classes with Tailwind equivalents

```tsx
// Before
<table className="admin-table">
  <thead className="table-header">
    <tr>
      <th className="table-cell">Name</th>
    </tr>
  </thead>
</table>

// After
<Table>
  <Table.Header>
    <Table.Row>
      <Table.Cell>Name</Table.Cell>
    </Table.Row>
  </Table.Header>
</Table>
```

### 2. Inline Styles
**Old:** Inline `style` attributes with custom properties
**New:** Tailwind CSS utility classes
**Migration:** Convert inline styles to Tailwind classes

```tsx
// Before
<div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
  Content
</div>

// After
<div className="flex gap-4 mb-6">
  Content
</div>
```

### 3. Component Props
**Old:** Custom props like `variant`, `size`, `disabled`
**New:** Standardized design system props
**Migration:** Update prop names and values

```tsx
// Before
<button className="btn btn-primary btn-sm">
  Save
</button>

// After
<Button variant="primary" size="sm">
  Save
</Button>
```

### 4. Color Values
**Old:** Hex colors like `#FFC107`, `#00BCD4`
**New:** Design system color tokens
**Migration:** Use Tailwind color classes

```tsx
// Before
<div style={{ color: '#10B981' }}>Success</div>

// After
<div className="text-success">Success</div>
```

### 5. Typography
**Old:** Custom font sizes and weights
**New:** Design system typography tokens
**Migration:** Use Tailwind typography classes

```tsx
// Before
<h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>
  Dashboard
</h1>

// After
<h1 className="text-4xl font-bold">
  Dashboard
</h1>
```

## Installation & Setup

### 1. Install Design System Package

```bash
npm install @mirastros/design-system
```

### 2. Update Tailwind Configuration

```javascript
// tailwind.config.js
const designSystemPreset = require('@mirastros/design-system/tailwind.preset.js');

module.exports = {
  presets: [designSystemPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@mirastros/design-system/**/*.{js,ts,jsx,tsx}',
  ],
};
```

### 3. Update TypeScript Configuration

```json
{
  "compilerOptions": {
    "types": ["@mirastros/design-system"]
  }
}
```

### 4. Import Design System Components

```tsx
import {
  Button,
  Card,
  Input,
  Modal,
  Table,
  Chart,
  FormGroup,
  // ... other components
} from '@mirastros/design-system';
```

## Upgrade Path

### Phase 1: Setup (1-2 hours)
1. Install design system package
2. Update Tailwind configuration
3. Update TypeScript configuration
4. Import design system components

### Phase 2: Layout Components (1-2 hours)
1. Replace custom containers with `<Container>`
2. Replace custom flexbox with `<Stack>`
3. Replace custom grids with `<Grid>`
4. Update Navbar and Sidebar

### Phase 3: Content Components (1 hour)
1. Replace custom cards with `<Card>`
2. Replace custom stat cards with `<StatCard>`
3. Update section wrappers

### Phase 4: Form Components (2-3 hours)
1. Replace custom inputs with `<Input>`
2. Replace custom selects with `<Select>`
3. Replace custom buttons with `<Button>`
4. Replace custom textareas with `<Textarea>`
5. Update form validation and layouts

### Phase 5: Feedback Components (1 hour)
1. Replace custom notifications with `<Toast>`
2. Replace custom tooltips with `<Tooltip>`
3. Replace custom spinners with `<Spinner>`
4. Replace custom skeletons with `<Skeleton>`

### Phase 6: Navigation Components (1 hour)
1. Replace custom tabs with `<Tabs>`
2. Replace custom accordions with `<Accordion>`
3. Replace custom breadcrumbs with `<Breadcrumb>`
4. Replace custom pagination with `<Pagination>`

### Phase 7: Data Components (3-4 hours)
1. Replace custom tables with `<Table>` (most critical)
2. Replace custom charts with `<Chart>`
3. Replace custom progress bars with `<ProgressBar>`
4. Update data grids with inline editing
5. Update timelines

### Phase 8: Modal Components (1 hour)
1. Replace custom modals with `<Modal>`
2. Replace custom alert dialogs with `<AlertDialog>`
3. Replace custom drawers with `<Drawer>`

### Phase 9: Testing & Verification (2-3 hours)
1. Test all components visually
2. Verify responsive behavior
3. Test data loading and pagination
4. Test form submissions
5. Test accessibility with screen readers
6. Test keyboard navigation

### Phase 10: Cleanup (1 hour)
1. Remove old CSS files
2. Remove old component files
3. Update imports throughout app
4. Run final tests

## Data Component Patterns

### Table Component

```tsx
import { Table, Button, Badge } from '@mirastros/design-system';

export function UsersTable({ users, onEdit, onDelete }) {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Cell>Name</Table.Cell>
          <Table.Cell>Email</Table.Cell>
          <Table.Cell>Status</Table.Cell>
          <Table.Cell>Actions</Table.Cell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map((user) => (
          <Table.Row key={user.id}>
            <Table.Cell>{user.name}</Table.Cell>
            <Table.Cell>{user.email}</Table.Cell>
            <Table.Cell>
              <Badge variant={user.active ? 'success' : 'warning'}>
                {user.active ? 'Active' : 'Inactive'}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onEdit(user)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(user.id)}>
                  Delete
                </Button>
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
```

### Chart Component

```tsx
import { Chart, Card } from '@mirastros/design-system';

export function AnalyticsChart({ data }) {
  return (
    <Card>
      <h3 className="text-lg font-bold mb-4">User Growth</h3>
      <Chart
        type="line"
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        }}
      />
    </Card>
  );
}
```

### Form Pattern

```tsx
import { FormGroup, Input, Select, Button, Stack } from '@mirastros/design-system';

export function UserForm({ user, onSubmit }) {
  const [formData, setFormData] = useState(user || {});
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors(error.fieldErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        <FormGroup label="Name" error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormGroup>

        <FormGroup label="Email" error={errors.email}>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </FormGroup>

        <FormGroup label="Role" error={errors.role}>
          <Select
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value })}
            options={[
              { label: 'Admin', value: 'admin' },
              { label: 'Moderator', value: 'moderator' },
              { label: 'User', value: 'user' },
            ]}
          />
        </FormGroup>

        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </div>
      </Stack>
    </form>
  );
}
```

## Migration Examples

### Example 1: Dashboard Card

**Before:**
```tsx
<div className="dashboard-card">
  <div className="card-header">
    <h3 className="card-title">Total Users</h3>
  </div>
  <div className="card-body">
    <div className="stat-value">1,234</div>
    <div className="stat-change positive">+12% from last month</div>
  </div>
</div>
```

**After:**
```tsx
import { Card, Stack, Text } from '@mirastros/design-system';

<Card>
  <Stack gap="md">
    <h3 className="text-lg font-bold">Total Users</h3>
    <div className="text-4xl font-bold text-gold-500">1,234</div>
    <Text className="text-success">+12% from last month</Text>
  </Stack>
</Card>
```

### Example 2: Data Table

**Before:**
```tsx
<table className="admin-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {users.map((user) => (
      <tr key={user.id}>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>
          <span className={`badge badge-${user.status}`}>
            {user.status}
          </span>
        </td>
        <td>
          <button onClick={() => handleEdit(user)}>Edit</button>
          <button onClick={() => handleDelete(user.id)}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**After:**
```tsx
import { Table, Button, Badge } from '@mirastros/design-system';

<Table>
  <Table.Header>
    <Table.Row>
      <Table.Cell>Name</Table.Cell>
      <Table.Cell>Email</Table.Cell>
      <Table.Cell>Status</Table.Cell>
      <Table.Cell>Actions</Table.Cell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {users.map((user) => (
      <Table.Row key={user.id}>
        <Table.Cell>{user.name}</Table.Cell>
        <Table.Cell>{user.email}</Table.Cell>
        <Table.Cell>
          <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
            {user.status}
          </Badge>
        </Table.Cell>
        <Table.Cell>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEdit(user)}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
              Delete
            </Button>
          </div>
        </Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

### Example 3: Form Component

**Before:**
```tsx
<form onSubmit={handleSubmit}>
  <div className="form-group">
    <label className="form-label">Name</label>
    <input
      type="text"
      className="form-input"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
    {errors.name && <span className="form-error">{errors.name}</span>}
  </div>

  <div className="form-group">
    <label className="form-label">Email</label>
    <input
      type="email"
      className="form-input"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    {errors.email && <span className="form-error">{errors.email}</span>}
  </div>

  <div className="form-actions">
    <button type="submit" className="btn btn-primary">
      Save
    </button>
    <button type="button" className="btn btn-secondary">
      Cancel
    </button>
  </div>
</form>
```

**After:**
```tsx
import { FormGroup, Input, Button, Stack } from '@mirastros/design-system';

<form onSubmit={handleSubmit}>
  <Stack gap="lg">
    <FormGroup label="Name" error={errors.name}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </FormGroup>

    <FormGroup label="Email" error={errors.email}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </FormGroup>

    <div className="flex gap-2">
      <Button type="submit" variant="primary">
        Save
      </Button>
      <Button type="button" variant="secondary">
        Cancel
      </Button>
    </div>
  </Stack>
</form>
```

## Performance Considerations

### Table Performance

For large tables (1000+ rows), use pagination:

```tsx
<Table>
  {/* Table content */}
</Table>

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

### Chart Performance

For large datasets, use data aggregation:

```tsx
const aggregatedData = aggregateData(rawData, 'day');

<Chart
  type="line"
  data={aggregatedData}
  options={{ responsive: true }}
/>
```

### Form Performance

Use React.memo for form fields to prevent unnecessary re-renders:

```tsx
const FormField = React.memo(({ label, value, onChange, error }) => (
  <FormGroup label={label} error={error}>
    <Input value={value} onChange={onChange} />
  </FormGroup>
));
```

## Testing Checklist

- [ ] All components render without errors
- [ ] Responsive behavior works on mobile (320px), tablet (768px), desktop (1024px)
- [ ] Tables display data correctly with pagination
- [ ] Charts render with correct data
- [ ] Forms submit correctly with validation
- [ ] Colors match design system tokens
- [ ] Typography is consistent
- [ ] Spacing is consistent
- [ ] Keyboard navigation works
- [ ] Screen reader support works
- [ ] No console errors or warnings
- [ ] Performance is acceptable (Lighthouse score > 80)
- [ ] Large datasets (1000+ records) load efficiently

## Rollback Procedure

If migration fails at any point:

1. **Revert to previous commit:**
   ```bash
   git revert HEAD
   ```

2. **Reinstall dependencies:**
   ```bash
   npm install
   ```

3. **Clear build cache:**
   ```bash
   rm -rf .next node_modules/.cache
   ```

4. **Restart development server:**
   ```bash
   npm run dev
   ```

## Common Issues & Solutions

### Issue 1: Table Not Displaying Data
**Solution:** Ensure Table component receives correct data structure and children

### Issue 2: Chart Not Rendering
**Solution:** Verify chart data format matches expected structure

### Issue 3: Form Validation Not Working
**Solution:** Ensure FormGroup receives error prop and Input onChange handler

### Issue 4: Performance Issues with Large Tables
**Solution:** Implement pagination or virtualization for large datasets

### Issue 5: Tailwind Classes Not Applied
**Solution:** Ensure Tailwind configuration includes design system preset

## Support & Resources

- **Design System Documentation:** `packages/design-system/docs/`
- **Component Stories:** `packages/design-system/stories/`
- **Storybook:** Run `npm run storybook` to view interactive components
- **Requirements:** See `.kiro/specs/design-system-unification/requirements.md`
- **Design Document:** See `.kiro/specs/design-system-unification/design.md`

## Next Steps

After completing the admin panel migration:

1. Migrate telegram-mini to design system
2. Migrate vk-mini to design system
3. Perform accessibility audit
4. Optimize performance and bundle size
