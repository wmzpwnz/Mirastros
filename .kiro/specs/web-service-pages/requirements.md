# Requirements: Web Service Pages Completion

## Introduction

The Mirastros Universal platform has 18 esoteric services available through the backend API, but only 3 are currently accessible through the web UI (Tarot, Horoscope, Natal Chart). This specification covers the implementation of the remaining 15 service pages to complete the web application's core functionality.

The implementation will follow established patterns from existing service pages (Tarot, Horoscope, Natal Chart) to ensure consistency, maintainability, and rapid development.

## Glossary

- **Service_Page**: A web page that provides user interface for a specific esoteric service
- **API_Client**: The centralized API service (`api.ts`) that communicates with the backend
- **Consultation**: A user's request for a specific service (e.g., tarot reading, dream interpretation)
- **Result_Display**: The UI component that shows the results of a consultation
- **Input_Form**: The UI component that collects user input for a consultation
- **Service_Category**: Grouping of related services (e.g., Divination, Astrology, Wellness)
- **User_Tier**: Subscription level (freemium, premium, platinum) that may restrict access
- **Streaming_Response**: Real-time data delivery using Server-Sent Events (SSE)

## Requirements

### Requirement 1: Numerology Service Page

**User Story:** As a user, I want to access the Numerology service, so that I can understand the numerical significance of my name and birth date.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/numerology`, THE System SHALL display the Numerology service page
2. WHEN the page loads, THE System SHALL display an input form requesting full name and birth date
3. WHEN a user enters valid name and birth date and clicks "Calculate", THE System SHALL call `api.calculateNumerology()` with the provided data
4. WHEN the API returns a successful response, THE System SHALL display the numerology results including destiny number, life path number, and interpretation
5. WHEN a user clicks "New Calculation", THE System SHALL reset the form and clear previous results
6. WHEN the page is loading, THE System SHALL display a loading indicator with appropriate messaging
7. IF an error occurs during calculation, THE System SHALL display an error message and allow the user to retry

### Requirement 2: Dream Interpretation Service Page

**User Story:** As a user, I want to interpret my dreams, so that I can understand their symbolic meaning and psychological significance.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/dream`, THE System SHALL display the Dream Interpretation service page
2. WHEN the page loads, THE System SHALL display a textarea for dream description input
3. WHEN a user enters a dream description and clicks "Interpret Dream", THE System SHALL call `api.interpretDream()` with the dream text
4. WHEN the API returns a successful response, THE System SHALL display the interpretation including symbols, meanings, and psychological insights
5. WHEN a user clicks "New Dream", THE System SHALL reset the form and clear previous interpretation
6. WHEN the page is loading, THE System SHALL display a loading indicator
7. IF the dream text is empty or only whitespace, THE System SHALL prevent submission and show validation error
8. IF an error occurs, THE System SHALL display an error message

### Requirement 3: Runes Service Page

**User Story:** As a user, I want to perform rune readings, so that I can gain guidance through ancient Norse divination.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/runes`, THE System SHALL display the Runes service page
2. WHEN the page loads, THE System SHALL display available spread types (e.g., single rune, three runes, five runes)
3. WHEN a user selects a spread type and enters a question, THE System SHALL call `api.getRuneReading()` with spread type and question
4. WHEN the API returns a successful response, THE System SHALL display the runes drawn and their interpretations
5. WHEN a user clicks "New Reading", THE System SHALL reset the form and clear previous results
6. WHEN the page is loading, THE System SHALL display a loading indicator
7. IF the question is empty, THE System SHALL prevent submission and show validation error
8. IF an error occurs, THE System SHALL display an error message

### Requirement 4: I Ching Service Page

**User Story:** As a user, I want to consult the I Ching, so that I can receive guidance from the ancient Book of Changes.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/iching`, THE System SHALL display the I Ching service page (already partially implemented)
2. WHEN the page loads, THE System SHALL display method selection (coin or yarrow stalk method)
3. WHEN a user enters a question and selects a method, THE System SHALL call `api.consultIChing()` with question and method
4. WHEN the API returns a successful response, THE System SHALL display the hexagram, its name, and interpretation
5. WHEN a user clicks "New Consultation", THE System SHALL reset the form and clear previous results
6. WHEN the page is loading, THE System SHALL display a loading indicator
7. IF the question is empty, THE System SHALL prevent submission and show validation error
8. IF an error occurs, THE System SHALL display an error message

### Requirement 5: Lenormand Cards Service Page

**User Story:** As a user, I want to perform Lenormand card readings, so that I can receive direct and practical guidance.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/lenormand`, THE System SHALL display the Lenormand service page
2. WHEN the page loads, THE System SHALL display available spread types
3. WHEN a user selects a spread type and enters a question, THE System SHALL call `api.getLenormandReading()` with spread type and question
4. WHEN the API returns a successful response, THE System SHALL display the cards drawn and their interpretations
5. WHEN a user clicks "New Reading", THE System SHALL reset the form and clear previous results
6. WHEN the page is loading, THE System SHALL display a loading indicator
7. IF the question is empty, THE System SHALL prevent submission and show validation error
8. IF an error occurs, THE System SHALL display an error message

### Requirement 6: Transits Service Page

**User Story:** As a user, I want to view current planetary transits, so that I can understand how planetary movements affect my life.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/transits`, THE System SHALL display the Transits service page
2. WHEN the page loads, THE System SHALL call `api.getPersonalTransits()` to fetch current transits for the user
3. WHEN the API returns a successful response, THE System SHALL display current planetary transits and their interpretations
4. WHEN a user clicks "Refresh", THE System SHALL reload the transit data
5. WHEN the page is loading, THE System SHALL display a loading indicator
6. IF an error occurs, THE System SHALL display an error message and allow retry
7. WHEN the user is not authenticated, THE System SHALL redirect to login page

### Requirement 7: Synastry Service Page

**User Story:** As a user, I want to calculate synastry between two birth charts, so that I can understand relationship compatibility.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/synastry`, THE System SHALL display the Synastry service page
2. WHEN the page loads, THE System SHALL display a form requesting birth data for two partners (date, time, location)
3. WHEN a user enters valid birth data for both partners and clicks "Calculate Compatibility", THE System SHALL call `api.calculateSynastry()` with the provided data
4. WHEN the API returns a successful response, THE System SHALL display compatibility analysis and aspect interpretations
5. WHEN a user clicks "New Calculation", THE System SHALL reset the form and clear previous results
6. WHEN the page is loading, THE System SHALL display a loading indicator
7. IF required fields are missing, THE System SHALL prevent submission and show validation errors
8. IF an error occurs, THE System SHALL display an error message

### Requirement 8: Lunar Calendar Service Page

**User Story:** As a user, I want to view the lunar calendar, so that I can plan activities according to moon phases.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/lunar`, THE System SHALL display the Lunar Calendar service page
2. WHEN the page loads, THE System SHALL display current moon phase and upcoming phases
3. WHEN the page loads, THE System SHALL call the appropriate API endpoint to fetch lunar data
4. WHEN the API returns a successful response, THE System SHALL display moon phase information and recommendations
5. WHEN a user clicks "Next Month", THE System SHALL display lunar data for the next month
6. WHEN a user clicks "Previous Month", THE System SHALL display lunar data for the previous month
7. WHEN the page is loading, THE System SHALL display a loading indicator
8. IF an error occurs, THE System SHALL display an error message

### Requirement 9: Crystals Service Page

**User Story:** As a user, I want to learn about crystals and their properties, so that I can use them for healing and spiritual purposes.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/crystals`, THE System SHALL display the Crystals service page
2. WHEN the page loads, THE System SHALL display a list of available crystals or a search interface
3. WHEN a user selects a crystal or searches for one, THE System SHALL display detailed information about the crystal including properties and uses
4. WHEN a user clicks "Get Recommendation", THE System SHALL call the appropriate API endpoint to get personalized crystal recommendations
5. WHEN the API returns a successful response, THE System SHALL display recommended crystals with explanations
6. WHEN the page is loading, THE System SHALL display a loading indicator
7. IF an error occurs, THE System SHALL display an error message

### Requirement 10: Rituals Service Page

**User Story:** As a user, I want to access ritual guidance, so that I can perform meaningful spiritual practices.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/rituals`, THE System SHALL display the Rituals service page
2. WHEN the page loads, THE System SHALL display available ritual categories or a search interface
3. WHEN a user selects a ritual or searches for one, THE System SHALL display detailed ritual instructions and guidance
4. WHEN a user clicks "Get Personalized Ritual", THE System SHALL call the appropriate API endpoint to get a ritual tailored to their needs
5. WHEN the API returns a successful response, THE System SHALL display the personalized ritual with step-by-step instructions
6. WHEN the page is loading, THE System SHALL display a loading indicator
7. IF an error occurs, THE System SHALL display an error message

### Requirement 11: Horary Astrology Service Page

**User Story:** As a user, I want to ask specific yes/no questions using horary astrology, so that I can get direct answers to pressing concerns.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/horary`, THE System SHALL display the Horary Astrology service page
2. WHEN the page loads, THE System SHALL display an input form for a specific question
3. WHEN a user enters a question and clicks "Get Answer", THE System SHALL call the appropriate API endpoint with the question
4. WHEN the API returns a successful response, THE System SHALL display the horary chart and interpretation with a clear answer
5. WHEN a user clicks "New Question", THE System SHALL reset the form and clear previous results
6. WHEN the page is loading, THE System SHALL display a loading indicator
7. IF the question is empty, THE System SHALL prevent submission and show validation error
8. IF an error occurs, THE System SHALL display an error message

### Requirement 12: Chakra Analysis Service Page

**User Story:** As a user, I want to analyze my chakras, so that I can understand my energy centers and their balance.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/chakra`, THE System SHALL display the Chakra Analysis service page
2. WHEN the page loads, THE System SHALL display a form for chakra analysis (questions or birth data)
3. WHEN a user completes the form and clicks "Analyze Chakras", THE System SHALL call the appropriate API endpoint
4. WHEN the API returns a successful response, THE System SHALL display chakra analysis with balance information and recommendations
5. WHEN a user clicks "New Analysis", THE System SHALL reset the form and clear previous results
6. WHEN the page is loading, THE System SHALL display a loading indicator
7. IF required fields are missing, THE System SHALL prevent submission and show validation errors
8. IF an error occurs, THE System SHALL display an error message

### Requirement 13: Solar Return Service Page

**User Story:** As a user, I want to view my solar return chart, so that I can understand the themes for my upcoming year.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/solar-return`, THE System SHALL display the Solar Return service page
2. WHEN the page loads, THE System SHALL display a form requesting birth data (date, time, location)
3. WHEN a user enters valid birth data and clicks "Calculate Solar Return", THE System SHALL call the appropriate API endpoint
4. WHEN the API returns a successful response, THE System SHALL display the solar return chart and yearly interpretation
5. WHEN a user clicks "New Calculation", THE System SHALL reset the form and clear previous results
6. WHEN the page is loading, THE System SHALL display a loading indicator
7. IF required fields are missing, THE System SHALL prevent submission and show validation errors
8. IF an error occurs, THE System SHALL display an error message

### Requirement 14: Karmic Lessons Service Page

**User Story:** As a user, I want to understand my karmic lessons, so that I can work on personal growth and spiritual development.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/karmic`, THE System SHALL display the Karmic Lessons service page
2. WHEN the page loads, THE System SHALL display a form requesting birth data
3. WHEN a user enters valid birth data and clicks "Reveal Karmic Lessons", THE System SHALL call the appropriate API endpoint
4. WHEN the API returns a successful response, THE System SHALL display karmic lessons and guidance for spiritual growth
5. WHEN a user clicks "New Analysis", THE System SHALL reset the form and clear previous results
6. WHEN the page is loading, THE System SHALL display a loading indicator
7. IF required fields are missing, THE System SHALL prevent submission and show validation errors
8. IF an error occurs, THE System SHALL display an error message

### Requirement 15: Mandala Generation Service Page

**User Story:** As a user, I want to generate personalized mandalas, so that I can use them for meditation and spiritual practice.

#### Acceptance Criteria

1. WHEN a user navigates to `/services/mandala`, THE System SHALL display the Mandala Generation service page
2. WHEN the page loads, THE System SHALL display options for mandala generation (based on birth data, intention, or random)
3. WHEN a user selects options and clicks "Generate Mandala", THE System SHALL call the appropriate API endpoint
4. WHEN the API returns a successful response, THE System SHALL display the generated mandala and its meaning
5. WHEN a user clicks "Generate New", THE System SHALL create a new mandala
6. WHEN a user clicks "Download", THE System SHALL allow downloading the mandala as an image
7. WHEN the page is loading, THE System SHALL display a loading indicator
8. IF an error occurs, THE System SHALL display an error message

### Requirement 16: Consistent UI/UX Across All Pages

**User Story:** As a user, I want all service pages to have consistent design and interaction patterns, so that I can navigate intuitively between services.

#### Acceptance Criteria

1. WHEN viewing any service page, THE System SHALL display a consistent header with service name and description
2. WHEN viewing any service page, THE System SHALL display a "Back to Dashboard" link
3. WHEN viewing any service page, THE System SHALL use consistent styling (colors, fonts, spacing) from the design system
4. WHEN viewing any service page, THE System SHALL display loading states consistently
5. WHEN viewing any service page, THE System SHALL display error messages consistently
6. WHEN viewing any service page, THE System SHALL display results in a consistent card-based layout
7. WHEN a user completes a consultation, THE System SHALL offer options to save, share, or clarify with Mirastros AI

### Requirement 17: Navigation and Routing

**User Story:** As a user, I want to easily navigate between service pages, so that I can access different services without friction.

#### Acceptance Criteria

1. WHEN a user is on the dashboard, THE System SHALL display links to all 18 service pages
2. WHEN a user navigates to a service page URL directly, THE System SHALL load the correct service page
3. WHEN a user clicks "Back to Dashboard", THE System SHALL return to the dashboard
4. WHEN a user is not authenticated, THE System SHALL redirect to login page when accessing protected service pages
5. WHEN a user's subscription tier doesn't allow access to a service, THE System SHALL display an upgrade prompt

### Requirement 18: API Integration Completeness

**User Story:** As a developer, I want all service pages to properly integrate with the backend API, so that users receive accurate and complete data.

#### Acceptance Criteria

1. WHEN a service page loads, THE System SHALL use the correct API endpoint from `api.ts`
2. WHEN an API call is made, THE System SHALL include proper authentication headers
3. WHEN an API call fails, THE System SHALL handle errors gracefully and display user-friendly messages
4. WHEN an API call succeeds, THE System SHALL properly normalize and display the response data
5. WHEN a user's subscription tier restricts access, THE System SHALL enforce tier-based access control
6. WHEN streaming responses are available, THE System SHALL display real-time updates using SSE

