# Implementation Plan: Web Service Pages Completion

## Overview

This implementation plan breaks down the design into discrete coding tasks to complete all 18 esoteric service pages. The plan follows a phased approach: foundation components first, then service pages grouped by type (question-based, data-based, informational, generative), and finally integration and testing.

## Tasks

- [x] 1. Set up project structure and shared components
  - Create directory structure for all 18 service pages under `apps/web/src/app/services/`
  - Create shared layout component at `apps/web/src/app/services/layout.tsx`
  - Create services index page at `apps/web/src/app/services/page.tsx` with links to all 18 services
  - _Requirements: 16.1, 16.2, 16.3, 17.1_

- [x] 1.1 Write property test for dashboard service links
  - **Property 12: Dashboard Service Links**
  - **Validates: Requirements 17.1**

- [x] 2. Create reusable form components
  - Create `QuestionForm` component for question-based services (textarea, validation)
  - Create `DataForm` component for data-based services (birth date, time, location inputs)
  - Create `SelectionForm` component for services with options (spread types, methods)
  - Implement form validation logic (empty/whitespace detection, required field validation)
  - _Requirements: 1.2, 2.2, 3.2, 4.2, 5.2, 7.2, 8.2, 11.2, 12.2, 13.2, 14.2, 15.2_

- [x] 2.1 Write property test for form validation
  - **Property 1: Form Validation Prevents Invalid Submission**
  - **Validates: Requirements 2.7, 3.7, 4.7, 5.7, 11.7, 12.7, 13.7, 14.7**

- [x] 3. Create reusable result display components
  - Create `ResultCard` component for displaying individual results
  - Create `ResultGrid` component for displaying multiple results
  - Create `ResultText` component for text-based interpretations
  - Create action buttons component (Save, Share, Clarify, Download)
  - _Requirements: 16.6, 16.7_

- [x]* 3.1 Write property test for result display consistency
  - **Property 7: Result Display Consistency**
  - **Validates: Requirements 16.6, 16.7**

- [x] 4. Create loading and error state components
  - Create `LoadingIndicator` component with service-specific messaging
  - Create `ErrorDisplay` component with retry functionality
  - Create `UpgradePrompt` component for subscription tier restrictions
  - _Requirements: 1.6, 2.6, 3.6, 4.6, 5.6, 6.5, 7.6, 8.7, 9.6, 10.6, 11.6, 12.6, 13.6, 14.6, 15.7_

- [x]* 4.1 Write property test for loading state display
  - **Property 3: Loading State Display and Button Disable**
  - **Validates: Requirements 1.6, 2.6, 3.6, 4.6, 5.6, 6.5, 7.6, 8.7, 9.6, 10.6, 11.6, 12.6, 13.6, 14.6, 15.7**

- [x]* 4.2 Write property test for error recovery
  - **Property 4: Error Recovery with Retry**
  - **Validates: Requirements 1.7, 2.8, 3.8, 4.8, 5.8, 6.6, 7.8, 8.8, 9.7, 10.7, 11.8, 12.8, 13.8, 14.8, 15.8**

- [x] 5. Implement Numerology service page
  - Create `apps/web/src/app/services/numerology/page.tsx`
  - Implement form with name and birth date inputs
  - Call `api.calculateNumerology()` with form data
  - Display results (destiny number, life path number, interpretation)
  - Implement "New Calculation" button to reset form
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x]* 5.1 Write property test for numerology API integration
  - **Property 14: API Call with Correct Parameters**
  - **Validates: Requirements 1.3**

- [x]* 5.2 Write property test for numerology result display
  - **Property 2: API Response Normalization and Display**
  - **Validates: Requirements 1.4**

- [x] 6. Implement Dream Interpretation service page
  - Create `apps/web/src/app/services/dream/page.tsx`
  - Implement textarea for dream description input
  - Validate that dream text is non-empty and non-whitespace
  - Call `api.interpretDream()` with dream text
  - Display interpretation (symbols, meanings, psychological insights)
  - Implement "New Dream" button to reset form
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x]* 6.1 Write property test for dream validation
  - **Property 1: Form Validation Prevents Invalid Submission**
  - **Validates: Requirements 2.7**

- [x]* 6.2 Write property test for dream API integration
  - **Property 14: API Call with Correct Parameters**
  - **Validates: Requirements 2.3**

- [x] 7. Implement Runes service page
  - Create `apps/web/src/app/services/runes/page.tsx`
  - Implement spread type selection (single, three, five runes)
  - Implement question textarea with validation
  - Call `api.getRuneReading()` with spread type and question
  - Display runes drawn and their interpretations
  - Implement "New Reading" button to reset form
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ]* 7.1 Write property test for runes validation
  - **Property 1: Form Validation Prevents Invalid Submission**
  - **Validates: Requirements 3.7**

- [x] 8. Implement I Ching service page
  - Create `apps/web/src/app/services/iching/page.tsx` (complete existing implementation)
  - Implement method selection (coin or yarrow stalk)
  - Implement question textarea with validation
  - Call `api.consultIChing()` with question and method
  - Display hexagram, name, and interpretation
  - Implement "New Consultation" button to reset form
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x]* 8.1 Write property test for I Ching validation
  - **Property 1: Form Validation Prevents Invalid Submission**
  - **Validates: Requirements 4.7**

- [x] 9. Implement Lenormand service page
  - Create `apps/web/src/app/services/lenormand/page.tsx`
  - Implement spread type selection
  - Implement question textarea with validation
  - Call `api.getLenormandReading()` with spread type and question
  - Display cards drawn and their interpretations
  - Implement "New Reading" button to reset form
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x]* 9.1 Write property test for Lenormand validation
  - **Property 1: Form Validation Prevents Invalid Submission**
  - **Validates: Requirements 5.7**

- [x] 10. Implement Transits service page
  - Create `apps/web/src/app/services/transits/page.tsx`
  - Implement authentication check (redirect to login if not authenticated)
  - Auto-load transits data on page mount using `api.getPersonalTransits()`
  - Display current planetary transits and interpretations
  - Implement "Refresh" button to reload transit data
  - _Requirements: 6.2, 6.3, 6.5, 6.6, 6.7_

- [x]* 10.1 Write property test for transits auto-load
  - **Property 16: Informational Service Auto-Load**
  - **Validates: Requirements 6.2**

- [x]* 10.2 Write property test for authentication enforcement
  - **Property 9: Authentication Enforcement**
  - **Validates: Requirements 6.7**

- [x] 11. Implement Synastry service page
  - Create `apps/web/src/app/services/synastry/page.tsx`
  - Implement form with birth data inputs for two partners (date, time, location)
  - Validate all required fields are present
  - Call `api.calculateSynastry()` with both partners' data
  - Display compatibility analysis and aspect interpretations
  - Implement "New Calculation" button to reset form
  - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [x]* 11.1 Write property test for synastry validation
  - **Property 1: Form Validation Prevents Invalid Submission**
  - **Validates: Requirements 7.7**

- [x] 12. Implement Lunar Calendar service page
  - Create `apps/web/src/app/services/lunar/page.tsx`
  - Auto-load current moon phase data on page mount
  - Display current moon phase and upcoming phases
  - Implement "Next Month" and "Previous Month" navigation buttons
  - Update displayed data when navigation buttons are clicked
  - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x]* 12.1 Write property test for lunar auto-load
  - **Property 16: Informational Service Auto-Load**
  - **Validates: Requirements 8.2, 8.3**

- [x]* 12.2 Write property test for lunar navigation
  - **Property 17: Navigation Controls for Paginated Data**
  - **Validates: Requirements 8.5, 8.6**

- [x] 13. Implement Crystals service page
  - Create `apps/web/src/app/services/crystals/page.tsx`
  - Display list of available crystals or search interface
  - Allow crystal selection or search
  - Display detailed crystal information (properties, uses)
  - Implement "Get Recommendation" button to fetch personalized recommendations
  - Display recommended crystals with explanations
  - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x]* 13.1 Write property test for crystals auto-load
  - **Property 16: Informational Service Auto-Load**
  - **Validates: Requirements 9.2**

- [x] 14. Implement Rituals service page
  - Create `apps/web/src/app/services/rituals/page.tsx`
  - Display available ritual categories or search interface
  - Allow ritual selection or search
  - Display detailed ritual instructions and guidance
  - Implement "Get Personalized Ritual" button to fetch tailored ritual
  - Display personalized ritual with step-by-step instructions
  - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x]* 14.1 Write property test for rituals auto-load
  - **Property 16: Informational Service Auto-Load**
  - **Validates: Requirements 10.2**

- [x] 15. Implement Horary Astrology service page
  - Create `apps/web/src/app/services/horary/page.tsx`
  - Implement form with question textarea
  - Validate question is non-empty
  - Call appropriate API endpoint with question
  - Display horary chart and interpretation with clear yes/no answer
  - Implement "New Question" button to reset form
  - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [x]* 15.1 Write property test for horary validation
  - **Property 1: Form Validation Prevents Invalid Submission**
  - **Validates: Requirements 11.7**

- [x] 16. Implement Chakra Analysis service page
  - Create `apps/web/src/app/services/chakra/page.tsx`
  - Implement form for chakra analysis (questions or birth data)
  - Validate required fields based on analysis type
  - Call appropriate API endpoint
  - Display chakra analysis with balance information and recommendations
  - Implement "New Analysis" button to reset form
  - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [x]* 16.1 Write property test for chakra validation
  - **Property 1: Form Validation Prevents Invalid Submission**
  - **Validates: Requirements 12.7**

- [x] 17. Implement Solar Return service page
  - Create `apps/web/src/app/services/solar-return/page.tsx`
  - Implement form with birth data inputs (date, time, location)
  - Validate all required fields are present
  - Call appropriate API endpoint
  - Display solar return chart and yearly interpretation
  - Implement "New Calculation" button to reset form
  - _Requirements: 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

- [x]* 17.1 Write property test for solar return validation
  - **Property 1: Form Validation Prevents Invalid Submission**
  - **Validates: Requirements 13.7**

- [x] 18. Implement Karmic Lessons service page
  - Create `apps/web/src/app/services/karmic/page.tsx`
  - Implement form with birth data inputs
  - Validate all required fields are present
  - Call appropriate API endpoint
  - Display karmic lessons and guidance for spiritual growth
  - Implement "New Analysis" button to reset form
  - _Requirements: 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_

- [x]* 18.1 Write property test for karmic validation
  - **Property 1: Form Validation Prevents Invalid Submission**
  - **Validates: Requirements 14.7**

- [x] 19. Implement Mandala Generation service page
  - Create `apps/web/src/app/services/mandala/page.tsx`
  - Implement options for mandala generation (birth data, intention, random)
  - Call appropriate API endpoint with selected options
  - Display generated mandala image and its meaning
  - Implement "Generate New" button to create new mandala
  - Implement "Download" button to download mandala as image
  - _Requirements: 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

- [x]* 19.1 Write property test for mandala download
  - **Property 18: Image Download Capability**
  - **Validates: Requirements 15.6**

- [x] 20. Implement consistent UI/UX across all pages
  - Verify all service pages display consistent header with service name and description
  - Verify all service pages display "Back to Dashboard" link
  - Verify all service pages use consistent styling from design system
  - Verify all service pages display loading states consistently
  - Verify all service pages display error messages consistently
  - Verify all service pages display results in consistent card-based layout
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [x]* 20.1 Write property test for consistent UI elements
  - **Property 6: Consistent UI Elements Across All Pages**
  - **Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5**

- [x] 21. Implement navigation and routing
  - Verify all service page routes are correctly configured
  - Verify "Back to Dashboard" links navigate to dashboard
  - Verify service pages are accessible via direct URL navigation
  - Verify unauthenticated users are redirected to login for protected pages
  - Verify subscription tier restrictions display upgrade prompts
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x]* 21.1 Write property test for navigation integrity
  - **Property 8: Navigation Integrity**
  - **Validates: Requirements 17.2, 17.3**

- [x] 22. Verify API integration completeness
  - Verify all service pages use correct API endpoints from `api.ts`
  - Verify all API calls include proper authentication headers
  - Verify API errors are handled gracefully with user-friendly messages
  - Verify API responses are properly normalized and displayed
  - Verify subscription tier-based access control is enforced
  - Verify streaming responses via SSE are displayed in real-time
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

- [x]* 22.1 Write property test for API endpoint correctness
  - **Property 11: API Endpoint Correctness**
  - **Validates: Requirements 18.1, 18.2**

- [x]* 22.2 Write property test for API response normalization
  - **Property 2: API Response Normalization and Display**
  - **Validates: Requirements 18.4**

- [x]* 22.3 Write property test for subscription tier enforcement
  - **Property 10: Subscription Tier Enforcement**
  - **Validates: Requirements 18.5**

- [x]* 22.4 Write property test for streaming response handling
  - **Property 15: Streaming Response Handling**
  - **Validates: Requirements 18.6**

- [x] 23. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all property-based tests and verify they pass
  - Verify no console errors or warnings
  - Ask the user if questions arise

- [x] 24. Final QA and bug fixes
  - Test all service pages on mobile devices
  - Test all service pages on different browsers
  - Verify accessibility (ARIA labels, keyboard navigation)
  - Fix any bugs or issues discovered
  - Optimize performance where needed
  - _Requirements: All_

- [x] 25. Final checkpoint - All tests pass and ready for deployment
  - Ensure all tests pass
  - Ensure all service pages are functional
  - Ensure all requirements are met
  - Ask the user if questions arise

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All service pages should follow the established pattern from Tarot and Horoscope pages
- Reuse components and styling to minimize code duplication
- Ensure all pages are responsive and work on mobile devices
