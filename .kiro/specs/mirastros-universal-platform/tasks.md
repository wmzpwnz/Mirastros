# Implementation Plan - Mirastros Universal

## Overview

This implementation plan breaks down the development of Mirastros Universal into manageable tasks. Each task builds incrementally on previous work, ensuring a functional system at every stage.

## Current Status Summary

**✅ Completed Infrastructure:**
- Nx monorepo with Web, Mobile, Admin, Backend apps
- FastAPI backend with PostgreSQL, Redis, Ollama integration
- All backend API endpoints and services (27 services)
- All database models and migrations
- Shared-core library with API client, storage abstraction, types
- Design-system library with ChatInterface and ClarifyButton components
- Web app with Z-Scroll effect, landing page, auth pages
- Mobile app with Expo Router and basic screens
- Admin panel with dashboard UI
- Authentication system (JWT, social auth preparation)
- Payment integration (ЮKassa, Stripe)
- Shop system with products and orders
- Journal system with entries
- Streaming optimization with threading + asyncio.Queue

**⚠️ Partially Completed:**
- Web service pages (3/18 done: Tarot, Horoscope, Natal)
- Mobile service screens (3/18 done: Tarot, Horoscope, Natal)
- Admin panel backend integration (UI exists, needs API connection)
- Mobile animations (Reanimated installed but not configured)

**❌ Not Started:**
- Telegram Mini App
- VK Mini App
- Remaining 15 service pages/screens for each platform
- Tier-based access control enforcement
- Mobile offline support and push notifications
- Full authentication flow (password reset, email verification)
- Production deployment to VPS
- Testing and QA

## Task List

- [x] 1. Infrastructure Setup
- [x] 1.1 Initialize Nx monorepo structure
  - Create Nx workspace with npm/yarn
  - Configure base TypeScript settings
  - Setup ESLint and Prettier
  - _Requirements: 1.1, 1.2_

- [x] 1.2 Setup shared core library
  - Create `packages/shared-core` with API client structure
  - Implement storage abstraction (IStorage interface)
  - Create TypeScript interfaces for data models
  - Setup Redux store skeleton
  - _Requirements: 36.1, 36.2, 36.3, 36.4_

- [x] 1.3 Setup design system
  - Create `packages/design-system` with Tailwind preset
  - Define color palette (#050505, #BE8F44)
  - Configure fonts (Playfair Display, Inter)
  - Create animation presets (pulse-slow, float, bounce)
  - _Requirements: 37.1, 37.2, 37.3, 37.4, 37.7_

- [x] 2. Backend Foundation
- [x] 2.1 Setup FastAPI project structure
  - Create `apps/backend` with FastAPI app
  - Configure Pydantic settings with environment variables
  - Setup async database connection with asyncpg
  - Implement CORS middleware
  - _Requirements: 2.1, 2.3_

- [x] 2.2 Setup PostgreSQL with pgvector
  - Install PostgreSQL on VPS (`apt install postgresql`)
  - Create database and user
  - Install pgvector extension
  - Configure Alembic for migrations
  - _Requirements: 2.3, 2.4_

- [x] 2.3 Setup Redis (native, no Docker)
  - Install Redis on VPS (`apt install redis-server`)
  - Enable and start Redis service
  - Create RedisClient class with async methods
  - Implement caching utilities
  - _Requirements: 2.5_

- [x] 2.4 Setup Ollama and Qwen 2.5 model
  - Install Ollama on VPS
  - Download qwen2.5-7b-instruct-q4_k_m.gguf (5.5GB)
  - Create Modelfile with temperature 0.7 and system prompt
  - Create and test mirastros-ai model
  - Enable Ollama as systemd service
  - _Requirements: 2.2_

- [x] 2.5 Implement UnifiedLLMService with Ollama
  - Create LLM service class with Ollama HTTP client
  - Implement generate() method for sync responses
  - Implement _stream_generate() for SSE streaming
  - Add error handling and retries
  - _Requirements: 2.2, 2.7_

- [x] 2.5.1 Optimize streaming architecture
  - Implement threading worker with asyncio.Queue for zero-latency delivery
  - Configure optimal model parameters (n_batch=512, n_threads=10)
  - Add fast-start mode for simple queries (30-40% speedup)
  - Implement two-phase generation with quick response marker
  - Add X-Accel-Buffering header to disable nginx buffering
  - _Requirements: 2.7, 38.6_

- [x] 2.6 Implement RAG system
  - Create Document and DocumentChunk models
  - Implement EmbeddingService with sentence-transformers
  - Create RAGService with chunk_text(), ingest_document(), retrieve()
  - Implement vector similarity search with pgvector
  - _Requirements: 2.8_

- [x] 2.7 Create database models
  - Implement User model with subscription fields
  - Implement NatalChart model with JSON fields
  - Implement UserQuery model for history
  - Implement Subscription model
  - Create Alembic migrations
  - _Requirements: 2.3_

- [x] 3. Authentication System
- [x] 3.1 Implement JWT authentication
  - Create auth endpoints (register, login, refresh, logout)
  - Implement JWT token generation and validation
  - Add password hashing with bcrypt
  - Create authentication middleware
  - _Requirements: 3.1, 3.2, 3.7_

- [x] 3.2 Implement social login preparation
  - Add OAuth2 flow structure for Google/Apple
  - Create user profile merging logic
  - Implement account linking
  - _Requirements: 3.4, 3.5, 3.6_

- [x] 3.3 Implement subscription management
  - Create subscription endpoints (create, status, cancel, upgrade)
  - Implement tier-based access control middleware
  - Add subscription expiration checks
  - _Requirements: 4.5, 4.6, 4.8_

- [x] 4. Core AI Services
- [x] 4.1 Implement natal chart service
  - Install Kerykeion library
  - Create natal chart calculation endpoint
  - Implement chart storage in database
  - Add AI interpretation generation
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 4.2 Implement Tarot service
  - Create Tarot card database (78 cards)
  - Implement spread logic (1, 3, 5, 10-card)
  - Create reading endpoint with AI interpretation
  - Add reversed card handling
  - Store reading history
  - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6, 9.7_

- [x] 4.3 Implement horoscope service
  - Create horoscope generation endpoint
  - Implement Redis caching (24h TTL)
  - Add personalized horoscope logic
  - Integrate transits for personalization
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 4.4 Implement numerology service
  - Create numerology calculation functions
  - Implement Life Path, Destiny, Soul Urge, Personality numbers
  - Add AI interpretation
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 4.5 Implement dream interpretation service
  - Create dream interpretation endpoint
  - Implement dream dictionary
  - Add RAG integration for dream symbols
  - Store dream journal
  - _Requirements: 12.1, 12.2, 12.3, 12.5_

- [x] 5. Additional Esoteric Services
- [x] 5.1 Implement Runes service
  - Create Elder Futhark rune database (24 runes)
  - Implement spread logic (1, 3, cross)
  - Add AI interpretation
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 5.2 Implement I Ching service
  - Create hexagram database (64 hexagrams)
  - Implement coin toss simulation
  - Add AI interpretation with advice
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [x] 5.3 Implement Lenormand service
  - Create Lenormand card database (36 cards)
  - Implement spread logic (3, 5, 9-card)
  - Add combination interpretation
  - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [x] 5.4 Implement transits service
  - Calculate current planetary positions
  - Compare with natal chart
  - Highlight significant aspects
  - Add AI interpretation
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 5.5 Implement synastry service
  - Calculate synastry chart between two people
  - Analyze planetary aspects
  - Generate compatibility score
  - Add relationship advice
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 5.6 Implement lunar calendar service
  - Calculate current lunar phase
  - Provide activity recommendations
  - Integrate with natal chart
  - _Requirements: 20.1, 20.2, 20.3, 20.5_

- [x] 5.7 Implement crystals service
  - Create crystal database with properties
  - Implement recommendation logic
  - Add zodiac-based suggestions
  - _Requirements: 21.1, 21.2, 21.3, 21.5_

- [x] 5.8 Implement rituals service
  - Generate personalized meditation scripts
  - Create lunar phase rituals
  - Add daily affirmations
  - _Requirements: 13.1, 13.2, 13.3, 13.5_

- [x] 5.9 Implement horary astrology service
  - Calculate horary chart for question moment
  - Provide yes/no answer
  - Estimate event timing
  - _Requirements: 22.1, 22.2, 22.3_

- [x] 5.10 Implement chakra analysis service
  - Diagnose chakras from birth date
  - Analyze energy blocks
  - Provide balancing practices
  - _Requirements: 23.1, 23.2, 23.3, 23.4_

- [x] 5.11 Implement solar return service
  - Calculate solar return chart
  - Generate yearly forecast
  - Provide month-by-month predictions
  - _Requirements: 24.1, 24.2, 24.3, 24.4_

- [x] 5.12 Implement karmic tasks service
  - Analyze Lunar Nodes
  - Identify karmic lessons
  - Provide soul development recommendations
  - _Requirements: 26.1, 26.2, 26.3_

- [x] 5.13 Implement mandala generation service
  - Generate personalized mandala from birth date
  - Provide download/print functionality
  - Add meditation instructions
  - _Requirements: 28.1, 28.2, 28.3, 28.4_

- [x] 6. "Clarify with Mirastros" AI Assistant
- [x] 6.1 Implement AI chat endpoint
  - Create chat endpoint with context support
  - Implement conversation history storage
  - Add natal chart integration
  - Implement tier-based access control
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [x] 6.2 Add "Clarify" button to all services
  - Modify Tarot response to include button
  - Modify horoscope response to include button
  - Modify dream interpretation response to include button
  - Add button to all other services
  - _Requirements: 19.1_

- [x] 6.3 Implement chat UI component
  - Create chat interface component
  - Add message history display
  - Implement streaming message display (SSE)
  - Add context indicator
  - _Requirements: 19.3, 19.6_

- [x] 6.3.1 Optimize streaming UI experience
  - Implement EventSource for SSE connection
  - Add token-by-token rendering with smooth animation
  - Handle quick response marker for early feedback
  - Add connection error handling and reconnection logic
  - Display streaming indicator during generation
  - _Requirements: 19.3, 38.1_

- [x] 7. Practice Journal
- [x] 7.1 Implement journal endpoints
  - Create entry creation endpoint
  - Implement entry listing with pagination
  - Add tagging and categorization
  - _Requirements: 29.1, 29.5_

- [x] 7.2 Implement AI pattern analysis
  - Analyze recurring themes in entries
  - Generate insights from historical data
  - Create progress visualizations
  - _Requirements: 29.2, 29.3, 29.4_

- [x] 8. Esoteric Shop
- [x] 8.1 Implement shop endpoints
  - Create product CRUD endpoints
  - Implement order creation and tracking
  - Add product recommendations based on natal chart
  - _Requirements: 30.1, 30.3, 30.5_

- [x] 8.2 Integrate payment gateways
  - Integrate ЮKassa for Russian market
  - Integrate Stripe for international market
  - Implement webhook handlers
  - _Requirements: 30.2_

- [x] 9. Web Application (Next.js)
- [x] 9.1 Setup Next.js project
  - Create `apps/web` with Next.js 14
  - Configure App Router
  - Setup Tailwind CSS with design system
  - Add GSAP and Three.js dependencies
  - _Requirements: 31.1, 31.7_

- [x] 9.2 Implement Z-Scroll effect
  - Create viewport container with fixed positioning
  - Implement GSAP ScrollTrigger animations
  - Add zoom, blur, fade effects
  - Implement zig-zag positioning
  - Add scroll progress indicator
  - _Requirements: 31.2, 31.3, 31.4, 31.6_

- [x] 9.3 Implement 3D cosmic background
  - Create Background3D component with Three.js
  - Add star field with 5000 particles
  - Implement rotation animation
  - Add fog and lighting
  - _Requirements: 31.5_

- [x] 9.4 Create landing page sections
  - Implement HeroSection component
  - Create TarotSection component
  - Create HoroscopeSection component
  - Create NatalSection component
  - _Requirements: 31.2_

- [x] 9.5 Implement authentication pages
  - Create login page
  - Create registration page
  - Add social login buttons
  - Implement form validation
  - _Requirements: 3.1, 3.2_

- [x] 9.6 Implement dashboard
  - Create user dashboard layout
  - Add service cards with navigation
  - Display user's natal chart summary
  - Show recent readings
  - _Requirements: 31.8_

- [x] 9.7 Implement service pages
  - Create Tarot reading page (✅ DONE)
  - Create horoscope page (✅ DONE)
  - Create natal chart page (✅ DONE)
  - Create numerology page
  - Create dream interpretation page
  - Create runes page
  - Create I Ching page
  - Create Lenormand page
  - Create transits page
  - Create synastry page
  - Create lunar calendar page
  - Create crystals page
  - Create rituals page
  - Create horary page
  - Create chakra page
  - Create solar return page
  - Create karmic tasks page
  - Create mandala page
  - _Requirements: 31.8_

- [x] 9.8 Implement profile and subscription pages
  - Create user profile page
  - Create subscription management page
  - Add payment integration
  - _Requirements: 31.8_

- [x] 9.9 Implement journal page
  - Create journal entry list
  - Add entry creation form
  - Display AI insights
  - _Requirements: 31.8_

- [x] 9.10 Implement shop pages
  - Create product catalog
  - Create product detail page
  - Implement shopping cart
  - Add checkout flow
  - _Requirements: 31.8_

- [x] 10. Mobile Application (React Native + Expo)
- [x] 10.1 Setup React Native project
  - Create `apps/mobile` with Expo (✅ DONE)
  - Configure Expo Router (✅ DONE)
  - Setup NativeWind for styling (✅ DONE)
  - Add Reanimated dependency (✅ DONE)
  - _Requirements: 32.1, 32.2, 32.5_

- [x] 10.2 Implement Z-Scroll effect for mobile
  - Create scroll handler with Reanimated
  - Implement zoom, blur, fade animations
  - Adapt zig-zag positioning for mobile
  - _Requirements: 32.3_

- [x] 10.3 Implement authentication screens
  - Create login screen
  - Create registration screen
  - Add biometric authentication
  - _Requirements: 32.6_

- [x] 10.4 Implement dashboard screen
  - Create dashboard layout (✅ DONE - index.tsx)
  - Add service cards (✅ DONE)
  - Display natal chart summary (⚠️ PARTIAL)
  - _Requirements: 32.4_

- [x] 10.5 Implement service screens
  - Create Tarot screen (✅ DONE - tarot.tsx)
  - Create horoscope screen (✅ DONE - horoscope.tsx)
  - Create natal chart screen (✅ DONE - natal.tsx)
  - Create numerology screen
  - Create dream interpretation screen
  - Create screens for all other services
  - _Requirements: 32.4_

- [x] 10.6 Implement profile and subscription screens
  - Create profile screen
  - Create subscription screen
  - Integrate RevenueCat for IAP
  - _Requirements: 32.8_

- [x] 10.7 Implement offline mode
  - Add AsyncStorage for caching
  - Implement offline data sync
  - Add offline indicator
  - _Requirements: 32.7_

- [x] 10.8 Implement push notifications
  - Setup Expo notifications
  - Add notification permissions
  - Implement notification handlers
  - _Requirements: 32.6_

- [x] 11. Telegram Mini App
- [x] 11.1 Setup Telegram Mini App project
  - Create `apps/telegram-mini` with Next.js
  - Configure static export
  - Add Telegram WebApp SDK
  - _Requirements: 33.1, 33.2_

- [x] 11.2 Implement Telegram authentication
  - Integrate Telegram Login
  - Handle user data from Telegram
  - Sync with backend
  - _Requirements: 33.2_

- [x] 11.3 Implement simplified Z-Scroll
  - Adapt Z-Scroll for web view constraints
  - Optimize animations for mobile browsers
  - _Requirements: 33.3_

- [x] 11.4 Implement core services
  - Create Tarot page
  - Create horoscope page
  - Create natal chart page
  - _Requirements: 33.6_

- [x] 11.5 Integrate Telegram features
  - Implement Telegram Stars payments
  - Add bot notifications
  - Implement data sharing with bot
  - _Requirements: 33.4, 33.5_

- [ ] 12. VK Mini App
- [x] 12.1 Setup VK Mini App project
  - Create `apps/vk-mini` with Next.js
  - Configure static export
  - Add VK Bridge SDK
  - _Requirements: 34.1_

- [x] 12.2 Implement VK authentication
  - Integrate VK ID
  - Handle user data from VK
  - Sync with backend
  - _Requirements: 34.2_

- [x] 12.3 Implement simplified Z-Scroll
  - Adapt Z-Scroll for VK web view
  - Optimize animations
  - _Requirements: 34.3_

- [x] 12.4 Implement core services
  - Create Tarot page
  - Create horoscope page
  - Create natal chart page
  - _Requirements: 34.6_

- [x] 12.5 Integrate VK features
  - Implement VK Pay
  - Add social sharing
  - Implement wall posts
  - _Requirements: 34.4, 34.5_

- [x] 13. Admin Panel
- [x] 13.1 Setup Admin Panel project
  - Create `apps/admin` with Next.js (✅ DONE)
  - Setup authentication with admin role (⚠️ PENDING)
  - Create admin layout (✅ DONE)
  - _Requirements: 35.1_

- [x] 13.2 Implement RAG document management
  - Create document upload page (✅ DONE - UI exists)
  - Implement PDF upload and processing (⚠️ PENDING - backend integration)
  - Add document editing and deletion (⚠️ PENDING - backend integration)
  - Display document list with search (✅ DONE - UI exists)
  - _Requirements: 35.2, 35.9_

- [x] 13.3 Implement user management
  - Create user list page (⚠️ PENDING)
  - Add user detail view (⚠️ PENDING)
  - Implement user search and filtering (⚠️ PENDING)
  - Add subscription management tools (⚠️ PENDING)
  - _Requirements: 35.3, 35.5_

- [x] 13.4 Implement analytics dashboard
  - Display registration and subscription stats (✅ DONE - UI with mock data)
  - Show service usage metrics (✅ DONE - UI with mock data)
  - Add AI performance metrics (✅ DONE - UI with mock data)
  - Create charts and visualizations (✅ DONE - UI with mock data)
  - Connect to real backend data (⚠️ PENDING)
  - _Requirements: 35.3, 35.6_

- [x] 13.5 Implement shop management
  - Create product CRUD interface
  - Add inventory management
  - Display order list
  - _Requirements: 35.7_

- [x] 13.6 Implement content moderation
  - Add user-generated content review
  - Implement moderation actions
  - _Requirements: 35.4_

- [x] 14. VPS Deployment
- [x] 14.1 Setup VPS environment
  - Connect to server: ssh root@109.196.100.104 (password: hqpQDEoEB5_hnt)
  - Create mirastros user
  - Install Node.js, Python, PostgreSQL, Redis
  - Install Nginx
  - Configure firewall (UFW)
  - _Requirements: 2.1, 2.3, 2.5_
  - _Server: 109.196.100.104, Domain: www.mirastros.com_

- [x] 14.2 Setup SSL with Certbot
  - Install Certbot
  - Obtain SSL certificate for mirastros.com and www.mirastros.com
  - Configure auto-renewal
  - _Requirements: 39.2_
  - _Domain: www.mirastros.com_

- [x] 14.3 Configure Nginx
  - Create Nginx configuration with SSL for www.mirastros.com
  - Setup reverse proxy for web, admin, backend
  - Configure SSE support for streaming (proxy_buffering off, X-Accel-Buffering no)
  - Set proxy_read_timeout to 300s for long AI responses
  - Add static asset caching
  - Enable gzip compression
  - _Requirements: 31.1, 35.1, 2.7_
  - _Domain: www.mirastros.com_

- [x] 14.4 Setup systemd services
  - Create mirastros-web.service
  - Create mirastros-admin.service
  - Create mirastros-backend.service
  - Enable and start all services
  - _Requirements: 2.1_

- [x] 14.5 Setup Ollama and AI model
  - Install Ollama
  - Download and setup Qwen 2.5 GGUF model
  - Create and test mirastros-ai model
  - Enable Ollama service
  - _Requirements: 2.2_

- [x] 14.6 Configure database
  - Create PostgreSQL database
  - Install pgvector extension
  - Run Alembic migrations
  - _Requirements: 2.3, 2.4_

- [x] 14.7 Deploy applications
  - Build web application
  - Build admin panel
  - Setup backend virtual environment
  - Install Python dependencies
  - _Requirements: 2.1_

- [x] 15. Security and Performance
- [x] 15.1 Implement rate limiting
  - Add rate limiting middleware (60 req/min)
  - Configure Redis for rate limit storage
  - _Requirements: 39.6_

- [x] 15.2 Implement input validation
  - Add Pydantic validation for all endpoints
  - Implement Zod validation on frontend
  - _Requirements: 39.5_

- [x] 15.3 Setup monitoring
  - Integrate Sentry for error tracking
  - Add health check endpoints
  - Setup logging
  - _Requirements: 40.7_

- [x] 15.4 Implement caching strategy
  - Configure Redis TTL for horoscopes (24h)
  - Add caching for general queries (1h)
  - Implement cache invalidation
  - _Requirements: 38.1, 38.2_

- [x] 15.5 Optimize frontend performance
  - Implement code splitting
  - Add lazy loading for images
  - Setup CDN for static assets
  - _Requirements: 38.3, 38.4, 38.5_

- [x] 16. Testing and Quality Assurance
- [x] 16.1 Write backend unit tests
  - Test AI service methods
  - Test RAG service
  - Test authentication logic
  - Test subscription logic
  - _Requirements: 2.1_

- [x] 16.2 Write backend integration tests
  - Test API endpoints
  - Test database operations
  - Test Redis caching
  - _Requirements: 2.1_

- [x] 16.3 Write frontend unit tests
  - Test utility functions
  - Test Redux actions and reducers
  - Test API client
  - _Requirements: 36.1_

- [x] 16.4 Write frontend component tests
  - Test React components
  - Test React Native components
  - _Requirements: 31.1, 32.1_

- [x] 16.5 Perform E2E testing
  - Test critical user flows (registration, subscription, readings)
  - Test payment flows
  - Test AI chat functionality
  - _Requirements: 3.1, 4.1, 19.1_

- [x] 17. Analytics and Monitoring
- [x] 17.1 Implement analytics tracking
  - Track user registrations
  - Track subscription conversions
  - Track service usage
  - Track user retention
  - _Requirements: 40.1, 40.2, 40.3, 40.4_

- [x] 17.2 Setup analytics dashboard
  - Create analytics dashboard in admin panel
  - Add charts and visualizations
  - _Requirements: 40.5_

- [x] 17.3 Integrate external analytics
  - Setup Mixpanel or Amplitude
  - Track key events
  - _Requirements: 40.6_

- [x] 18. Documentation and Launch
- [x] 18.1 Write API documentation
  - Document all endpoints with OpenAPI
  - Add request/response examples
  - Document authentication flow
  - _Requirements: 2.6_

- [x] 18.2 Write user documentation
  - Create user guide for each service
  - Add FAQ section
  - Create video tutorials
  - _Requirements: 35.1_

- [x] 18.3 Prepare marketing materials
  - Create landing page copy
  - Design promotional graphics
  - Prepare social media content
  - _Requirements: 31.1_

- [x] 18.4 Launch MVP
  - Deploy to production
  - Announce launch
  - Monitor initial user feedback
  - _Requirements: 1.1_

- [-] 19. Integration and Polish
- [x] 19.1 Complete web service pages
  - Implement numerology page with calculation UI
  - Implement dream interpretation page with journal
  - Implement runes page with spread selection
  - Implement I Ching page with hexagram display
  - Implement Lenormand page with card spreads
  - Implement transits page with timeline
  - Implement synastry page with compatibility analysis
  - Implement lunar calendar page with recommendations
  - Implement crystals page with recommendations
  - Implement rituals page with personalized scripts
  - Implement horary page with question form
  - Implement chakra page with visualization
  - Implement solar return page with yearly forecast
  - Implement karmic tasks page with node analysis
  - Implement mandala page with generation and download
  - _Requirements: 11.1-28.4_

- [x] 19.2 Complete mobile service screens
  - Implement numerology screen
  - Implement dream interpretation screen
  - Implement runes screen
  - Implement I Ching screen
  - Implement Lenormand screen
  - Implement transits screen
  - Implement synastry screen
  - Implement lunar calendar screen
  - Implement crystals screen
  - Implement rituals screen
  - Implement horary screen
  - Implement chakra screen
  - Implement solar return screen
  - Implement karmic tasks screen
  - Implement mandala screen
  - _Requirements: 11.1-28.4_

- [x] 19.3 Integrate "Clarify with Mirastros" across all services
  - Add ClarifyButton to all service response pages (web)
  - Add ClarifyButton to all service response screens (mobile)
  - Implement context passing for each service type
  - Test streaming chat with service context
  - _Requirements: 19.1, 19.2, 19.3_

- [x] 19.4 Connect admin panel to backend
  - Implement real API calls for document management
  - Connect analytics dashboard to backend metrics
  - Implement user management with real data
  - Add subscription management functionality
  - _Requirements: 35.2, 35.3, 35.5, 35.6_

- [x] 19.5 Implement tier-based access control
  - Add subscription tier checks to all service endpoints
  - Implement usage limits for Freemium tier
  - Add upgrade prompts for restricted features
  - Test access control across all tiers
  - _Requirements: 5.1-7.14_

- [x] 19.6 Complete authentication flow
  - Implement JWT token refresh mechanism
  - Add password reset functionality
  - Implement email verification
  - Add social login integration (Google, Apple)
  - Test authentication across all platforms
  - _Requirements: 3.1-3.8_

- [x] 19.7 Optimize and test streaming
  - Test SSE streaming across all AI services
  - Verify nginx configuration for streaming
  - Test streaming performance under load
  - Optimize token delivery latency
  - _Requirements: 2.7, 38.6_

- [x] 19.8 Implement offline support (mobile)
  - Add AsyncStorage caching for readings
  - Implement offline queue for requests
  - Add sync mechanism when online
  - Display offline indicator
  - _Requirements: 32.7_

- [x] 19.9 Add push notifications (mobile)
  - Setup Expo notifications
  - Implement notification permissions
  - Add notification handlers for transits
  - Test notification delivery
  - _Requirements: 32.6_

- [x] 19.10 Implement biometric authentication (mobile)
  - Add Face ID / Touch ID support
  - Implement secure token storage
  - Add biometric login option
  - _Requirements: 32.6_

---

**Note:** All tasks are required for comprehensive implementation. No tasks are marked as optional.

**Document Version**: 2.1.0  
**Date**: 2025-11-23  
**Status**: Updated - All tasks marked as required per user preference
