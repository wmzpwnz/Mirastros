# Design: Web Service Pages Completion

## Overview

This design document outlines the implementation strategy for completing all 18 esoteric service pages in the Mirastros Universal web application. Currently, only 3 services are accessible through the web UI (Tarot, Horoscope, Natal Chart). This design covers the implementation of the remaining 15 service pages. The implementation leverages established patterns from existing service pages to ensure consistency, maintainability, and rapid development.

The design follows a component-based architecture with reusable patterns for:
- Input forms (question-based, data-based, selection-based)
- Result displays (card-based, chart-based, text-based)
- Loading and error states
- Navigation and routing

## Architecture

### High-Level Structure

```
apps/web/src/app/services/
├── [service-name]/
│   ├── page.tsx          # Main service page component
│   ├── components/       # Service-specific components (optional)
│   └── hooks/           # Service-specific hooks (optional)
├── layout.tsx           # Shared layout for all service pages
└── page.tsx             # Services index/directory
```

### Component Hierarchy

Each service page follows this structure:

```
ServicePage (page.tsx)
├── Header Section
│   ├── Back Link
│   ├── Service Title
│   └── Service Description
├── Main Content
│   ├── Input Form (conditional)
│   │   ├── Form Fields
│   │   ├── Validation
│   │   └── Submit Button
│   └── Result Display (conditional)
│       ├── Result Cards
│       ├── Interpretation
│       └── Action Buttons
├── Loading State
├── Error State
└── Info Section (optional)
```

## Components and Interfaces

### Reusable Service Page Pattern

All service pages follow a consistent pattern with these key sections:

#### 1. Input Form Component Pattern

```typescript
interface ServiceFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  error: string;
}

// Common form patterns:
// - Question-based: textarea for user question
// - Data-based: multiple inputs for birth data, name, etc.
// - Selection-based: dropdown/buttons for options
// - Informational: no input, just display/refresh
```

#### 2. Result Display Component Pattern

```typescript
interface ServiceResultProps {
  result: any;
  onNewConsultation: () => void;
  onClarify?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
}

// Common result patterns:
// - Card-based: grid of cards with information
// - Text-based: formatted text interpretation
// - Chart-based: visual representation of data
// - Image-based: generated images (mandalas)
```

#### 3. Loading State Pattern

```typescript
// Consistent loading indicator with service-specific messaging
<div className="flex items-center justify-center gap-2">
  <span className="animate-spin">🔮</span>
  <span>Loading {serviceName}...</span>
</div>
```

#### 4. Error State Pattern

```typescript
// Consistent error display with retry option
<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
  <p className="text-red-400">{error}</p>
  <button onClick={handleRetry}>Retry</button>
</div>
```

#### 5. Form Validation Pattern

```typescript
// Consistent validation for required fields
// - Empty/whitespace-only text inputs rejected
// - Required date/time fields validated
// - Selection fields require explicit choice
// Inline error messages displayed below fields
```

### Service-Specific Components

#### Question-Based Services (Divination)

**Runes Service**
- **Input**: Spread type selection (single, three, five runes), question textarea
- **Output**: Runes drawn, individual interpretations, combined meaning
- **API**: `api.getRuneReading()`
- **Validation**: Question required, non-empty

**I Ching Service**
- **Input**: Method selection (coin/yarrow), question textarea
- **Output**: Hexagram, name, interpretation, changing lines
- **API**: `api.consultIChing()`
- **Validation**: Question required, non-empty

**Lenormand Service**
- **Input**: Spread type selection, question textarea
- **Output**: Cards drawn, interpretations, combined reading
- **API**: `api.getLenormandReading()`
- **Validation**: Question required, non-empty

**Horary Astrology Service**
- **Input**: Specific yes/no question textarea
- **Output**: Horary chart, interpretation, clear yes/no answer
- **API**: Backend endpoint for horary astrology
- **Validation**: Question required, non-empty

**Dream Interpretation Service**
- **Input**: Dream description textarea
- **Output**: Symbol interpretations, psychological insights, recommendations
- **API**: `api.interpretDream()`
- **Validation**: Dream text required, non-empty/non-whitespace

#### Data-Based Services (Astrology & Analysis)

**Numerology Service**
- **Input**: Full name, birth date
- **Output**: Destiny number, life path number, personal year number, interpretation
- **API**: `api.calculateNumerology()`
- **Validation**: Name and date required

**Synastry Service**
- **Input**: Two partners' birth data (date, time, location for each)
- **Output**: Compatibility analysis, aspect interpretations, relationship insights
- **API**: `api.calculateSynastry()`
- **Validation**: All birth data fields required for both partners

**Solar Return Service**
- **Input**: Birth data (date, time, location)
- **Output**: Solar return chart, yearly themes, interpretations
- **API**: Backend endpoint for solar return
- **Validation**: All birth data fields required

**Karmic Lessons Service**
- **Input**: Birth data (date, time, location)
- **Output**: Karmic lessons, growth areas, spiritual guidance
- **API**: Backend endpoint for karmic lessons
- **Validation**: All birth data fields required

**Chakra Analysis Service**
- **Input**: Chakra analysis questions or birth data
- **Output**: Chakra balance analysis, recommendations, healing suggestions
- **API**: Backend endpoint for chakra analysis
- **Validation**: Required fields depend on analysis type

#### Informational Services (Display & Browse)

**Transits Service**
- **Input**: None (uses authenticated user's birth data)
- **Output**: Current planetary transits, interpretations, timeline
- **API**: `api.getPersonalTransits()`
- **Interaction**: Refresh button to reload data
- **Auth**: Requires authentication

**Lunar Calendar Service**
- **Input**: Month/year selection (optional, defaults to current)
- **Output**: Moon phases, current phase, recommendations
- **API**: Backend endpoint for lunar data
- **Interaction**: Next/Previous month navigation buttons

**Crystals Service**
- **Input**: Crystal search or category selection
- **Output**: Crystal properties, uses, recommendations
- **API**: Backend endpoint for crystal data
- **Interaction**: Search interface or category browsing, "Get Recommendation" button

**Rituals Service**
- **Input**: Ritual category or search query
- **Output**: Ritual instructions, materials needed, step-by-step guidance
- **API**: Backend endpoint for ritual data
- **Interaction**: Category browsing or search, "Get Personalized Ritual" button

#### Generative Services (Creation & Download)

**Mandala Generation Service**
- **Input**: Generation options (based on birth data, intention, or random)
- **Output**: Generated mandala image, meaning, meditation guidance
- **API**: Backend endpoint for mandala generation
- **Interaction**: Generate button, Download button for image
- **Features**: Image download capability

## Data Models

### Common Response Structures

```typescript
// Question-based services (Tarot, Runes, I Ching, Lenormand, Horary)
interface DivineReading {
  id: string;
  question: string;
  cards_or_symbols: Array<{
    name: string;
    meaning: string;
    reversed?: boolean;
  }>;
  interpretation: string;
  advice?: string;
  timestamp: string;
}

// Data-based services (Numerology, Synastry, Solar Return, Karmic, Chakra)
interface AnalysisResult {
  id: string;
  user_data: Record<string, any>;
  analysis: {
    primary_insight: string;
    detailed_breakdown: string;
    recommendations: string[];
  };
  timestamp: string;
}

// Informational services (Transits, Lunar, Crystals, Rituals)
interface InformationalResult {
  id: string;
  title: string;
  content: string;
  recommendations: string[];
  timestamp: string;
}

// Generative services (Mandala)
interface GenerativeResult {
  id: string;
  image_url: string;
  meaning: string;
  meditation_guidance: string;
  timestamp: string;
}
```

## Styling and Design System

### Color Scheme
- Primary: `mirastros-gold` (#D4AF37)
- Background: Dark theme with `white/5` to `white/10` overlays
- Text: `white` for primary, `gray-400` for secondary
- Accent: `mirastros-gold/10` for highlights

### Typography
- Headings: `font-cinzel` (serif, elegant)
- Body: Default sans-serif
- Sizes: h1 (4xl), h2 (2xl), h3 (xl), body (base)

### Layout
- Max width: `max-w-4xl` for content
- Padding: `py-12 px-4` for pages
- Spacing: Consistent `mb-8`, `mb-6`, `mb-4` for sections
- Cards: `bg-white/5 border border-white/10 rounded-lg p-6`

### Interactive Elements
- Buttons: `py-3 px-6 rounded-lg transition`
- Primary: `bg-mirastros-gold hover:bg-mirastros-gold/90 text-black`
- Secondary: `bg-white/5 hover:bg-white/10 border border-white/10 text-white`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`

## Error Handling

### Error Categories

1. **Validation Errors**: Empty fields, invalid formats
   - Display inline validation messages
   - Prevent form submission
   - Highlight invalid fields

2. **API Errors**: Network issues, server errors
   - Display user-friendly error messages
   - Provide retry option
   - Log errors for debugging

3. **Authentication Errors**: Expired token, unauthorized access
   - Redirect to login page
   - Clear stored tokens
   - Display appropriate message

4. **Subscription Errors**: Tier-based access restrictions
   - Display upgrade prompt
   - Show available features for current tier
   - Link to subscription page

### Error Display Pattern

```typescript
{error && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
    <p className="text-red-400 text-sm">{error}</p>
  </div>
)}
```

## Testing Strategy

### Unit Tests

Unit tests will verify:
- Form validation logic
- Data transformation and normalization
- Error handling
- Component rendering with different states

### Property-Based Tests

Property-based tests will verify:
- Round-trip consistency: API response → display → user action → API call
- Invariants: Form state consistency, result data integrity
- Idempotence: Repeated actions produce same results
- Error handling: Invalid inputs produce appropriate errors

### Integration Tests

Integration tests will verify:
- API integration: Correct endpoints called with correct data
- Navigation: Routing between pages works correctly
- Authentication: Protected pages redirect unauthenticated users
- Subscription: Tier-based access control works correctly

### E2E Tests

E2E tests will verify:
- Complete user flows: Input → API call → Result display
- Error scenarios: Network failures, invalid data
- Cross-service navigation: Moving between different service pages

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Form Validation Prevents Invalid Submission

**For any** service page with a form, submitting with empty or whitespace-only required fields should be prevented, and an error message should be displayed.

**Validates: Requirements 2.7, 3.7, 4.7, 5.7, 11.7, 12.7, 13.7, 14.7**

### Property 2: API Response Normalization and Display

**For any** API response from a service endpoint, the response should be properly normalized and displayed without errors, regardless of whether the response uses snake_case or camelCase field names, and all required fields should be present in the rendered output.

**Validates: Requirements 1.4, 2.4, 3.4, 4.4, 5.4, 6.3, 7.4, 8.4, 9.5, 10.5, 11.4, 12.4, 13.4, 14.4, 15.4**

### Property 3: Loading State Display and Button Disable

**For any** service page during an API call, a loading indicator should be displayed, and the submit button should be disabled to prevent duplicate submissions.

**Validates: Requirements 1.6, 2.6, 3.6, 4.6, 5.6, 6.5, 7.6, 8.7, 9.6, 10.6, 11.6, 12.6, 13.6, 14.6, 15.7**

### Property 4: Error Recovery with Retry

**For any** service page that encounters an API error, the error message should be displayed, and the user should be able to retry the operation without losing their input data.

**Validates: Requirements 1.7, 2.8, 3.8, 4.8, 5.8, 6.6, 7.8, 8.8, 9.7, 10.7, 11.8, 12.8, 13.8, 14.8, 15.8**

### Property 5: Form Reset Completeness

**For any** service page with a "New Consultation", "New Calculation", "New Reading", "New Dream", "New Analysis", or "Generate New" button, clicking it should clear all form fields and result displays, returning the page to its initial state.

**Validates: Requirements 1.5, 2.5, 3.5, 4.5, 5.5, 7.5, 11.5, 12.5, 13.5, 14.5, 15.5**

### Property 6: Consistent UI Elements Across All Pages

**For any** service page, the page should display a consistent header with service name and description, a "Back to Dashboard" link, consistent styling from the design system, and consistent loading/error state displays.

**Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5**

### Property 7: Result Display Consistency

**For any** service page that displays results, the result should be displayed in a consistent card-based layout with all required information fields, and action buttons (save, share, clarify) should be available where applicable.

**Validates: Requirements 16.6, 16.7**

### Property 8: Navigation Integrity

**For any** service page, clicking "Back to Dashboard" should navigate to the dashboard, and the page should be accessible via direct URL navigation.

**Validates: Requirements 17.2, 17.3**

### Property 9: Authentication Enforcement

**For any** protected service page (Transits), unauthenticated users should be redirected to the login page, and authenticated users should have access.

**Validates: Requirements 6.7, 17.4**

### Property 10: Subscription Tier Enforcement

**For any** service page with tier-based access restrictions, users without the required subscription tier should see an upgrade prompt instead of the service content.

**Validates: Requirements 17.5, 18.5**

### Property 11: API Endpoint Correctness

**For any** service page, the API call should use the correct endpoint from `api.ts`, include proper authentication headers, and handle the response correctly.

**Validates: Requirements 18.1, 18.2**

### Property 12: Dashboard Service Links

**For any** dashboard page, all 18 service page links should be displayed and clickable, and clicking a link should navigate to the correct service page.

**Validates: Requirements 17.1**

### Property 13: Form Field Presence

**For any** service page with a form, all required form fields should be present and visible on page load, and the form should be properly labeled.

**Validates: Requirements 1.2, 2.2, 3.2, 4.2, 5.2, 7.2, 8.2, 11.2, 12.2, 13.2, 14.2, 15.2**

### Property 14: API Call with Correct Parameters

**For any** service page form submission, the API should be called with the correct endpoint and parameters derived from the form input.

**Validates: Requirements 1.3, 2.3, 3.3, 4.3, 5.3, 6.2, 6.4, 7.3, 8.3, 8.5, 8.6, 9.4, 10.4, 11.3, 12.3, 13.3, 14.3, 15.3, 15.6, 18.1**

### Property 15: Streaming Response Handling

**For any** service page that supports streaming responses via SSE, real-time updates should be displayed as they arrive from the server.

**Validates: Requirements 18.6**

### Property 16: Informational Service Auto-Load

**For any** informational service page (Transits, Lunar Calendar, Crystals, Rituals) without user input, the page should automatically load and display data on mount.

**Validates: Requirements 6.2, 8.2, 8.3, 9.2, 10.2**

### Property 17: Navigation Controls for Paginated Data

**For any** service page with pagination or month/year navigation (Lunar Calendar), clicking navigation buttons should update the displayed data without losing page state.

**Validates: Requirements 8.5, 8.6**

### Property 18: Image Download Capability

**For any** service page with downloadable content (Mandala), clicking the download button should initiate a file download with appropriate filename and format.

**Validates: Requirements 15.6**

## Implementation Approach

### Phase 1: Foundation (Days 1-2)
1. Create shared service page layout component
2. Create reusable form components (question input, data input, selection)
3. Create reusable result display components
4. Create loading and error state components
5. Set up routing for all 18 service pages

### Phase 2: Question-Based Services (Days 3-5)
1. Implement Runes service page
2. Implement Lenormand service page
3. Implement Horary Astrology service page
4. Implement I Ching service page (complete existing implementation)
5. Implement Dream Interpretation service page

### Phase 3: Data-Based Services (Days 6-8)
1. Implement Numerology service page
2. Implement Synastry service page
3. Implement Solar Return service page
4. Implement Karmic Lessons service page
5. Implement Chakra Analysis service page

### Phase 4: Informational Services (Days 9-10)
1. Implement Transits service page
2. Implement Lunar Calendar service page
3. Implement Crystals service page
4. Implement Rituals service page

### Phase 5: Generative Services (Day 11)
1. Implement Mandala Generation service page

### Phase 6: Integration and Polish (Days 12-14)
1. Verify all pages follow consistent design
2. Test all API integrations
3. Test error handling and edge cases
4. Optimize performance
5. Final QA and bug fixes

## Notes

- All service pages should follow the established pattern from Tarot and Horoscope pages
- Reuse components and styling to minimize code duplication
- Ensure all pages are responsive and work on mobile devices
- Include proper error handling and user feedback
- Test all API integrations thoroughly
- Consider accessibility (ARIA labels, keyboard navigation, etc.)
- Use TypeScript for type safety
- Follow the project's code style and conventions

