# Requirements Document - Mirastros Universal

## Introduction

Mirastros Universal is a commercial AI-powered esoteric services platform offering astrology, tarot, numerology, dream interpretation, and other mystical services across multiple platforms (Web, Mobile, Telegram Mini App, VK Mini App). The system leverages Qwen 2.5-7B AI model with RAG (Retrieval-Augmented Generation) to provide personalized, context-aware predictions and interpretations.

## Glossary

- **System**: Mirastros Universal platform (all applications and backend)
- **User**: Registered user of the platform
- **AI Engine**: Qwen 2.5-7B language model with RAG capabilities
- **Natal Chart**: Astrological birth chart calculated from user's birth data
- **RAG**: Retrieval-Augmented Generation system for context-aware AI responses
- **Freemium User**: User with free tier access
- **Premium User**: User with paid Premium subscription ($9.99/month)
- **Platinum User**: User with paid Platinum subscription ($29.99/month)
- **Z-Scroll Effect**: Tunnel-like scroll animation effect (Gallery Walk)
- **Mirastros AI**: Personalized AI assistant for clarifying predictions
- **Service Type**: Category of esoteric service (horoscope, tarot, natal, etc.)
- **Backend**: FastAPI server with AI model and database
- **Frontend**: User-facing applications (Web, Mobile, Mini Apps)
- **Admin Panel**: Administrative interface for content management
- **Monorepo**: Single repository containing all applications
- **Shared Core**: Common business logic shared across platforms

## Requirements

### Requirement 1: Platform Architecture

**User Story:** As a developer, I want a monorepo architecture with shared code, so that I can maintain consistency across all platforms and reduce code duplication.

#### Acceptance Criteria

1. THE System SHALL use Nx monorepo structure with separate apps for Web, Mobile, Backend, and Admin Panel (✅ IMPLEMENTED)
2. THE System SHALL provide a shared core library containing business logic, API clients, and utility functions (⚠️ PENDING - packages/ directory needs to be created)
3. THE System SHALL ensure that all frontend applications can import from shared libraries
4. THE System SHALL use TypeScript for type safety across all JavaScript/TypeScript applications (✅ IMPLEMENTED)
5. THE System SHALL implement platform-specific abstractions for storage (localStorage for web, AsyncStorage for mobile) (⚠️ PENDING)

### Requirement 2: Backend Infrastructure

**User Story:** As a system administrator, I want a robust backend infrastructure, so that the platform can handle AI processing, data storage, and API requests efficiently.

#### Acceptance Criteria

1. THE Backend SHALL use FastAPI framework with Python 3.11+ (✅ IMPLEMENTED)
2. THE Backend SHALL integrate Qwen 2.5-7B-Instruct AI model via llama-cpp-python (✅ IMPLEMENTED - service structure ready)
3. THE Backend SHALL use PostgreSQL with asyncpg for database operations (✅ IMPLEMENTED - connection configured)
4. THE Backend SHALL implement pgvector extension for vector embeddings storage (✅ IMPLEMENTED - in requirements.txt)
5. THE Backend SHALL use Redis for caching with configurable TTL (✅ IMPLEMENTED - redis client ready)
6. THE Backend SHALL provide RESTful API endpoints with OpenAPI documentation (⚠️ PARTIAL - only /ai/predict and /documents endpoints exist)
7. THE Backend SHALL support Server-Sent Events (SSE) for streaming AI responses (⚠️ PENDING)
8. THE Backend SHALL implement RAG system with sentence-transformers for embeddings (✅ IMPLEMENTED - embedding service ready)

### Requirement 3: User Authentication

**User Story:** As a user, I want to register and log in securely, so that my personal data and subscription status are protected.

#### Acceptance Criteria

1. THE System SHALL require user registration before accessing any services
2. THE System SHALL support Email/Password authentication
3. THE System SHALL support social login (Google, Apple, VK, Telegram) based on platform
4. WHEN a user registers on Web, THE System SHALL use Email/Password or Google/Apple login
5. WHEN a user registers on Telegram Mini App, THE System SHALL use Telegram Login
6. WHEN a user registers on VK Mini App, THE System SHALL use VK ID
7. THE System SHALL store user authentication tokens securely
8. THE System SHALL synchronize user accounts across all platforms using unique user ID

### Requirement 4: Subscription Management

**User Story:** As a user, I want to subscribe to Premium or Platinum plans, so that I can access advanced features and unlimited AI consultations.

#### Acceptance Criteria

1. THE System SHALL provide three subscription tiers: Freemium (free), Premium ($9.99/month), Platinum ($29.99/month)
2. THE System SHALL integrate ЮKassa payment gateway for Russian market
3. THE System SHALL integrate Stripe payment gateway for international market
4. THE System SHALL integrate RevenueCat for mobile in-app purchases (iOS and Android)
5. THE System SHALL enforce feature access based on subscription tier
6. THE System SHALL allow users to upgrade or downgrade subscriptions
7. THE System SHALL provide annual subscription options with discount (Premium: $99/year, Platinum: $299/year)
8. THE System SHALL synchronize subscription status across all platforms in real-time

### Requirement 5: Freemium Tier Features

**User Story:** As a Freemium user, I want limited access to services, so that I can try the platform before subscribing.

#### Acceptance Criteria

1. THE System SHALL allow Freemium users to receive 1 general horoscope per day
2. THE System SHALL allow Freemium users to perform 1 Tarot reading per week (3-card spread)
3. THE System SHALL allow Freemium users to interpret 1 dream per day
4. THE System SHALL allow Freemium users to calculate numerology of their name once
5. THE System SHALL allow Freemium users to check zodiac compatibility once per day
6. THE System SHALL provide Freemium users with 7-day history archive
7. THE System SHALL display non-intrusive advertisements to Freemium users
8. THE System SHALL block "Clarify with Mirastros" AI assistant feature for Freemium users

### Requirement 6: Premium Tier Features

**User Story:** As a Premium user, I want unlimited access to core services, so that I can use the platform without restrictions.

#### Acceptance Criteria

1. THE System SHALL provide Premium users with unlimited daily, weekly, and monthly horoscopes
2. THE System SHALL provide Premium users with unlimited Tarot readings (3, 5, 10-card spreads)
3. THE System SHALL provide Premium users with personalized predictions based on birth date
4. THE System SHALL provide Premium users with full natal chart calculation and interpretation
5. THE System SHALL provide Premium users with planetary transits analysis
6. THE System SHALL provide Premium users with detailed compatibility analysis
7. THE System SHALL provide Premium users with unlimited dream interpretation
8. THE System SHALL provide Premium users with lunar calendar and recommendations
9. THE System SHALL provide Premium users with unlimited history archive
10. THE System SHALL allow Premium users to export predictions to PDF
11. THE System SHALL remove all advertisements for Premium users
12. THE System SHALL provide Premium users with email support (24-hour response time)
13. THE System SHALL enable "Clarify with Mirastros" AI assistant for Premium users with context retention

### Requirement 7: Platinum Tier Features

**User Story:** As a Platinum user, I want VIP access with personalized AI astrologer, so that I receive the highest quality service.

#### Acceptance Criteria

1. THE System SHALL provide Platinum users with all Premium features
2. THE System SHALL provide Platinum users with personalized AI Astrologer that remembers conversation history
3. THE System SHALL provide Platinum users with priority AI processing (faster response times)
4. THE System SHALL provide Platinum users with extended natal chart (houses, aspects, progressions)
5. THE System SHALL provide Platinum users with synastry analysis (partner compatibility)
6. THE System SHALL provide Platinum users with solar return chart (yearly forecast)
7. THE System SHALL provide Platinum users with horary astrology (specific question answers)
8. THE System SHALL provide Platinum users with personalized meditations and rituals
9. THE System SHALL provide Platinum users with exclusive content (articles, webinars)
10. THE System SHALL send Platinum users personalized transit notifications
11. THE System SHALL provide Platinum users with 1 live astrologer consultation per month (30 minutes)
12. THE System SHALL provide Platinum users with priority support (2-hour response time)
13. THE System SHALL provide Platinum users with early access to new features
14. THE System SHALL provide Platinum users with personalized dashboard

### Requirement 8: Natal Chart Service

**User Story:** As a user, I want to generate my natal chart, so that I can understand my astrological blueprint.

#### Acceptance Criteria

1. WHEN a user provides birth date, time, and location, THE System SHALL calculate natal chart using Swiss Ephemeris
2. THE System SHALL use Kerykeion Python library for natal chart calculations
3. THE System SHALL store natal chart data in user profile
4. THE System SHALL display planets, houses, and aspects in natal chart
5. THE System SHALL provide AI-generated interpretation of natal chart
6. THE System SHALL integrate natal chart data with other services (horoscopes, transits)
7. THE System SHALL allow users to update birth data and recalculate chart
8. THE System SHALL support multiple chart calculation systems (Placidus, Koch, Equal houses)

### Requirement 9: Tarot Reading Service

**User Story:** As a user, I want to perform Tarot readings, so that I can receive guidance on my questions.

#### Acceptance Criteria

1. THE System SHALL provide 78 Tarot cards (22 Major Arcana, 56 Minor Arcana)
2. THE System SHALL support multiple spread types: 1-card, 3-card, 5-card, 10-card (Celtic Cross)
3. WHEN a user selects cards, THE System SHALL generate AI interpretation based on card meanings and positions
4. THE System SHALL use RAG to enhance interpretations with esoteric knowledge
5. THE System SHALL store reading history for each user
6. THE System SHALL display card images with mystical design
7. THE System SHALL provide reversed card interpretations
8. THE System SHALL allow users to ask follow-up questions via "Clarify with Mirastros" (Premium/Platinum)

### Requirement 10: Horoscope Service

**User Story:** As a user, I want to read daily horoscopes, so that I can plan my day according to astrological influences.

#### Acceptance Criteria

1. THE System SHALL generate daily horoscopes for all 12 zodiac signs
2. THE System SHALL cache daily horoscopes in Redis for 24 hours
3. THE System SHALL provide weekly and monthly horoscopes for Premium/Platinum users
4. THE System SHALL personalize horoscopes based on user's natal chart (Premium/Platinum)
5. THE System SHALL integrate current planetary transits into horoscope generation
6. THE System SHALL provide compatibility horoscopes between two zodiac signs
7. THE System SHALL allow users to receive horoscope notifications
8. THE System SHALL use AI to generate unique, non-repetitive horoscope texts

### Requirement 11: Numerology Service

**User Story:** As a user, I want to calculate numerology based on my name and birth date, so that I can discover my life path number and destiny.

#### Acceptance Criteria

1. THE System SHALL calculate Life Path Number from birth date
2. THE System SHALL calculate Destiny Number from full name
3. THE System SHALL calculate Soul Urge Number from vowels in name
4. THE System SHALL calculate Personality Number from consonants in name
5. THE System SHALL provide AI-generated interpretation of numerology numbers
6. THE System SHALL explain the meaning of each number (1-9, 11, 22, 33)
7. THE System SHALL integrate numerology data with natal chart for comprehensive analysis

### Requirement 12: Dream Interpretation Service

**User Story:** As a user, I want to interpret my dreams, so that I can understand their symbolic meaning.

#### Acceptance Criteria

1. WHEN a user describes a dream, THE System SHALL use AI to interpret symbols and themes
2. THE System SHALL provide dream dictionary with common symbols
3. THE System SHALL use RAG to retrieve relevant dream interpretation knowledge
4. THE System SHALL integrate dream interpretation with user's natal chart context
5. THE System SHALL store dream journal for each user
6. THE System SHALL analyze patterns in recurring dreams (Premium/Platinum)
7. THE System SHALL provide personalized dream insights based on user's astrological profile

### Requirement 13: Meditation and Rituals Service

**User Story:** As a user, I want personalized meditations and rituals, so that I can achieve my spiritual goals.

#### Acceptance Criteria

1. THE System SHALL generate personalized meditation scripts based on user's goals (money, love, health)
2. THE System SHALL provide lunar phase rituals (new moon, full moon)
3. THE System SHALL generate daily affirmations based on user's natal chart
4. THE System SHALL provide guided meditation audio (Platinum tier)
5. THE System SHALL recommend rituals based on current planetary transits
6. THE System SHALL allow users to track meditation practice in journal

### Requirement 14: Planetary Transits Service

**User Story:** As a Premium user, I want to see current planetary transits, so that I can understand cosmic influences on my life.

#### Acceptance Criteria

1. THE System SHALL calculate current planetary positions in real-time
2. THE System SHALL compare transits with user's natal chart
3. THE System SHALL highlight significant transits (conjunctions, oppositions, squares)
4. THE System SHALL provide AI interpretation of transit effects
5. THE System SHALL send notifications for important transits (Platinum tier)
6. THE System SHALL display transit timeline for upcoming months

### Requirement 15: Synastry (Compatibility) Service

**User Story:** As a Premium user, I want to analyze compatibility with my partner, so that I can understand our relationship dynamics.

#### Acceptance Criteria

1. WHEN a user provides partner's birth data, THE System SHALL calculate synastry chart
2. THE System SHALL analyze planetary aspects between two charts
3. THE System SHALL provide compatibility score and detailed interpretation
4. THE System SHALL highlight strengths and challenges in relationship
5. THE System SHALL use AI to generate personalized relationship advice
6. THE System SHALL support multiple relationship types (romantic, friendship, business)

### Requirement 16: Runes Service

**User Story:** As a user, I want to perform runic readings, so that I can receive ancient Norse wisdom.

#### Acceptance Criteria

1. THE System SHALL provide 24 Elder Futhark runes
2. THE System SHALL support runic spreads: 1-rune, 3-rune, cross spread
3. WHEN a user draws runes, THE System SHALL generate AI interpretation
4. THE System SHALL display rune symbols with meanings
5. THE System SHALL store rune reading history
6. THE System SHALL provide reversed rune interpretations

### Requirement 17: I Ching Service

**User Story:** As a user, I want to consult I Ching, so that I can receive guidance from the Book of Changes.

#### Acceptance Criteria

1. THE System SHALL simulate coin toss or yarrow stalk method for hexagram generation
2. THE System SHALL provide all 64 hexagrams with traditional meanings
3. THE System SHALL generate AI interpretation of hexagram in user's context
4. THE System SHALL provide advice on actions based on hexagram
5. THE System SHALL display changing lines and resulting hexagram
6. THE System SHALL store I Ching consultation history

### Requirement 18: Lenormand Cards Service

**User Story:** As a user, I want to read Lenormand cards, so that I can receive concrete answers to my questions.

#### Acceptance Criteria

1. THE System SHALL provide 36 Lenormand cards
2. THE System SHALL support spreads: 3-card, 5-card, 9-card (Grand Tableau)
3. THE System SHALL generate AI interpretation of card combinations
4. THE System SHALL provide more concrete answers compared to Tarot
5. THE System SHALL display Lenormand card images
6. THE System SHALL store Lenormand reading history

### Requirement 19: "Clarify with Mirastros" AI Assistant

**User Story:** As a Premium user, I want to ask follow-up questions about my reading, so that I can get deeper insights.

#### Acceptance Criteria

1. WHEN a user receives a prediction (Tarot, horoscope, dream, etc.), THE System SHALL display "Clarify with Mirastros" button
2. WHEN a Premium or Platinum user clicks the button, THE System SHALL open chat interface with context of the reading
3. THE System SHALL maintain conversation context throughout the chat session
4. THE System SHALL use AI to answer follow-up questions based on original reading
5. THE System SHALL integrate user's natal chart data into AI responses
6. THE System SHALL store chat history for future reference
7. THE System SHALL block this feature for Freemium users with upgrade prompt

### Requirement 20: Lunar Calendar Service

**User Story:** As a Premium user, I want to see favorable days for activities, so that I can plan according to lunar phases.

#### Acceptance Criteria

1. THE System SHALL display current lunar phase
2. THE System SHALL provide recommendations for haircuts, weddings, business deals based on lunar calendar
3. THE System SHALL generate AI recommendations based on user's natal chart
4. THE System SHALL send notifications for important lunar events (Platinum tier)
5. THE System SHALL display lunar calendar for upcoming months
6. THE System SHALL explain influence of each lunar phase

### Requirement 21: Crystals and Stones Service

**User Story:** As a user, I want recommendations for crystals, so that I can use them for my goals.

#### Acceptance Criteria

1. THE System SHALL provide database of crystals with properties
2. THE System SHALL recommend crystals based on zodiac sign
3. THE System SHALL provide AI recommendations for specific goals (protection, love, wealth)
4. THE System SHALL display crystal images and descriptions
5. THE System SHALL suggest personalized amulets based on natal chart
6. THE System SHALL integrate with esoteric shop for crystal purchases

### Requirement 22: Horary Astrology Service

**User Story:** As a Platinum user, I want to ask specific questions, so that I can receive yes/no answers with timing.

#### Acceptance Criteria

1. WHEN a Platinum user asks a specific question, THE System SHALL calculate horary chart for the moment of question
2. THE System SHALL provide yes/no answer with AI explanation
3. THE System SHALL estimate timing of events
4. THE System SHALL use traditional horary astrology rules
5. THE System SHALL store horary question history

### Requirement 23: Chakra Analysis Service

**User Story:** As a user, I want to analyze my chakras, so that I can understand my energy blocks.

#### Acceptance Criteria

1. THE System SHALL diagnose chakras based on birth date
2. THE System SHALL use AI to analyze energy blocks
3. THE System SHALL provide practices for chakra balancing
4. THE System SHALL display chakra visualization
5. THE System SHALL integrate chakra analysis with natal chart

### Requirement 24: Solar Return Chart Service

**User Story:** As a Platinum user, I want yearly forecast, so that I can prepare for the year ahead.

#### Acceptance Criteria

1. WHEN a Platinum user's birthday approaches, THE System SHALL calculate solar return chart
2. THE System SHALL provide month-by-month forecast for the year
3. THE System SHALL highlight key events and themes
4. THE System SHALL use AI to personalize yearly predictions
5. THE System SHALL send birthday notification with solar return report

### Requirement 25: Signs of Fate Interpretation

**User Story:** As a user, I want to interpret signs I encounter, so that I can understand their meaning.

#### Acceptance Criteria

1. WHEN a user describes an event or sign, THE System SHALL use AI to interpret its meaning
2. THE System SHALL connect interpretation with user's natal chart
3. THE System SHALL provide advice on actions
4. THE System SHALL store interpreted signs in journal

### Requirement 26: Karmic Tasks Service

**User Story:** As a user, I want to understand my karmic lessons, so that I can work on my soul's purpose.

#### Acceptance Criteria

1. THE System SHALL analyze Lunar Nodes in natal chart
2. THE System SHALL identify karmic debts and lessons
3. THE System SHALL provide AI recommendations for soul development
4. THE System SHALL explain life purpose based on karmic analysis

### Requirement 27: Lunar Phases Influence

**User Story:** As a user, I want to understand current lunar influence, so that I can align my actions with cosmic rhythms.

#### Acceptance Criteria

1. THE System SHALL display current lunar phase
2. THE System SHALL explain influence on user's zodiac sign
3. THE System SHALL provide phase-specific recommendations
4. THE System SHALL offer new moon and full moon rituals

### Requirement 28: Mandala Generation Service

**User Story:** As a user, I want a personalized mandala, so that I can use it for meditation.

#### Acceptance Criteria

1. THE System SHALL generate personalized mandala based on birth date
2. THE System SHALL use AI to create unique mandala design
3. THE System SHALL allow users to download or print mandala
4. THE System SHALL provide meditation instructions for mandala use

### Requirement 29: Practice Journal

**User Story:** As a user, I want to keep a journal of my practices, so that I can track my spiritual progress.

#### Acceptance Criteria

1. THE System SHALL allow users to record dreams, meditations, and readings
2. THE System SHALL use AI to analyze patterns in journal entries
3. THE System SHALL provide insights from historical data
4. THE System SHALL display progress tracking visualizations
5. THE System SHALL support tagging and categorization of entries

### Requirement 30: Esoteric Shop

**User Story:** As a user, I want to purchase esoteric items, so that I can enhance my spiritual practice.

#### Acceptance Criteria

1. THE System SHALL provide online shop for crystals, tarot decks, books, and ritual items
2. THE System SHALL integrate with payment gateways (ЮKassa, Stripe)
3. THE System SHALL recommend products based on user's natal chart
4. THE System SHALL provide product descriptions and images
5. THE System SHALL support order tracking and delivery
6. THE System SHALL offer discounts for Premium/Platinum subscribers

### Requirement 31: Web Application with Z-Scroll Effect

**User Story:** As a web user, I want an immersive experience with tunnel effect, so that I feel transported into a mystical realm.

#### Acceptance Criteria

1. THE Web Application SHALL implement Z-Scroll Gallery Walk effect using GSAP and ScrollTrigger (✅ IMPLEMENTED)
2. THE Web Application SHALL display sections with zoom, blur, and fade animations (✅ IMPLEMENTED)
3. THE Web Application SHALL use zig-zag positioning for section entrance (alternating left/right) (✅ IMPLEMENTED)
4. THE Web Application SHALL provide smooth scroll-driven animations with scrub value 0.5 (✅ IMPLEMENTED)
5. THE Web Application SHALL display 3D cosmic background with stars using Three.js (⚠️ PENDING)
6. THE Web Application SHALL show scroll progress indicator (0-100%) (✅ IMPLEMENTED)
7. THE Web Application SHALL use dark theme (#050505) with gold accents (#FFD700) (✅ IMPLEMENTED)
8. THE Web Application SHALL be responsive for desktop, tablet, and mobile devices (⚠️ PENDING - needs testing)

### Requirement 32: Mobile Application

**User Story:** As a mobile user, I want a native-feeling app, so that I can access services on the go.

#### Acceptance Criteria

1. THE Mobile Application SHALL be built with React Native and Expo (✅ IMPLEMENTED)
2. THE Mobile Application SHALL use NativeWind for Tailwind CSS styling (✅ IMPLEMENTED)
3. THE Mobile Application SHALL implement Z-Scroll effect using React Native Reanimated (⚠️ PENDING - Reanimated installed but not configured)
4. THE Mobile Application SHALL support iOS and Android platforms (✅ IMPLEMENTED - Expo configured)
5. THE Mobile Application SHALL use Expo Router for navigation (✅ IMPLEMENTED)
6. THE Mobile Application SHALL integrate with device features (notifications, biometric auth) (⚠️ PENDING)
7. THE Mobile Application SHALL support offline mode for cached content (⚠️ PENDING)
8. THE Mobile Application SHALL use RevenueCat for in-app purchases (⚠️ PENDING)

### Requirement 33: Telegram Mini App

**User Story:** As a Telegram user, I want to access Mirastros without leaving Telegram, so that I can get quick predictions.

#### Acceptance Criteria

1. THE Telegram Mini App SHALL be built with Next.js as static web app (❌ NOT IMPLEMENTED - app not created)
2. THE Telegram Mini App SHALL use Telegram WebApp API for authentication (❌ NOT IMPLEMENTED)
3. THE Telegram Mini App SHALL implement simplified Z-Scroll effect for web view (❌ NOT IMPLEMENTED)
4. THE Telegram Mini App SHALL support Telegram Stars for payments (❌ NOT IMPLEMENTED)
5. THE Telegram Mini App SHALL send notifications via Telegram bot (❌ NOT IMPLEMENTED)
6. THE Telegram Mini App SHALL share the same backend API as other platforms (❌ NOT IMPLEMENTED)
7. THE Telegram Mini App SHALL use Telegram theme colors for UI consistency (❌ NOT IMPLEMENTED)

### Requirement 34: VK Mini App

**User Story:** As a VK user, I want to access Mirastros within VK, so that I can share readings with friends.

#### Acceptance Criteria

1. THE VK Mini App SHALL be built with Next.js as static web app (❌ NOT IMPLEMENTED - app not created)
2. THE VK Mini App SHALL use VK ID for authentication (❌ NOT IMPLEMENTED)
3. THE VK Mini App SHALL implement simplified Z-Scroll effect for web view (❌ NOT IMPLEMENTED)
4. THE VK Mini App SHALL support VK Pay for payments (❌ NOT IMPLEMENTED)
5. THE VK Mini App SHALL integrate with VK social features (sharing, wall posts) (❌ NOT IMPLEMENTED)
6. THE VK Mini App SHALL share the same backend API as other platforms (❌ NOT IMPLEMENTED)
7. THE VK Mini App SHALL use VK design guidelines for UI consistency (❌ NOT IMPLEMENTED)

### Requirement 35: Admin Panel

**User Story:** As an administrator, I want to manage content and users, so that I can maintain platform quality.

#### Acceptance Criteria

1. THE Admin Panel SHALL be built with Next.js (✅ IMPLEMENTED)
2. THE Admin Panel SHALL provide RAG document management (upload, edit, delete) (⚠️ PARTIAL - UI exists, functionality pending)
3. THE Admin Panel SHALL display user statistics (registrations, subscriptions, active users) (⚠️ PARTIAL - mock data displayed)
4. THE Admin Panel SHALL allow viewing and moderating user-generated content (❌ NOT IMPLEMENTED)
5. THE Admin Panel SHALL provide subscription management tools (❌ NOT IMPLEMENTED)
6. THE Admin Panel SHALL display AI usage metrics (requests, tokens, response times) (⚠️ PARTIAL - mock data displayed)
7. THE Admin Panel SHALL allow managing esoteric shop products (❌ NOT IMPLEMENTED)
8. THE Admin Panel SHALL provide role-based access control (admin, moderator, content manager) (❌ NOT IMPLEMENTED)
9. THE Admin Panel SHALL support bulk operations (PDF upload, batch user actions) (❌ NOT IMPLEMENTED)

### Requirement 36: Shared Core Library

**User Story:** As a developer, I want shared business logic, so that I can maintain consistency and reduce duplication.

#### Acceptance Criteria

1. THE Shared Core SHALL provide API client for backend communication (❌ NOT IMPLEMENTED - packages/ directory doesn't exist)
2. THE Shared Core SHALL implement Redux store for state management (❌ NOT IMPLEMENTED)
3. THE Shared Core SHALL provide utility functions (date formatting, validation, etc.) (❌ NOT IMPLEMENTED)
4. THE Shared Core SHALL define TypeScript interfaces for all data models (❌ NOT IMPLEMENTED)
5. THE Shared Core SHALL implement platform-agnostic storage abstraction (❌ NOT IMPLEMENTED)
6. THE Shared Core SHALL provide authentication helpers (❌ NOT IMPLEMENTED)
7. THE Shared Core SHALL include Tailwind theme configuration (✅ IMPLEMENTED - tailwind.preset.js exists at root)
8. THE Shared Core SHALL be importable by all frontend applications (❌ NOT IMPLEMENTED)

### Requirement 37: Design System

**User Story:** As a designer, I want a consistent design system, so that all platforms have unified visual identity.

#### Acceptance Criteria

1. THE Design System SHALL use dark cosmic theme (#050505 background) (✅ IMPLEMENTED)
2. THE Design System SHALL use gold accent color (#FFD700) (✅ IMPLEMENTED)
3. THE Design System SHALL use Cinzel font for headings (✅ IMPLEMENTED - configured in tailwind preset)
4. THE Design System SHALL use Inter font for body text (✅ IMPLEMENTED)
5. THE Design System SHALL provide Tailwind CSS configuration (✅ IMPLEMENTED - tailwind.preset.js)
6. THE Design System SHALL support NativeWind for React Native (✅ IMPLEMENTED)
7. THE Design System SHALL include animation presets (pulse-slow, float) (✅ IMPLEMENTED)
8. THE Design System SHALL provide component library (buttons, cards, inputs) (⚠️ PARTIAL - some components exist in apps, not in shared library)

### Requirement 38: Performance Optimization

**User Story:** As a user, I want fast loading times, so that I can access services without delays.

#### Acceptance Criteria

1. THE System SHALL cache horoscopes in Redis for 24 hours
2. THE System SHALL cache general AI responses in Redis for 1 hour
3. THE System SHALL use lazy loading for images and heavy components
4. THE System SHALL implement code splitting for frontend applications
5. THE System SHALL use CDN for static assets
6. THE System SHALL optimize AI model loading (load once at startup)
7. THE System SHALL use GPU acceleration for AI inference (35 layers)
8. THE System SHALL implement database connection pooling

### Requirement 39: Security

**User Story:** As a user, I want my data to be secure, so that my personal information is protected.

#### Acceptance Criteria

1. THE System SHALL encrypt user passwords using bcrypt
2. THE System SHALL use HTTPS for all communications
3. THE System SHALL implement JWT tokens for authentication
4. THE System SHALL validate all user inputs to prevent injection attacks
5. THE System SHALL implement rate limiting (60 requests per minute per user)
6. THE System SHALL use CORS to restrict API access to allowed origins
7. THE System SHALL comply with GDPR for European users
8. THE System SHALL allow users to delete their accounts and data

### Requirement 40: Monitoring and Analytics

**User Story:** As a product manager, I want usage analytics, so that I can make data-driven decisions.

#### Acceptance Criteria

1. THE System SHALL track user registrations and subscription conversions
2. THE System SHALL track service usage (which services are most popular)
3. THE System SHALL track AI performance metrics (response time, token usage)
4. THE System SHALL track user retention and churn rates
5. THE System SHALL provide analytics dashboard in Admin Panel
6. THE System SHALL integrate with external analytics (Mixpanel or Amplitude)
7. THE System SHALL track errors and exceptions (Sentry integration)
8. THE System SHALL provide health check endpoints for monitoring

---

**Document Version**: 1.0.0  
**Date**: 2025-11-21  
**Status**: Draft
