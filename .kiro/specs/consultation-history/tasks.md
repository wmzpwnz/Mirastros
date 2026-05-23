# Tasks: Consultation History Feature

## Overview

This document outlines the implementation tasks for the Consultation History feature. Tasks are organized by component and follow a logical dependency order. Each task includes acceptance criteria and estimated complexity.

## Phase 1: API Layer (Backend)

### Task 1.1: Create Consultation History API Endpoints
**Complexity:** Medium
**Dependencies:** None
**Description:** Implement backend API endpoints for consultation history operations.

**Acceptance Criteria:**
- [ ] GET `/api/history` endpoint returns paginated consultation list
- [ ] Endpoint supports filtering by service_type, date_from, date_to, favorites_only
- [ ] Endpoint supports search by question and result text
- [ ] Endpoint supports sorting by date_desc, date_asc, service, favorite
- [ ] Endpoint returns total_count, page, page_size, total_pages
- [ ] Endpoint enforces authentication (user can only see their consultations)
- [ ] Endpoint handles invalid filters gracefully
- [ ] Response time is under 500ms for typical queries

**Implementation Notes:**
- Use existing database schema for consultations
- Implement pagination with offset/limit
- Add full-text search on question and result fields
- Cache statistics for performance

### Task 1.2: Create Consultation Detail API Endpoint
**Complexity:** Low
**Dependencies:** Task 1.1
**Description:** Implement endpoint to fetch single consultation details.

**Acceptance Criteria:**
- [ ] GET `/api/history/[id]` returns full consultation data
- [ ] Endpoint enforces ownership (user can only access their consultations)
- [ ] Endpoint returns 404 if consultation not found
- [ ] Endpoint returns 403 if user doesn't own consultation

### Task 1.3: Create Delete Consultation Endpoint
**Complexity:** Low
**Dependencies:** Task 1.2
**Description:** Implement endpoint to delete consultations.

**Acceptance Criteria:**
- [ ] DELETE `/api/history/[id]` deletes consultation
- [ ] Endpoint enforces ownership
- [ ] Endpoint returns 404 if consultation not found
- [ ] Endpoint returns success response
- [ ] Deleted consultation is removed from all views

### Task 1.4: Create Favorite Toggle Endpoint
**Complexity:** Low
**Dependencies:** Task 1.1
**Description:** Implement endpoint to toggle favorite status.

**Acceptance Criteria:**
- [ ] POST `/api/history/[id]/favorite` toggles favorite status
- [ ] Endpoint returns updated is_favorite status
- [ ] Endpoint enforces ownership
- [ ] Favorite status persists across sessions

### Task 1.5: Create Export Endpoint (Premium)
**Complexity:** High
**Dependencies:** Task 1.1
**Description:** Implement endpoint to export consultations to PDF, JSON, CSV.

**Acceptance Criteria:**
- [ ] POST `/api/history/export` accepts consultation_ids and format
- [ ] Endpoint enforces premium tier requirement
- [ ] Endpoint generates PDF with formatted consultations
- [ ] Endpoint generates JSON with complete data
- [ ] Endpoint generates CSV with tabular data
- [ ] Endpoint returns file download with appropriate headers
- [ ] Endpoint handles large exports (100+ consultations)
- [ ] Endpoint includes metadata if requested

### Task 1.6: Create Share Link Endpoint (Platinum)
**Complexity:** Medium
**Dependencies:** Task 1.2
**Description:** Implement endpoint to create shareable links.

**Acceptance Criteria:**
- [ ] POST `/api/history/share` creates shareable link
- [ ] Endpoint enforces platinum tier requirement
- [ ] Endpoint generates unique share token
- [ ] Endpoint returns share link with token
- [ ] Endpoint stores share link in database
- [ ] Share links are revocable

### Task 1.7: Create Shared Consultation View Endpoint
**Complexity:** Low
**Dependencies:** Task 1.6
**Description:** Implement public endpoint to view shared consultations.

**Acceptance Criteria:**
- [ ] GET `/api/shared/[shareId]` returns consultation data
- [ ] Endpoint doesn't require authentication
- [ ] Endpoint returns 404 if share link invalid or revoked
- [ ] Endpoint returns consultation without sensitive user data

### Task 1.8: Create Statistics Endpoint
**Complexity:** Medium
**Dependencies:** Task 1.1
**Description:** Implement endpoint to fetch consultation statistics.

**Acceptance Criteria:**
- [ ] GET `/api/history/stats` returns statistics
- [ ] Statistics include total_count, most_used_service, frequency
- [ ] Statistics include first_consultation_date, last_consultation_date
- [ ] Statistics include breakdown_by_service
- [ ] Statistics are cached for performance
- [ ] Statistics update after consultations are added/deleted

### Task 1.9: Create Bulk Delete Endpoint
**Complexity:** Low
**Dependencies:** Task 1.3
**Description:** Implement endpoint for bulk deletion.

**Acceptance Criteria:**
- [ ] POST `/api/history/bulk-delete` accepts consultation_ids array
- [ ] Endpoint deletes all specified consultations
- [ ] Endpoint enforces ownership for all consultations
- [ ] Endpoint returns count of deleted consultations
- [ ] Endpoint is atomic (all or nothing)

### Task 1.10: Create Bulk Favorite Endpoint
**Complexity:** Low
**Dependencies:** Task 1.4
**Description:** Implement endpoint for bulk favorite operations.

**Acceptance Criteria:**
- [ ] POST `/api/history/bulk-favorite` accepts consultation_ids and action
- [ ] Endpoint marks/unmarks all specified consultations as favorite
- [ ] Endpoint enforces ownership
- [ ] Endpoint returns count of updated consultations

## Phase 2: Frontend Components

### Task 2.1: Create HistoryStats Component
**Complexity:** Low
**Dependencies:** Task 1.8
**Description:** Create statistics dashboard component.

**Acceptance Criteria:**
- [ ] Component displays total consultations count
- [ ] Component displays most used service type
- [ ] Component displays consultation frequency
- [ ] Component displays first and last consultation dates
- [ ] Component displays breakdown by service type
- [ ] Component shows loading state
- [ ] Component is responsive on mobile/desktop
- [ ] Component uses consistent styling

### Task 2.2: Create HistoryFilters Component
**Complexity:** Medium
**Dependencies:** None
**Description:** Create filter and search controls component.

**Acceptance Criteria:**
- [ ] Component displays search input
- [ ] Component displays service type filter dropdown
- [ ] Component displays date range picker
- [ ] Component displays favorites-only checkbox
- [ ] Component displays sort options
- [ ] Component calls onFilterChange callback on changes
- [ ] Component maintains filter state
- [ ] Component is responsive

### Task 2.3: Create ConsultationCard Component
**Complexity:** Medium
**Dependencies:** None
**Description:** Create individual consultation card component.

**Acceptance Criteria:**
- [ ] Component displays service type badge
- [ ] Component displays date and time
- [ ] Component displays question preview (truncated)
- [ ] Component displays result preview (truncated)
- [ ] Component displays favorite button
- [ ] Component displays action menu (share, export, delete)
- [ ] Component displays checkbox for bulk selection
- [ ] Component is clickable to view details
- [ ] Component shows tier-based action availability

### Task 2.4: Create HistoryList Component
**Complexity:** Medium
**Dependencies:** Task 2.3
**Description:** Create list display component with pagination.

**Acceptance Criteria:**
- [ ] Component displays grid of ConsultationCards
- [ ] Component displays pagination controls
- [ ] Component handles page navigation
- [ ] Component shows loading state
- [ ] Component shows error state with retry
- [ ] Component shows empty state
- [ ] Component displays select-all checkbox
- [ ] Component is responsive (1 col mobile, 2 col tablet, 3 col desktop)

### Task 2.5: Create BulkActions Component
**Complexity:** Low
**Dependencies:** Task 2.4
**Description:** Create bulk actions toolbar component.

**Acceptance Criteria:**
- [ ] Component displays selection count
- [ ] Component displays select-all checkbox
- [ ] Component displays bulk delete button
- [ ] Component displays bulk favorite button
- [ ] Component displays bulk export button (premium only)
- [ ] Component shows/hides based on selection
- [ ] Component calls appropriate callbacks

### Task 2.6: Create ExportDialog Component
**Complexity:** Medium
**Dependencies:** Task 1.5
**Description:** Create export options dialog component.

**Acceptance Criteria:**
- [ ] Component displays format options (PDF, JSON, CSV)
- [ ] Component displays metadata checkbox
- [ ] Component shows tier requirement for premium users
- [ ] Component calls onExport callback with selected options
- [ ] Component shows loading state during export
- [ ] Component handles export errors
- [ ] Component closes after successful export

### Task 2.7: Create ShareDialog Component
**Complexity:** Low
**Dependencies:** Task 1.6
**Description:** Create share link dialog component.

**Acceptance Criteria:**
- [ ] Component displays generated share link
- [ ] Component displays copy-to-clipboard button
- [ ] Component displays revoke button
- [ ] Component shows tier requirement for non-platinum users
- [ ] Component handles share creation errors
- [ ] Component closes after successful share

### Task 2.8: Create ConsultationDetail Component
**Complexity:** Medium
**Dependencies:** Task 1.2
**Description:** Create detailed consultation view component.

**Acceptance Criteria:**
- [ ] Component displays all consultation information
- [ ] Component displays service type, question, result
- [ ] Component displays date, time, duration
- [ ] Component displays action buttons (favorite, share, export, delete)
- [ ] Component shows loading state
- [ ] Component shows error state
- [ ] Component displays back button
- [ ] Component is responsive

## Phase 3: Pages

### Task 3.1: Create History Page
**Complexity:** High
**Dependencies:** Task 2.1, 2.2, 2.4, 2.5
**Description:** Create main consultation history page.

**Acceptance Criteria:**
- [ ] Page displays HistoryStats component
- [ ] Page displays HistoryFilters component
- [ ] Page displays HistoryList component
- [ ] Page displays BulkActions component
- [ ] Page fetches consultations on mount
- [ ] Page updates list when filters change
- [ ] Page handles pagination
- [ ] Page enforces authentication
- [ ] Page is responsive
- [ ] Page has proper SEO metadata

### Task 3.2: Create Consultation Detail Page
**Complexity:** Medium
**Dependencies:** Task 2.8
**Description:** Create detailed consultation view page.

**Acceptance Criteria:**
- [ ] Page displays ConsultationDetail component
- [ ] Page fetches consultation by ID
- [ ] Page handles not found (404)
- [ ] Page enforces ownership
- [ ] Page displays back link to history
- [ ] Page is responsive
- [ ] Page has proper SEO metadata

### Task 3.3: Create Shared Consultation Page
**Complexity:** Low
**Dependencies:** Task 1.7
**Description:** Create public shared consultation view page.

**Acceptance Criteria:**
- [ ] Page displays shared consultation
- [ ] Page doesn't require authentication
- [ ] Page shows who shared it and when
- [ ] Page handles invalid/revoked share links
- [ ] Page is responsive
- [ ] Page doesn't expose sensitive user data

## Phase 4: Integration and Testing

### Task 4.1: Implement Tier-Based Access Control
**Complexity:** Medium
**Dependencies:** All Phase 1-3 tasks
**Description:** Ensure tier-based features work correctly.

**Acceptance Criteria:**
- [ ] Freemium users can't access export
- [ ] Premium users can access export
- [ ] Platinum users can access sharing
- [ ] Upgrade prompts display correctly
- [ ] Tier checks are enforced on backend

### Task 4.2: Create Unit Tests
**Complexity:** High
**Dependencies:** All Phase 1-3 tasks
**Description:** Create comprehensive unit tests.

**Acceptance Criteria:**
- [ ] API endpoints have tests
- [ ] Components have tests
- [ ] Filters and search have tests
- [ ] Pagination has tests
- [ ] Tier-based access has tests
- [ ] Error handling has tests
- [ ] Test coverage > 80%

### Task 4.3: Create Integration Tests
**Complexity:** High
**Dependencies:** Task 4.2
**Description:** Create end-to-end integration tests.

**Acceptance Criteria:**
- [ ] Full user flow tests (view → filter → detail → delete)
- [ ] Export flow tests
- [ ] Share flow tests
- [ ] Bulk action tests
- [ ] Error recovery tests
- [ ] All tests pass

### Task 4.4: Performance Optimization
**Complexity:** Medium
**Dependencies:** Task 3.1, 3.2
**Description:** Optimize performance.

**Acceptance Criteria:**
- [ ] API responses < 500ms
- [ ] Page load time < 2s
- [ ] Pagination loads smoothly
- [ ] Search is responsive
- [ ] Export doesn't block UI
- [ ] Statistics are cached

### Task 4.5: Accessibility Review
**Complexity:** Medium
**Dependencies:** All Phase 1-3 tasks
**Description:** Ensure accessibility compliance.

**Acceptance Criteria:**
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Mobile accessibility tested

## Implementation Order

1. Phase 1: API Layer (Tasks 1.1-1.10)
2. Phase 2: Frontend Components (Tasks 2.1-2.8)
3. Phase 3: Pages (Tasks 3.1-3.3)
4. Phase 4: Integration and Testing (Tasks 4.1-4.5)

## Estimated Timeline

- Phase 1: 3-4 days
- Phase 2: 3-4 days
- Phase 3: 2-3 days
- Phase 4: 3-4 days
- **Total: 11-15 days**

## Notes

- All components should follow existing design patterns from service pages
- Reuse existing UI components where possible
- Ensure all features are responsive
- Test tier-based access thoroughly
- Consider performance for users with many consultations
- Implement proper error handling and user feedback
