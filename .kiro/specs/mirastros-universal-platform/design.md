# Design Document - Mirastros Universal

## Overview

Mirastros Universal is a cross-platform esoteric services platform built as a monorepo using Nx. The system consists of multiple frontend applications (Web, Mobile, Admin Panel), a FastAPI backend with Qwen 2.5 AI model, and shared libraries. The architecture emphasizes code reuse, consistent user experience, and scalable AI-powered services.

### Current Implementation Status

**✅ Implemented:**
- Nx monorepo structure with Web, Mobile, Admin, Backend apps
- FastAPI backend with AI (LLM), RAG (embedding, documents), Redis, PostgreSQL
- Web app with Z-Scroll effect (GSAP + ScrollTrigger)
- Mobile app with Expo Router and NativeWind
- Admin panel with dashboard UI
- Tailwind design system preset

**⚠️ Partially Implemented:**
- Backend API (only /ai/predict and /documents endpoints)
- Admin panel functionality (UI exists, backend integration pending)
- Mobile app animations (Reanimated installed but not configured)

**❌ Not Implemented:**
- packages/ directory (shared-core, ui-components, design-system)
- Telegram Mini App
- VK Mini App
- Full API endpoints for all services
- Database models (User, NatalChart, Subscription, etc.)
- Authentication system
- Payment integrations

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Web App    │  Mobile App  │ Telegram MA  │   VK Mini App  │
│  (Next.js)   │ (React Native│  (Next.js)   │   (Next.js)    │
│              │   + Expo)    │              │                │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                      │
              ┌───────▼────────┐
              │  Shared Core   │
              │   Library      │
              │ (TypeScript)   │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │   Backend API  │
              │   (FastAPI)    │
              └───────┬────────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
┌──────▼─────┐ ┌─────▼──────┐ ┌────▼─────┐
│ PostgreSQL │ │   Redis    │ │ Qwen 2.5 │
│ + pgvector │ │   Cache    │ │ AI Model │
└────────────┘ └────────────┘ └──────────┘
```

### Monorepo Structure

```
mirastros-universal/
├── apps/
│   ├── web/                    # ✅ Next.js Web Application
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router
│   │   │   ├── components/    # React components (sections)
│   │   │   └── services/      # API clients (empty)
│   │   ├── public/            # Static assets
│   │   └── tailwind.config.js
│   │
│   ├── mobile/                 # ✅ React Native Mobile App
│   │   ├── app/               # Expo Router (index, horoscope, tarot, natal)
│   │   ├── src/
│   │   │   └── app/           # App components
│   │   ├── assets/            # Fonts, images
│   │   └── app.json           # Expo configuration
│   │
│   ├── admin/                  # ✅ Admin Panel
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router
│   │   │   └── components/    # Admin components
│   │   ├── public/
│   │   └── next.config.js
│   │
│   └── backend/                # ✅ FastAPI Backend
│       ├── app/
│       │   ├── api/           # API routes (ai.py, documents.py)
│       │   ├── core/          # Configuration (config, database, redis)
│       │   ├── models/        # Database models (document.py only)
│       │   └── services/      # Business logic (llm, embedding, rag)
│       ├── alembic/           # Database migrations
│       └── requirements.txt
│
├── packages/                   # ❌ NOT CREATED YET
│   ├── shared-core/           # ❌ Needs to be created
│   │   ├── src/
│   │   │   ├── api/          # API client
│   │   │   ├── store/        # Redux store
│   │   │   ├── utils/        # Utility functions
│   │   │   ├── types/        # TypeScript types
│   │   │   └── constants/    # Constants
│   │   └── package.json
│   │
│   ├── ui-components/         # ❌ Needs to be created
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Input/
│   │   │   └── Modal/
│   │   └── package.json
│   │
│   └── design-system/         # ⚠️ Partially exists (tailwind.preset.js at root)
│       ├── src/
│       │   ├── colors.ts
│       │   ├── typography.ts
│       │   └── animations.ts
│       └── tailwind.preset.js
│
├── deployment/                 # ✅ Exists
│   ├── nginx/                 # Nginx configuration
│   ├── systemd/               # Systemd services
│   └── deploy.sh              # Deployment script
│
├── tailwind.preset.js         # ✅ Design system preset
├── nx.json                    # ✅ Nx configuration
├── package.json               # ✅ Root package.json
└── tsconfig.base.json         # ✅ Base TypeScript config
```

## Components and Interfaces

### 1. Backend (FastAPI)

#### API Endpoints

**Authentication**
```
POST   /auth/register          # User registration
POST   /auth/login             # User login
POST   /auth/refresh           # Refresh JWT token
POST   /auth/logout            # User logout
GET    /auth/me                # Get current user
```

**AI Services**
```
POST   /ai/predict             # General AI prediction
POST   /ai/chat                # Chat with Mirastros AI
GET    /ai/health              # AI service health check
```

**Natal Chart**
```
POST   /natal/calculate        # Calculate natal chart
GET    /natal/{user_id}        # Get user's natal chart
PUT    /natal/{user_id}        # Update natal chart
```

**Tarot**
```
POST   /tarot/reading          # Perform tarot reading
GET    /tarot/cards            # Get all tarot cards
GET    /tarot/history          # Get reading history
```

**Horoscope**
```
GET    /horoscope/daily/{sign} # Daily horoscope
GET    /horoscope/weekly/{sign}# Weekly horoscope
GET    /horoscope/monthly/{sign}# Monthly horoscope
POST   /horoscope/personalized # Personalized horoscope
```

**Numerology**
```
POST   /numerology/calculate   # Calculate numerology
GET    /numerology/{user_id}   # Get user's numerology
```

**Dreams**
```
POST   /dreams/interpret       # Interpret dream
GET    /dreams/dictionary      # Dream symbol dictionary
GET    /dreams/history         # Dream journal
```

**Runes**
```
POST   /runes/reading          # Perform rune reading (1, 3, or cross spread)
GET    /runes/all              # Get all 24 Elder Futhark runes
GET    /runes/history          # Get reading history
GET    /runes/{rune_name}      # Get specific rune details
```

**I Ching**
```
POST   /iching/consult         # Consult I Ching (coin or yarrow method)
GET    /iching/hexagrams       # Get all 64 hexagrams
GET    /iching/hexagram/{id}   # Get specific hexagram details
GET    /iching/history         # Get consultation history
```

**Lenormand**
```
POST   /lenormand/reading      # Perform Lenormand reading (3, 5, or 9-card)
GET    /lenormand/cards        # Get all 36 Lenormand cards
GET    /lenormand/history      # Get reading history
```

**Transits**
```
GET    /transits/current       # Current planetary transits
GET    /transits/personal/{user_id} # Personal transits based on natal chart
POST   /transits/notify        # Subscribe to transit notifications (Platinum)
```

**Synastry**
```
POST   /synastry/calculate     # Calculate synastry between two charts
GET    /synastry/history       # Get synastry history
GET    /synastry/{id}          # Get specific synastry analysis
```

**Lunar Calendar**
```
GET    /lunar/current          # Current lunar phase
GET    /lunar/calendar         # Lunar calendar for upcoming months
GET    /lunar/recommendations  # Lunar recommendations (haircuts, weddings, etc.)
POST   /lunar/notify           # Subscribe to lunar notifications (Platinum)
```

**Crystals**
```
GET    /crystals/all           # Get all crystals database
GET    /crystals/recommend     # Get recommendations based on zodiac/goals
GET    /crystals/zodiac/{sign} # Get crystals for specific zodiac sign
POST   /crystals/personalized  # Get personalized amulet based on natal chart
```

**Horary Astrology** (Platinum only)
```
POST   /horary/question        # Ask specific question and get horary chart
GET    /horary/history         # Get horary question history
```

**Chakra Analysis**
```
POST   /chakra/analyze         # Analyze chakras based on birth date
GET    /chakra/practices       # Get chakra balancing practices
```

**Solar Return** (Platinum only)
```
POST   /solar-return/calculate # Calculate solar return chart
GET    /solar-return/forecast  # Get yearly forecast
```

**Signs of Fate**
```
POST   /signs/interpret        # Interpret a sign or event
GET    /signs/history          # Get interpreted signs history
```

**Karmic Tasks**
```
POST   /karmic/analyze         # Analyze karmic lessons from natal chart
GET    /karmic/recommendations # Get soul development recommendations
```

**Mandala Generation**
```
POST   /mandala/generate       # Generate personalized mandala
GET    /mandala/instructions   # Get meditation instructions
```

**Rituals**
```
POST   /rituals/generate       # Generate personalized ritual
GET    /rituals/library        # Ritual library (lunar, planetary, etc.)
GET    /rituals/lunar          # Get lunar phase rituals
POST   /rituals/personalized   # Get ritual based on natal chart and transits
```

**Journal**
```
POST   /journal/entry          # Create journal entry
GET    /journal/entries        # Get all entries
PUT    /journal/entry/{id}     # Update journal entry
DELETE /journal/entry/{id}     # Delete journal entry
GET    /journal/insights       # AI insights from journal patterns
POST   /journal/tag            # Add tags to entries
```

**Shop**
```
GET    /shop/products          # Get all products (crystals, tarot decks, books)
GET    /shop/product/{id}      # Get product details
POST   /shop/order             # Create order
GET    /shop/orders            # Get user orders
GET    /shop/order/{id}        # Get order details and tracking
POST   /shop/recommend         # Get product recommendations based on natal chart
```

**Subscriptions**
```
POST   /subscriptions/create   # Create subscription (Premium/Platinum)
GET    /subscriptions/status   # Get subscription status
POST   /subscriptions/cancel   # Cancel subscription
POST   /subscriptions/upgrade  # Upgrade subscription tier
POST   /subscriptions/downgrade # Downgrade subscription tier
GET    /subscriptions/plans    # Get available subscription plans
```

**Payments**
```
POST   /payments/create-intent # Create payment intent (Stripe/ЮKassa)
POST   /payments/webhook       # Payment webhook handler
GET    /payments/history       # Get payment history
POST   /payments/refund        # Request refund
```

**Chat (Clarify with Mirastros)**
```
POST   /chat/start             # Start chat session with context
POST   /chat/message           # Send message in chat session
GET    /chat/history/{session_id} # Get chat history
POST   /chat/stream            # Stream AI responses (SSE)
DELETE /chat/session/{id}      # End chat session
```

**Social Authentication**
```
POST   /auth/google            # Google OAuth login
POST   /auth/apple             # Apple Sign In
POST   /auth/telegram          # Telegram Login
POST   /auth/vk                # VK ID login
```

**Documents (RAG)**
```
POST   /documents/upload       # Upload document for RAG
POST   /documents/upload-pdf   # Upload PDF for RAG
GET    /documents/             # List all documents
DELETE /documents/{id}         # Delete document
```

**Admin**
```
GET    /admin/stats            # Platform statistics
GET    /admin/users            # List all users
GET    /admin/subscriptions    # Subscription analytics
```

#### Data Models

**User**
```python
class User(Base):
    id: UUID
    email: str
    password_hash: str
    full_name: str
    birth_date: date
    birth_time: time
    birth_location: str
    subscription_tier: str  # freemium, premium, platinum
    subscription_expires: datetime
    created_at: datetime
    updated_at: datetime
```

**NatalChart**
```python
class NatalChart(Base):
    id: UUID
    user_id: UUID
    planets: JSON  # Planet positions
    houses: JSON   # House cusps
    aspects: JSON  # Planetary aspects
    calculated_at: datetime
```

**UserQuery**
```python
class UserQuery(Base):
    id: UUID
    user_id: UUID
    query: str
    response: str
    service_type: str  # horoscope, tarot, natal, etc.
    context: JSON      # Additional context
    created_at: datetime
```

**Document (RAG)**
```python
class Document(Base):
    id: UUID
    title: str
    content: str
    category: str      # horoscope, tarot, astrology, etc.
    source: str
    created_at: datetime
```

**DocumentChunk**
```python
class DocumentChunk(Base):
    id: UUID
    document_id: UUID
    chunk_text: str
    chunk_index: int
    embedding: Vector  # pgvector
    created_at: datetime
```

**Subscription**
```python
class Subscription(Base):
    id: UUID
    user_id: UUID
    tier: str          # freemium, premium, platinum
    status: str        # active, cancelled, expired
    payment_method: str  # stripe, yookassa, revenucat
    amount: Decimal
    currency: str
    starts_at: datetime
    expires_at: datetime
    auto_renew: bool
    created_at: datetime
    updated_at: datetime
```

**TarotReading**
```python
class TarotReading(Base):
    id: UUID
    user_id: UUID
    spread_type: str   # one-card, three-card, celtic-cross
    cards: JSON        # Array of card objects
    question: str
    interpretation: str
    created_at: datetime
```

**RuneReading**
```python
class RuneReading(Base):
    id: UUID
    user_id: UUID
    spread_type: str   # one-rune, three-rune, cross
    runes: JSON        # Array of rune objects
    question: str
    interpretation: str
    created_at: datetime
```

**IChingConsultation**
```python
class IChingConsultation(Base):
    id: UUID
    user_id: UUID
    hexagram_number: int
    changing_lines: JSON
    resulting_hexagram: int
    question: str
    interpretation: str
    method: str        # coin, yarrow
    created_at: datetime
```

**DreamInterpretation**
```python
class DreamInterpretation(Base):
    id: UUID
    user_id: UUID
    dream_text: str
    symbols: JSON      # Extracted symbols
    interpretation: str
    mood: str
    created_at: datetime
```

**Horoscope**
```python
class Horoscope(Base):
    id: UUID
    zodiac_sign: str
    period: str        # daily, weekly, monthly
    date: date
    prediction: str
    lucky_numbers: JSON
    lucky_colors: JSON
    compatibility: JSON
    cached_until: datetime
```

**JournalEntry**
```python
class JournalEntry(Base):
    id: UUID
    user_id: UUID
    entry_type: str    # dream, meditation, reading, reflection
    title: str
    content: str
    tags: JSON
    mood: str
    created_at: datetime
    updated_at: datetime
```

**Product**
```python
class Product(Base):
    id: UUID
    name: str
    description: str
    category: str      # crystal, tarot-deck, book, ritual-item
    price: Decimal
    currency: str
    image_url: str
    stock: int
    zodiac_signs: JSON # Recommended for these signs
    created_at: datetime
```

**Order**
```python
class Order(Base):
    id: UUID
    user_id: UUID
    products: JSON     # Array of product IDs and quantities
    total_amount: Decimal
    currency: str
    status: str        # pending, paid, shipped, delivered, cancelled
    shipping_address: JSON
    tracking_number: str
    payment_id: str
    created_at: datetime
    updated_at: datetime
```

**ChatConversation**
```python
class ChatConversation(Base):
    id: UUID
    user_id: UUID
    session_id: str
    context_type: str  # tarot, horoscope, dream, natal, etc.
    context_data: JSON # Original reading/prediction data
    messages: JSON     # Array of {role, content, timestamp}
    created_at: datetime
    updated_at: datetime
```

**Payment**
```python
class Payment(Base):
    id: UUID
    user_id: UUID
    amount: Decimal
    currency: str
    payment_method: str # stripe, yookassa, revenucat
    payment_intent_id: str
    status: str        # pending, succeeded, failed, refunded
    subscription_id: UUID
    order_id: UUID
    metadata: JSON
    created_at: datetime
```

#### Services

**UnifiedLLMService**
```python
class UnifiedLLMService:
    def __init__(self):
        self.llm: Llama = None
        self.system_prompt: str = "You are Mirastros..."
    
    async def load_model(self) -> None:
        """Load Qwen 2.5 model"""
    
    async def generate(
        self,
        prompt: str,
        context: str = "",
        max_tokens: int = 512,
        temperature: float = 0.7,
        stream: bool = False
    ) -> str | AsyncGenerator:
        """Generate AI response"""
```

**RAGService**
```python
class RAGService:
    async def ingest_document(
        self,
        db: AsyncSession,
        title: str,
        content: str,
        category: str
    ) -> int:
        """Ingest document into RAG system"""
    
    async def retrieve(
        self,
        db: AsyncSession,
        query: str,
        top_k: int = 5,
        category: str = None
    ) -> List[Dict]:
        """Retrieve relevant chunks"""
    
    async def get_context(
        self,
        db: AsyncSession,
        query: str,
        category: str = None
    ) -> str:
        """Get formatted context for LLM"""
```

**EmbeddingService**
```python
class EmbeddingService:
    def __init__(self):
        self.model = None  # sentence-transformers
    
    async def load_model(self) -> None:
        """Load embedding model"""
    
    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding for text"""
    
    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for batch"""
```

**RedisClient**
```python
class RedisClient:
    async def connect(self) -> None:
        """Connect to Redis"""
    
    async def get(self, key: str) -> Any:
        """Get value from cache"""
    
    async def set(self, key: str, value: Any, ttl: int) -> None:
        """Set value in cache"""
    
    async def delete(self, key: str) -> None:
        """Delete key from cache"""
```

**NatalChartService**
```python
class NatalChartService:
    def calculate_chart(
        self,
        birth_date: date,
        birth_time: time,
        latitude: float,
        longitude: float
    ) -> Dict:
        """Calculate natal chart using Kerykeion"""
    
    def get_transits(
        self,
        natal_chart: Dict,
        date: date
    ) -> Dict:
        """Calculate current transits"""
    
    def calculate_synastry(
        self,
        chart1: Dict,
        chart2: Dict
    ) -> Dict:
        """Calculate synastry between two charts"""
    
    def calculate_solar_return(
        self,
        natal_chart: Dict,
        year: int
    ) -> Dict:
        """Calculate solar return chart for specific year"""
    
    def analyze_karmic_tasks(
        self,
        natal_chart: Dict
    ) -> Dict:
        """Analyze lunar nodes and karmic lessons"""
```

**RuneService**
```python
class RuneService:
    def __init__(self):
        self.runes = self._load_runes()  # 24 Elder Futhark runes
    
    async def perform_reading(
        self,
        spread_type: str,
        question: str,
        user_id: UUID
    ) -> Dict:
        """Perform rune reading with AI interpretation"""
    
    def get_all_runes(self) -> List[Dict]:
        """Get all runes with meanings"""
    
    async def get_interpretation(
        self,
        runes: List[str],
        question: str,
        reversed: List[bool]
    ) -> str:
        """Generate AI interpretation of rune spread"""
```

**IChingService**
```python
class IChingService:
    def __init__(self):
        self.hexagrams = self._load_hexagrams()  # 64 hexagrams
    
    async def consult(
        self,
        question: str,
        method: str,  # coin or yarrow
        user_id: UUID
    ) -> Dict:
        """Consult I Ching and generate interpretation"""
    
    def cast_hexagram(self, method: str) -> Tuple[int, List[int]]:
        """Cast hexagram using specified method"""
    
    def get_hexagram(self, number: int) -> Dict:
        """Get hexagram details"""
    
    async def generate_interpretation(
        self,
        hexagram: int,
        changing_lines: List[int],
        question: str
    ) -> str:
        """Generate AI interpretation"""
```

**LenormandService**
```python
class LenormandService:
    def __init__(self):
        self.cards = self._load_cards()  # 36 Lenormand cards
    
    async def perform_reading(
        self,
        spread_type: str,  # 3-card, 5-card, 9-card
        question: str,
        user_id: UUID
    ) -> Dict:
        """Perform Lenormand reading"""
    
    async def interpret_combination(
        self,
        cards: List[str],
        question: str
    ) -> str:
        """Interpret card combinations with AI"""
```

**LunarService**
```python
class LunarService:
    def get_current_phase(self) -> Dict:
        """Get current lunar phase"""
    
    def get_calendar(self, months: int = 3) -> List[Dict]:
        """Get lunar calendar for upcoming months"""
    
    async def get_recommendations(
        self,
        activity: str,  # haircut, wedding, business, etc.
        user_natal_chart: Dict = None
    ) -> Dict:
        """Get lunar recommendations for activity"""
    
    def calculate_favorable_days(
        self,
        start_date: date,
        end_date: date,
        activity: str
    ) -> List[date]:
        """Calculate favorable days for activity"""
```

**CrystalService**
```python
class CrystalService:
    def __init__(self):
        self.crystals = self._load_crystals()  # Crystal database
    
    def get_all_crystals(self) -> List[Dict]:
        """Get all crystals with properties"""
    
    def get_by_zodiac(self, zodiac_sign: str) -> List[Dict]:
        """Get crystals for zodiac sign"""
    
    async def recommend_for_goal(
        self,
        goal: str,  # protection, love, wealth, healing
        user_natal_chart: Dict = None
    ) -> List[Dict]:
        """Recommend crystals for specific goal"""
    
    async def generate_personalized_amulet(
        self,
        natal_chart: Dict
    ) -> Dict:
        """Generate personalized amulet recommendation"""
```

**HoraryService**
```python
class HoraryService:
    """Horary astrology service (Platinum only)"""
    
    async def answer_question(
        self,
        question: str,
        user_id: UUID
    ) -> Dict:
        """Calculate horary chart and provide answer"""
    
    def calculate_horary_chart(
        self,
        question_time: datetime,
        location: Tuple[float, float]
    ) -> Dict:
        """Calculate horary chart for moment of question"""
    
    async def interpret_horary(
        self,
        chart: Dict,
        question: str
    ) -> Dict:
        """Interpret horary chart with yes/no answer and timing"""
```

**ChakraService**
```python
class ChakraService:
    async def analyze_chakras(
        self,
        birth_date: date,
        natal_chart: Dict = None
    ) -> Dict:
        """Analyze chakras based on birth date and natal chart"""
    
    def get_balancing_practices(
        self,
        blocked_chakras: List[str]
    ) -> List[Dict]:
        """Get practices for chakra balancing"""
    
    async def generate_visualization(
        self,
        chakra_state: Dict
    ) -> Dict:
        """Generate chakra visualization data"""
```

**SignsOfFateService**
```python
class SignsOfFateService:
    async def interpret_sign(
        self,
        event_description: str,
        user_natal_chart: Dict,
        user_id: UUID
    ) -> Dict:
        """Interpret sign or event with AI"""
    
    async def provide_advice(
        self,
        interpretation: str,
        natal_chart: Dict
    ) -> str:
        """Provide actionable advice based on interpretation"""
```

**MandalaService**
```python
class MandalaService:
    async def generate_mandala(
        self,
        birth_date: date,
        natal_chart: Dict = None
    ) -> Dict:
        """Generate personalized mandala design"""
    
    def get_meditation_instructions(
        self,
        mandala_type: str
    ) -> str:
        """Get meditation instructions for mandala"""
```

**RitualService**
```python
class RitualService:
    def __init__(self):
        self.ritual_library = self._load_rituals()
    
    async def generate_personalized_ritual(
        self,
        goal: str,  # money, love, health, protection
        natal_chart: Dict,
        current_transits: Dict
    ) -> Dict:
        """Generate personalized ritual based on astrological data"""
    
    def get_lunar_rituals(self, phase: str) -> List[Dict]:
        """Get rituals for lunar phase"""
    
    def get_ritual_library(self) -> List[Dict]:
        """Get all rituals from library"""
```

**JournalService**
```python
class JournalService:
    async def create_entry(
        self,
        user_id: UUID,
        entry_type: str,
        title: str,
        content: str,
        tags: List[str] = None
    ) -> UUID:
        """Create journal entry"""
    
    async def get_entries(
        self,
        user_id: UUID,
        entry_type: str = None,
        tags: List[str] = None
    ) -> List[Dict]:
        """Get journal entries with filters"""
    
    async def analyze_patterns(
        self,
        user_id: UUID
    ) -> Dict:
        """Analyze patterns in journal entries with AI"""
    
    async def generate_insights(
        self,
        user_id: UUID,
        natal_chart: Dict
    ) -> str:
        """Generate AI insights from journal history"""
```

**ShopService**
```python
class ShopService:
    async def get_products(
        self,
        category: str = None
    ) -> List[Dict]:
        """Get all products"""
    
    async def recommend_products(
        self,
        user_natal_chart: Dict,
        user_id: UUID
    ) -> List[Dict]:
        """Recommend products based on natal chart"""
    
    async def create_order(
        self,
        user_id: UUID,
        products: List[Dict],
        shipping_address: Dict
    ) -> UUID:
        """Create order"""
    
    async def get_order_status(
        self,
        order_id: UUID
    ) -> Dict:
        """Get order status and tracking"""
```

**ChatService**
```python
class ChatService:
    """Clarify with Mirastros AI Assistant"""
    
    async def start_session(
        self,
        user_id: UUID,
        context_type: str,  # tarot, horoscope, dream, etc.
        context_data: Dict  # Original reading data
    ) -> str:
        """Start chat session with context"""
    
    async def send_message(
        self,
        session_id: str,
        message: str,
        user_natal_chart: Dict = None
    ) -> str:
        """Send message and get AI response"""
    
    async def stream_response(
        self,
        session_id: str,
        message: str,
        user_natal_chart: Dict = None
    ) -> AsyncGenerator[str, None]:
        """Stream AI response token by token"""
    
    async def get_history(
        self,
        session_id: str
    ) -> List[Dict]:
        """Get chat history"""
```

**PaymentService**
```python
class PaymentService:
    def __init__(self):
        self.stripe_client = stripe.StripeClient(api_key=STRIPE_KEY)
        self.yookassa_client = YooKassa.configure(...)
    
    async def create_payment_intent(
        self,
        user_id: UUID,
        amount: Decimal,
        currency: str,
        payment_method: str,  # stripe, yookassa
        metadata: Dict
    ) -> Dict:
        """Create payment intent"""
    
    async def handle_webhook(
        self,
        payload: Dict,
        signature: str,
        payment_method: str
    ) -> None:
        """Handle payment webhook"""
    
    async def process_subscription_payment(
        self,
        user_id: UUID,
        tier: str,
        billing_period: str  # monthly, annual
    ) -> Dict:
        """Process subscription payment"""
    
    async def refund_payment(
        self,
        payment_id: UUID,
        reason: str
    ) -> Dict:
        """Process refund"""
```

**SubscriptionService**
```python
class SubscriptionService:
    async def create_subscription(
        self,
        user_id: UUID,
        tier: str,  # premium, platinum
        billing_period: str,  # monthly, annual
        payment_method: str
    ) -> UUID:
        """Create subscription"""
    
    async def check_access(
        self,
        user_id: UUID,
        feature: str
    ) -> bool:
        """Check if user has access to feature"""
    
    async def upgrade_subscription(
        self,
        user_id: UUID,
        new_tier: str
    ) -> None:
        """Upgrade subscription tier"""
    
    async def cancel_subscription(
        self,
        user_id: UUID
    ) -> None:
        """Cancel subscription"""
    
    def get_tier_limits(self, tier: str) -> Dict:
        """Get feature limits for tier"""
```

**SocialAuthService**
```python
class SocialAuthService:
    async def authenticate_google(
        self,
        id_token: str
    ) -> Dict:
        """Authenticate with Google OAuth"""
    
    async def authenticate_apple(
        self,
        id_token: str
    ) -> Dict:
        """Authenticate with Apple Sign In"""
    
    async def authenticate_telegram(
        self,
        init_data: str
    ) -> Dict:
        """Authenticate with Telegram Login"""
    
    async def authenticate_vk(
        self,
        code: str
    ) -> Dict:
        """Authenticate with VK ID"""
    
    async def link_social_account(
        self,
        user_id: UUID,
        provider: str,
        provider_user_id: str
    ) -> None:
        """Link social account to existing user"""
```

### 2. Frontend Applications

#### Web Application (Next.js)

**Key Features:**
- Z-Scroll Gallery Walk effect with GSAP
- 3D cosmic background with Three.js
- Server-Side Rendering (SSR) for SEO
- Responsive design for all devices

**Page Structure:**
```
/                    # Landing page with Z-Scroll
/auth/login          # Login page
/auth/register       # Registration page
/dashboard           # User dashboard
/services/tarot      # Tarot reading
/services/horoscope  # Horoscope
/services/natal      # Natal chart
/services/numerology # Numerology
/services/dreams     # Dream interpretation
/services/runes      # Runes
/services/iching     # I Ching
/services/lenormand  # Lenormand
/profile             # User profile
/subscription        # Subscription management
/journal             # Practice journal
/shop                # Esoteric shop
```

**Z-Scroll Implementation:**
```typescript
// GSAP ScrollTrigger setup
const slides = gsap.utils.toArray('.mira-section');

slides.forEach((slide, i) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: `${i * vh}px top`,
      end: `${(i + 1) * vh}px top`,
      scrub: 0.5,
    }
  });
  
  // Entry animation
  if (i > 0) {
    tl.fromTo(slide, {
      opacity: 0,
      scale: 0.4,
      filter: 'blur(20px)'
    }, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      ease: 'power1.out',
      duration: 0.5
    }, 0);
  }
  
  // Exit animation
  tl.to(slide, {
    scale: 2.5,
    opacity: 0,
    filter: 'blur(10px)',
    ease: 'power1.in',
    duration: 0.5
  }, i === 0 ? 0 : 0.5);
});
```

#### Mobile Application (React Native + Expo)

**Key Features:**
- Native performance with Expo
- Z-Scroll effect with Reanimated
- NativeWind for Tailwind styling
- Offline support with AsyncStorage
- Push notifications
- Biometric authentication

**Screen Structure:**
```
/                    # Home screen
/auth/login          # Login screen
/auth/register       # Registration screen
/dashboard           # Dashboard
/services/tarot      # Tarot screen
/services/horoscope  # Horoscope screen
/services/natal      # Natal chart screen
/profile             # Profile screen
/subscription        # Subscription screen
/journal             # Journal screen
```

**Z-Scroll Implementation (Reanimated):**
```typescript
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const scrollY = useSharedValue(0);

const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    scrollY.value = event.contentOffset.y;
  }
});

const animatedStyle = useAnimatedStyle(() => {
  const scale = interpolate(
    scrollY.value,
    [0, 300, 600],
    [0.4, 1, 2.5],
    Extrapolate.CLAMP
  );
  
  const opacity = interpolate(
    scrollY.value,
    [0, 300, 600],
    [0, 1, 0],
    Extrapolate.CLAMP
  );
  
  return {
    transform: [{ scale }],
    opacity
  };
});
```

#### Telegram Mini App

**Architecture:**
- Built with Next.js as static web app
- Deployed as Telegram Web App
- Shares backend API with other platforms
- Simplified UI optimized for Telegram WebView

**Key Features:**
- Telegram WebApp API integration
- Telegram Login authentication
- Telegram Stars payments
- Bot notifications
- Simplified Z-Scroll for web view
- Telegram theme integration

**Page Structure:**
```
/                    # Home screen (simplified)
/services/tarot      # Tarot reading
/services/horoscope  # Horoscope
/services/natal      # Natal chart
/profile             # User profile
/subscription        # Subscription (Telegram Stars)
```

**Integration:**
```typescript
import { WebApp } from '@twa-dev/sdk';

// Initialize Telegram WebApp
WebApp.ready();

// Apply Telegram theme
WebApp.setHeaderColor(WebApp.themeParams.bg_color);
WebApp.setBackgroundColor(WebApp.themeParams.bg_color);

// Get user data
const user = WebApp.initDataUnsafe.user;
const initData = WebApp.initData;

// Authenticate with backend
const authResponse = await fetch('/api/auth/telegram', {
  method: 'POST',
  body: JSON.stringify({ initData })
});

// Handle payments with Telegram Stars
WebApp.openInvoice(invoiceUrl, (status) => {
  if (status === 'paid') {
    // Update subscription status
    updateSubscription();
  }
});

// Send data to bot
WebApp.sendData(JSON.stringify({ 
  action: 'reading_complete',
  reading_type: 'tarot'
}));

// Show main button
WebApp.MainButton.setText('Get Reading');
WebApp.MainButton.onClick(() => {
  // Handle action
});
WebApp.MainButton.show();

// Enable back button
WebApp.BackButton.onClick(() => {
  router.back();
});
```

**Telegram Bot Integration:**
```python
# Backend bot handler
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler

async def start(update: Update, context):
    """Send welcome message with Mini App button"""
    keyboard = [[
        InlineKeyboardButton(
            "🔮 Open Mirastros",
            web_app={"url": "https://t.me/mirastros_bot/app"}
        )
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Welcome to Mirastros! 🌟\n"
        "Your mystical AI companion for astrology, tarot, and more.",
        reply_markup=reply_markup
    )

async def notify_transit(user_id: int, transit_data: Dict):
    """Send transit notification via bot"""
    await bot.send_message(
        chat_id=user_id,
        text=f"🌙 Important Transit Alert!\n\n{transit_data['message']}"
    )
```

#### VK Mini App

**Architecture:**
- Built with Next.js as static web app
- Deployed as VK Mini App
- Shares backend API with other platforms
- VK design guidelines compliance

**Key Features:**
- VK Bridge integration
- VK ID authentication
- VK Pay payments
- VK social features (sharing, wall posts)
- Simplified Z-Scroll for web view
- VK theme integration

**Page Structure:**
```
/                    # Home screen (VK styled)
/services/tarot      # Tarot reading
/services/horoscope  # Horoscope
/services/natal      # Natal chart
/profile             # User profile
/subscription        # Subscription (VK Pay)
```

**Integration:**
```typescript
import bridge from '@vkontakte/vk-bridge';

// Initialize VK Bridge
bridge.send('VKWebAppInit');

// Get user info
const userInfo = await bridge.send('VKWebAppGetUserInfo');
console.log(userInfo); // { id, first_name, last_name, photo_url }

// Authenticate with backend
const authResponse = await fetch('/api/auth/vk', {
  method: 'POST',
  body: JSON.stringify({ 
    vk_user_id: userInfo.id,
    access_token: vkAccessToken 
  })
});

// Handle payments with VK Pay
bridge.send('VKWebAppOpenPayForm', {
  app_id: VK_APP_ID,
  action: 'pay-to-service',
  params: {
    amount: 999,
    description: 'Premium Subscription - Mirastros',
    merchant_id: MERCHANT_ID,
    sign: paymentSignature
  }
}).then((data) => {
  if (data.status) {
    // Payment successful
    updateSubscription();
  }
});

// Share reading to wall
bridge.send('VKWebAppShowWallPostBox', {
  message: 'Just got my tarot reading from Mirastros! 🔮',
  attachments: `https://mirastros.com/reading/${readingId}`
}).then((data) => {
  if (data.post_id) {
    // Shared successfully
  }
});

// Show story
bridge.send('VKWebAppShowStoryBox', {
  background_type: 'image',
  url: storyImageUrl,
  stickers: [{
    sticker_type: 'renderable',
    sticker: {
      content_type: 'image',
      url: stickerUrl
    }
  }]
});

// Request permissions
bridge.send('VKWebAppGetAuthToken', {
  app_id: VK_APP_ID,
  scope: 'friends,wall'
}).then((data) => {
  // Use access token
});
```

**VK API Integration:**
```python
# Backend VK authentication
import vk_api

async def authenticate_vk(code: str) -> Dict:
    """Authenticate user with VK OAuth"""
    # Exchange code for access token
    token_response = await vk_oauth_client.get_access_token(
        code=code,
        client_id=VK_APP_ID,
        client_secret=VK_APP_SECRET,
        redirect_uri=VK_REDIRECT_URI
    )
    
    # Get user info
    vk_session = vk_api.VkApi(token=token_response['access_token'])
    vk = vk_session.get_api()
    user_info = vk.users.get()[0]
    
    # Create or update user
    user = await get_or_create_user(
        vk_user_id=user_info['id'],
        first_name=user_info['first_name'],
        last_name=user_info['last_name']
    )
    
    return {
        'user': user,
        'access_token': create_jwt_token(user.id)
    }
```

#### Admin Panel

**Key Features:**
- RAG document management
- User management
- Subscription analytics
- AI usage metrics
- Shop product management

**Page Structure:**
```
/admin/dashboard     # Overview dashboard
/admin/users         # User management
/admin/documents     # RAG documents
/admin/subscriptions # Subscription analytics
/admin/shop          # Shop management
/admin/analytics     # AI usage analytics
/admin/settings      # Platform settings
```

### 3. Shared Core Library

**Structure:**
```typescript
// API Client
export class MirastrosAPI {
  constructor(baseURL: string, token?: string);
  
  // Auth
  async register(email: string, password: string): Promise<User>;
  async login(email: string, password: string): Promise<AuthResponse>;
  
  // Services
  async getTarotReading(spread: string): Promise<TarotReading>;
  async getHoroscope(sign: string): Promise<Horoscope>;
  async calculateNatalChart(birthData: BirthData): Promise<NatalChart>;
  
  // AI Chat
  async chatWithMirastros(message: string, context: any): Promise<string>;
}

// Redux Store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    services: servicesReducer,
    subscription: subscriptionReducer,
    journal: journalReducer
  }
});

// Utility Functions
export const formatDate = (date: Date): string => { /* ... */ };
export const validateEmail = (email: string): boolean => { /* ... */ };
export const calculateZodiacSign = (date: Date): string => { /* ... */ };

// Storage Abstraction
export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Web implementation
export class WebStorage implements IStorage {
  async getItem(key: string) {
    return localStorage.getItem(key);
  }
  // ...
}

// Mobile implementation
export class MobileStorage implements IStorage {
  async getItem(key: string) {
    return AsyncStorage.getItem(key);
  }
  // ...
}
```

## Data Models

### User Profile
```typescript
interface User {
  id: string;
  email: string;
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthLocation: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  zodiacSign: string;
  subscriptionTier: 'freemium' | 'premium' | 'platinum';
  subscriptionExpires: string;
  createdAt: string;
}
```

### Natal Chart
```typescript
interface NatalChart {
  id: string;
  userId: string;
  planets: {
    sun: PlanetPosition;
    moon: PlanetPosition;
    mercury: PlanetPosition;
    venus: PlanetPosition;
    mars: PlanetPosition;
    jupiter: PlanetPosition;
    saturn: PlanetPosition;
    uranus: PlanetPosition;
    neptune: PlanetPosition;
    pluto: PlanetPosition;
  };
  houses: HousePosition[];
  aspects: Aspect[];
  calculatedAt: string;
}

interface PlanetPosition {
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;  // conjunction, opposition, trine, square, sextile
  orb: number;
}
```

### Tarot Reading
```typescript
interface TarotReading {
  id: string;
  userId: string;
  spread: string;  // one-card, three-card, celtic-cross
  cards: TarotCard[];
  interpretation: string;
  question?: string;
  createdAt: string;
}

interface TarotCard {
  id: string;
  name: string;
  suit: string;
  number: number;
  position: string;
  reversed: boolean;
  meaning: string;
  imageUrl: string;
}
```

### Horoscope
```typescript
interface Horoscope {
  id: string;
  sign: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: string;
  prediction: string;
  luckyNumbers: number[];
  luckyColors: string[];
  compatibility: string[];
  advice: string;
}
```

## Subscription Tier Enforcement

### Tier Feature Matrix

| Feature | Freemium | Premium | Platinum |
|---------|----------|---------|----------|
| Daily Horoscope | 1/day | Unlimited | Unlimited |
| Weekly/Monthly Horoscope | ❌ | ✅ | ✅ |
| Tarot Reading | 1/week (3-card) | Unlimited (3,5,10-card) | Unlimited (all spreads) |
| Natal Chart | ❌ | Basic | Extended (houses, aspects, progressions) |
| Dream Interpretation | 1/day | Unlimited | Unlimited |
| Numerology | 1 calculation | Unlimited | Unlimited |
| Compatibility | 1/day | Unlimited | Unlimited |
| Planetary Transits | ❌ | ✅ | ✅ + Notifications |
| Synastry | ❌ | ✅ | ✅ |
| Solar Return | ❌ | ❌ | ✅ |
| Horary Astrology | ❌ | ❌ | ✅ |
| Runes | ❌ | ✅ | ✅ |
| I Ching | ❌ | ✅ | ✅ |
| Lenormand | ❌ | ✅ | ✅ |
| Lunar Calendar | ❌ | ✅ | ✅ + Notifications |
| Crystals | View only | Recommendations | Personalized amulets |
| Rituals | ❌ | Library access | Personalized rituals |
| Chakra Analysis | ❌ | ✅ | ✅ |
| Karmic Tasks | ❌ | ✅ | ✅ |
| Mandala Generation | ❌ | ✅ | ✅ |
| Signs of Fate | ❌ | ✅ | ✅ |
| Clarify with Mirastros | ❌ | ✅ (context retention) | ✅ (priority processing) |
| Practice Journal | 7-day history | Unlimited history | Unlimited + AI insights |
| History Archive | 7 days | Unlimited | Unlimited |
| PDF Export | ❌ | ✅ | ✅ |
| Advertisements | ✅ | ❌ | ❌ |
| Support | Community | Email (24h) | Priority (2h) |
| Live Consultation | ❌ | ❌ | 1/month (30 min) |
| Shop Discount | 0% | 10% | 20% |

### Access Control Implementation

**Backend Middleware:**
```python
from functools import wraps
from fastapi import HTTPException, Depends

def require_subscription(min_tier: str):
    """Decorator to enforce subscription tier"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_user), **kwargs):
            tier_hierarchy = {
                'freemium': 0,
                'premium': 1,
                'platinum': 2
            }
            
            user_tier_level = tier_hierarchy.get(current_user.subscription_tier, 0)
            required_tier_level = tier_hierarchy.get(min_tier, 0)
            
            if user_tier_level < required_tier_level:
                raise HTTPException(
                    status_code=403,
                    detail={
                        'error': 'subscription_required',
                        'message': f'{min_tier.capitalize()} subscription required',
                        'current_tier': current_user.subscription_tier,
                        'required_tier': min_tier,
                        'upgrade_url': '/subscription'
                    }
                )
            
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Usage example
@router.post("/synastry/calculate")
@require_subscription('premium')
async def calculate_synastry(
    data: SynastryRequest,
    current_user: User = Depends(get_current_user)
):
    """Calculate synastry (Premium+)"""
    return await synastry_service.calculate(data, current_user.id)
```

**Rate Limiting by Tier:**
```python
from datetime import datetime, timedelta
from typing import Dict

class RateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.limits = {
            'freemium': {
                'horoscope': {'count': 1, 'period': 'day'},
                'tarot': {'count': 1, 'period': 'week'},
                'dream': {'count': 1, 'period': 'day'},
            },
            'premium': {
                # No limits for premium
            },
            'platinum': {
                # No limits for platinum
            }
        }
    
    async def check_limit(
        self,
        user_id: UUID,
        service: str,
        tier: str
    ) -> bool:
        """Check if user has exceeded rate limit"""
        if tier in ['premium', 'platinum']:
            return True  # No limits
        
        limit_config = self.limits.get(tier, {}).get(service)
        if not limit_config:
            return True  # No limit configured
        
        key = f"rate_limit:{user_id}:{service}:{limit_config['period']}"
        
        # Get current count
        count = await self.redis.get(key)
        if count is None:
            count = 0
        else:
            count = int(count)
        
        if count >= limit_config['count']:
            return False  # Limit exceeded
        
        # Increment count
        await self.redis.incr(key)
        
        # Set expiry based on period
        if limit_config['period'] == 'day':
            ttl = 86400  # 24 hours
        elif limit_config['period'] == 'week':
            ttl = 604800  # 7 days
        
        await self.redis.expire(key, ttl)
        
        return True

# Usage in endpoint
@router.post("/horoscope/daily")
async def get_daily_horoscope(
    sign: str,
    current_user: User = Depends(get_current_user),
    rate_limiter: RateLimiter = Depends(get_rate_limiter)
):
    """Get daily horoscope"""
    # Check rate limit
    can_proceed = await rate_limiter.check_limit(
        current_user.id,
        'horoscope',
        current_user.subscription_tier
    )
    
    if not can_proceed:
        raise HTTPException(
            status_code=429,
            detail={
                'error': 'rate_limit_exceeded',
                'message': 'Daily horoscope limit reached',
                'upgrade_url': '/subscription'
            }
        )
    
    return await horoscope_service.get_daily(sign)
```

**Frontend Access Control:**
```typescript
// Shared Core - Access Control Utility
export const checkFeatureAccess = (
  feature: string,
  userTier: 'freemium' | 'premium' | 'platinum'
): { hasAccess: boolean; requiredTier?: string } => {
  const featureAccess = {
    'synastry': 'premium',
    'solar_return': 'platinum',
    'horary': 'platinum',
    'clarify_ai': 'premium',
    'personalized_rituals': 'platinum',
    'transit_notifications': 'platinum',
    'live_consultation': 'platinum',
  };
  
  const requiredTier = featureAccess[feature];
  
  if (!requiredTier) {
    return { hasAccess: true };
  }
  
  const tierHierarchy = {
    'freemium': 0,
    'premium': 1,
    'platinum': 2
  };
  
  const hasAccess = tierHierarchy[userTier] >= tierHierarchy[requiredTier];
  
  return {
    hasAccess,
    requiredTier: hasAccess ? undefined : requiredTier
  };
};

// React component example
const TarotReadingPage = () => {
  const { user } = useAuth();
  const { hasAccess, requiredTier } = checkFeatureAccess('tarot', user.subscriptionTier);
  
  if (!hasAccess) {
    return (
      <UpgradePrompt
        feature="Tarot Readings"
        requiredTier={requiredTier}
        currentTier={user.subscriptionTier}
      />
    );
  }
  
  return <TarotReading />;
};

// Clarify button with access control
const ClarifyButton = ({ readingData }) => {
  const { user } = useAuth();
  const { hasAccess } = checkFeatureAccess('clarify_ai', user.subscriptionTier);
  
  if (!hasAccess) {
    return (
      <button onClick={() => showUpgradeModal('clarify_ai')}>
        🔒 Clarify with Mirastros (Premium)
      </button>
    );
  }
  
  return (
    <button onClick={() => startClarifySession(readingData)}>
      ✨ Clarify with Mirastros
    </button>
  );
};
```

**Subscription Synchronization:**
```python
class SubscriptionSyncService:
    """Synchronize subscription status across platforms"""
    
    async def sync_subscription(
        self,
        user_id: UUID,
        platform: str,  # web, mobile, telegram, vk
        subscription_data: Dict
    ) -> None:
        """Sync subscription from payment platform"""
        
        # Update database
        await self.db.execute(
            """
            UPDATE users
            SET subscription_tier = :tier,
                subscription_expires = :expires,
                updated_at = NOW()
            WHERE id = :user_id
            """,
            {
                'tier': subscription_data['tier'],
                'expires': subscription_data['expires_at'],
                'user_id': user_id
            }
        )
        
        # Invalidate cache
        await self.redis.delete(f"user:{user_id}:subscription")
        
        # Notify other platforms via WebSocket
        await self.websocket_manager.broadcast_to_user(
            user_id,
            {
                'type': 'subscription_updated',
                'tier': subscription_data['tier'],
                'expires_at': subscription_data['expires_at']
            }
        )
        
        # Send confirmation email
        await self.email_service.send_subscription_confirmation(
            user_id,
            subscription_data
        )
```

## Payment Integration Architecture

### Payment Gateway Strategy

**Multi-Gateway Approach:**
- **Stripe**: International payments (credit cards, Apple Pay, Google Pay)
- **ЮKassa (YooKassa)**: Russian market (cards, SBP, wallets)
- **RevenueCat**: Mobile in-app purchases (iOS App Store, Google Play)
- **Telegram Stars**: Telegram Mini App payments
- **VK Pay**: VK Mini App payments

### Payment Flow Architecture

```
User initiates payment
    ↓
Frontend creates payment intent
    ↓
Backend /payments/create-intent
    ↓
Select payment gateway based on:
- User location
- Platform (web/mobile/mini-app)
- Payment method preference
    ↓
Create payment intent with gateway
    ↓
Return client_secret to frontend
    ↓
Frontend completes payment with gateway SDK
    ↓
Gateway sends webhook to backend
    ↓
Backend /payments/webhook
    ↓
Verify webhook signature
    ↓
Update subscription status
    ↓
Sync across all platforms
    ↓
Send confirmation to user
```

### Stripe Integration

**Backend Implementation:**
```python
import stripe
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripePaymentService:
    async def create_subscription_payment(
        self,
        user_id: UUID,
        tier: str,
        billing_period: str
    ) -> Dict:
        """Create Stripe subscription payment"""
        
        # Get or create Stripe customer
        user = await self.get_user(user_id)
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                metadata={'user_id': str(user_id)}
            )
            user.stripe_customer_id = customer.id
            await self.update_user(user)
        
        # Get price ID based on tier and period
        price_id = self.get_price_id(tier, billing_period)
        
        # Create subscription
        subscription = stripe.Subscription.create(
            customer=user.stripe_customer_id,
            items=[{'price': price_id}],
            payment_behavior='default_incomplete',
            payment_settings={
                'save_default_payment_method': 'on_subscription'
            },
            expand=['latest_invoice.payment_intent'],
            metadata={
                'user_id': str(user_id),
                'tier': tier,
                'billing_period': billing_period
            }
        )
        
        return {
            'subscription_id': subscription.id,
            'client_secret': subscription.latest_invoice.payment_intent.client_secret
        }
    
    async def handle_webhook(
        self,
        payload: bytes,
        signature: str
    ) -> None:
        """Handle Stripe webhook"""
        try:
            event = stripe.Webhook.construct_event(
                payload,
                signature,
                settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Handle different event types
        if event.type == 'invoice.payment_succeeded':
            await self.handle_payment_succeeded(event.data.object)
        elif event.type == 'invoice.payment_failed':
            await self.handle_payment_failed(event.data.object)
        elif event.type == 'customer.subscription.deleted':
            await self.handle_subscription_cancelled(event.data.object)
    
    def get_price_id(self, tier: str, billing_period: str) -> str:
        """Get Stripe price ID"""
        prices = {
            ('premium', 'monthly'): 'price_premium_monthly',
            ('premium', 'annual'): 'price_premium_annual',
            ('platinum', 'monthly'): 'price_platinum_monthly',
            ('platinum', 'annual'): 'price_platinum_annual',
        }
        return prices.get((tier, billing_period))
```

**Frontend Implementation:**
```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ tier, billingPeriod }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  
  useEffect(() => {
    // Create payment intent
    fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, billingPeriod, gateway: 'stripe' })
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.client_secret));
  }, [tier, billingPeriod]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/success`,
      },
    });
    
    if (error) {
      console.error(error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>
        Subscribe
      </button>
    </form>
  );
};

const SubscriptionPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm tier="premium" billingPeriod="monthly" />
    </Elements>
  );
};
```

### ЮKassa Integration

**Backend Implementation:**
```python
from yookassa import Configuration, Payment

Configuration.account_id = settings.YOOKASSA_SHOP_ID
Configuration.secret_key = settings.YOOKASSA_SECRET_KEY

class YooKassaPaymentService:
    async def create_subscription_payment(
        self,
        user_id: UUID,
        tier: str,
        billing_period: str
    ) -> Dict:
        """Create YooKassa payment"""
        
        amount = self.get_amount(tier, billing_period)
        
        payment = Payment.create({
            "amount": {
                "value": str(amount),
                "currency": "RUB"
            },
            "confirmation": {
                "type": "redirect",
                "return_url": f"{settings.FRONTEND_URL}/subscription/success"
            },
            "capture": True,
            "description": f"Mirastros {tier.capitalize()} - {billing_period}",
            "metadata": {
                "user_id": str(user_id),
                "tier": tier,
                "billing_period": billing_period
            },
            "save_payment_method": True
        }, uuid.uuid4())
        
        return {
            'payment_id': payment.id,
            'confirmation_url': payment.confirmation.confirmation_url
        }
    
    async def handle_webhook(
        self,
        payload: Dict
    ) -> None:
        """Handle YooKassa webhook"""
        event_type = payload.get('event')
        payment_data = payload.get('object')
        
        if event_type == 'payment.succeeded':
            await self.handle_payment_succeeded(payment_data)
        elif event_type == 'payment.canceled':
            await self.handle_payment_failed(payment_data)
    
    def get_amount(self, tier: str, billing_period: str) -> Decimal:
        """Get payment amount in rubles"""
        amounts = {
            ('premium', 'monthly'): Decimal('999'),
            ('premium', 'annual'): Decimal('9990'),
            ('platinum', 'monthly'): Decimal('2999'),
            ('platinum', 'annual'): Decimal('29990'),
        }
        return amounts.get((tier, billing_period))
```

### RevenueCat Integration (Mobile)

**Backend Implementation:**
```python
import requests

class RevenueCatService:
    def __init__(self):
        self.api_key = settings.REVENUECAT_API_KEY
        self.base_url = "https://api.revenuecat.com/v1"
    
    async def verify_purchase(
        self,
        user_id: UUID,
        receipt_data: str,
        platform: str  # ios or android
    ) -> Dict:
        """Verify purchase with RevenueCat"""
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f"{self.base_url}/receipts",
            headers=headers,
            json={
                'app_user_id': str(user_id),
                'fetch_token': receipt_data,
                'platform': platform
            }
        )
        
        data = response.json()
        
        # Check active subscriptions
        subscriber = data.get('subscriber', {})
        entitlements = subscriber.get('entitlements', {})
        
        active_tier = None
        expires_at = None
        
        if 'premium' in entitlements and entitlements['premium']['expires_date']:
            active_tier = 'premium'
            expires_at = entitlements['premium']['expires_date']
        elif 'platinum' in entitlements and entitlements['platinum']['expires_date']:
            active_tier = 'platinum'
            expires_at = entitlements['platinum']['expires_date']
        
        return {
            'tier': active_tier,
            'expires_at': expires_at,
            'is_active': active_tier is not None
        }
    
    async def handle_webhook(
        self,
        payload: Dict
    ) -> None:
        """Handle RevenueCat webhook"""
        event_type = payload.get('type')
        
        if event_type == 'INITIAL_PURCHASE':
            await self.handle_initial_purchase(payload)
        elif event_type == 'RENEWAL':
            await self.handle_renewal(payload)
        elif event_type == 'CANCELLATION':
            await self.handle_cancellation(payload)
        elif event_type == 'EXPIRATION':
            await self.handle_expiration(payload)
```

**Mobile Implementation (React Native):**
```typescript
import Purchases from 'react-native-purchases';

// Initialize RevenueCat
Purchases.configure({
  apiKey: Platform.OS === 'ios' 
    ? REVENUECAT_IOS_API_KEY 
    : REVENUECAT_ANDROID_API_KEY,
  appUserID: userId
});

// Get available packages
const offerings = await Purchases.getOfferings();
const premiumPackage = offerings.current?.availablePackages.find(
  pkg => pkg.identifier === 'premium_monthly'
);

// Purchase subscription
try {
  const { customerInfo } = await Purchases.purchasePackage(premiumPackage);
  
  // Check entitlements
  if (customerInfo.entitlements.active['premium']) {
    // User has premium access
    updateSubscriptionStatus('premium');
  }
} catch (error) {
  if (error.userCancelled) {
    // User cancelled purchase
  }
}

// Restore purchases
const customerInfo = await Purchases.restorePurchases();
```

### Payment Gateway Selection Logic

```python
class PaymentGatewaySelector:
    def select_gateway(
        self,
        user_location: str,
        platform: str,
        payment_method: str = None
    ) -> str:
        """Select appropriate payment gateway"""
        
        # Mobile platforms always use RevenueCat
        if platform in ['ios', 'android']:
            return 'revenuecat'
        
        # Telegram Mini App uses Telegram Stars
        if platform == 'telegram':
            return 'telegram_stars'
        
        # VK Mini App uses VK Pay
        if platform == 'vk':
            return 'vk_pay'
        
        # Russian users prefer YooKassa
        if user_location == 'RU':
            return 'yookassa'
        
        # International users use Stripe
        return 'stripe'
```

### Webhook Security

```python
from fastapi import Request, HTTPException
import hmac
import hashlib

@router.post("/payments/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook"""
    payload = await request.body()
    signature = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload,
            signature,
            settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    await payment_service.handle_stripe_webhook(event)
    return {'status': 'success'}

@router.post("/payments/webhook/yookassa")
async def yookassa_webhook(request: Request):
    """Handle YooKassa webhook"""
    payload = await request.json()
    
    # Verify webhook authenticity
    # YooKassa sends notifications from specific IPs
    client_ip = request.client.host
    if not is_yookassa_ip(client_ip):
        raise HTTPException(status_code=403, detail="Invalid source")
    
    await payment_service.handle_yookassa_webhook(payload)
    return {'status': 'success'}

@router.post("/payments/webhook/revenuecat")
async def revenuecat_webhook(request: Request):
    """Handle RevenueCat webhook"""
    payload = await request.json()
    signature = request.headers.get('x-revenuecat-signature')
    
    # Verify signature
    expected_signature = hmac.new(
        settings.REVENUECAT_WEBHOOK_SECRET.encode(),
        await request.body(),
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    await payment_service.handle_revenuecat_webhook(payload)
    return {'status': 'success'}
```

## Error Handling

### Backend Error Responses
```python
class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict] = None
    timestamp: datetime

# HTTP Status Codes
200: Success
201: Created
400: Bad Request (validation error)
401: Unauthorized (invalid token)
403: Forbidden (insufficient permissions)
404: Not Found
429: Too Many Requests (rate limit)
500: Internal Server Error
503: Service Unavailable (AI model not loaded)
```

### Frontend Error Handling
```typescript
try {
  const response = await api.getTarotReading('three-card');
  // Handle success
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
  } else if (error.status === 429) {
    // Show rate limit message
  } else if (error.status === 403) {
    // Show upgrade prompt
  } else {
    // Show generic error
  }
}
```

## Testing Strategy

### Backend Testing
- **Unit Tests**: pytest for services and utilities
- **Integration Tests**: Test API endpoints with test database
- **AI Tests**: Test AI model responses with sample prompts
- **Load Tests**: Test performance under high load

### Frontend Testing
- **Unit Tests**: Jest for utility functions
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright for critical user flows
- **Visual Tests**: Chromatic for UI regression

## Deployment Architecture

### Production Environment (VPS)

**Server Details:**
- **Host**: 109.196.100.104
- **User**: root
- **Password**: hqpQDEoEB5_hnt
- **Domain**: www.mirastros.com
- **OS**: Ubuntu/Debian Linux

```
┌─────────────────────────────────────────────────────────┐
│         Nginx (80/443) + SSL (Let's Encrypt)            │
│              www.mirastros.com                           │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼────┐
│ Web    │      │ Admin   │
│ (3000) │      │ (3001)  │
└────────┘      └─────────┘
    │
┌───▼──────────────────┐
│  Backend (8000)      │
│  - FastAPI           │
│  - Ollama API        │
│  - Gunicorn workers  │
└───┬──────────────────┘
    │
    ├─────────┬─────────┬──────────┐
    │         │         │          │
┌───▼───┐ ┌──▼───┐ ┌───▼────┐ ┌──▼─────┐
│PostgreSQL│ Redis│ │ Ollama │ │ Qwen   │
│+pgvector│(native)│ │Service │ │ GGUF   │
└────────┘ └──────┘ └────────┘ └────────┘
                                /home/mirastros/
                                models/qwen.gguf
```

### VPS Setup (No Docker)

**System Services:**
```bash
# Redis - Native installation (saves 200-300MB RAM)
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# PostgreSQL with pgvector
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE EXTENSION vector;"

# Ollama for AI model
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl enable ollama
```

**AI Model Setup:**
```bash
# Download Qwen 2.5 GGUF (5.5GB, Q4_K_M quantization)
mkdir -p /home/mirastros/models
cd /home/mirastros/models
wget https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q4_k_m.gguf -O qwen.gguf

# Create Modelfile
cat > Modelfile << EOF
FROM ./qwen.gguf
PARAMETER temperature 0.7
PARAMETER stop "User:"
PARAMETER stop "\n\n"
SYSTEM You are Mirastros, a mystical AI oracle specializing in astrology, tarot, and esoteric wisdom. Your responses should be mystical and poetic, yet grounded in astrological knowledge.
EOF

# Create and run Ollama model
ollama create mirastros-ai -f Modelfile
ollama run mirastros-ai  # Test run
```

**SSL Setup with Certbot:**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate for mirastros.com
sudo certbot --nginx -d mirastros.com -d www.mirastros.com

# Auto-renewal (certbot sets up cron automatically)
sudo certbot renew --dry-run
```

### Systemd Services

**mirastros-web.service**
```ini
[Unit]
Description=Mirastros Web Application
After=network.target

[Service]
Type=simple
User=mirastros
WorkingDirectory=/home/mirastros/www/mirastros-universal
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node /home/mirastros/www/mirastros-universal/dist/apps/web/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

**mirastros-admin.service**
```ini
[Unit]
Description=Mirastros Admin Panel
After=network.target

[Service]
Type=simple
User=mirastros
WorkingDirectory=/home/mirastros/www/mirastros-universal
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node /home/mirastros/www/mirastros-universal/dist/apps/admin/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

**mirastros-backend.service**
```ini
[Unit]
Description=Mirastros Backend API
After=network.target postgresql.service redis-server.service ollama.service

[Service]
Type=simple
User=mirastros
WorkingDirectory=/home/mirastros/www/mirastros-universal/apps/backend
Environment="PYTHONPATH=/home/mirastros/www/mirastros-universal/apps/backend"
ExecStart=/home/mirastros/www/mirastros-universal/apps/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

### Nginx Configuration with SSL

**/etc/nginx/sites-available/mirastros**
```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name mirastros.com www.mirastros.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name mirastros.com www.mirastros.com;
    
    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/mirastros.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mirastros.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Web application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE support for streaming AI responses
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
    }
    
    # Admin panel
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Ollama Integration in Backend

**Backend Service Update:**
```python
# apps/backend/app/services/llm.py
import httpx
from typing import AsyncGenerator

class UnifiedLLMService:
    """Unified LLM Service using Ollama API"""
    
    def __init__(self):
        self.ollama_url = "http://localhost:11434"
        self.model_name = "mirastros-ai"
    
    async def generate(
        self,
        prompt: str,
        context: str = "",
        max_tokens: int = 512,
        temperature: float = 0.7,
        stream: bool = False
    ) -> str | AsyncGenerator:
        """Generate AI response via Ollama"""
        
        full_prompt = f"{context}\n\nUser: {prompt}\nMirastros:"
        
        async with httpx.AsyncClient() as client:
            if stream:
                return self._stream_generate(client, full_prompt, temperature)
            else:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": full_prompt,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_predict": max_tokens
                        }
                    },
                    timeout=60.0
                )
                result = response.json()
                return result["response"]
    
    async def _stream_generate(
        self,
        client: httpx.AsyncClient,
        prompt: str,
        temperature: float
    ) -> AsyncGenerator[str, None]:
        """Stream generation for SSE (magical scroll effect)"""
        async with client.stream(
            "POST",
            f"{self.ollama_url}/api/generate",
            json={
                "model": self.model_name,
                "prompt": prompt,
                "stream": True,
                "options": {"temperature": temperature}
            },
            timeout=300.0
        ) as response:
            async for line in response.aiter_lines():
                if line:
                    import json
                    data = json.loads(line)
                    if "response" in data:
                        yield data["response"]
```

### Memory Optimization

**Why No Docker:**
- Redis in Docker: ~200-300MB overhead
- PostgreSQL in Docker: ~150-200MB overhead
- Total saved: ~400-500MB for AI model

**Native Installation Benefits:**
- Direct system access (faster I/O)
- Lower memory footprint
- Easier debugging
- Better performance for AI inference

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: Role-based access control (RBAC)
3. **Data Encryption**: HTTPS for all communications, bcrypt for passwords
4. **Rate Limiting**: 60 requests per minute per user
5. **Input Validation**: Pydantic models for backend, Zod for frontend
6. **CORS**: Restricted to allowed origins
7. **SQL Injection**: Parameterized queries with SQLAlchemy
8. **XSS Protection**: Content Security Policy headers
9. **CSRF Protection**: CSRF tokens for state-changing operations
10. **API Keys**: Secure storage of third-party API keys

## Performance Optimization

1. **Caching**: Redis for horoscopes (24h), general queries (1h)
2. **Database**: Connection pooling, indexed queries
3. **AI Model**: Load once at startup, GPU acceleration
4. **Frontend**: Code splitting, lazy loading, CDN for static assets
5. **Images**: WebP format, responsive images, lazy loading
6. **API**: Pagination for list endpoints, field selection
7. **Monitoring**: Prometheus metrics, Grafana dashboards

## AI Response Streaming Architecture

### Overview

The system implements a three-tier streaming architecture to deliver real-time AI responses with minimal latency. This architecture enables token-by-token streaming from the AI model to the frontend, creating a responsive user experience.

### Three-Tier Streaming Architecture

```
Frontend (React)
    ↓ HTTP Streaming (SSE)
API Endpoint (/api/v1/rag/chat/rag/stream)
    ↓ AsyncGenerator
UnifiedLLMService.generate_response()
    ↓ AsyncGenerator
_stream_response_internal()
    ↓ Threading + asyncio.Queue
Llama.create_chat_completion(stream=True)
```

### Key Optimization Techniques

#### 1. Threading Worker + asyncio.Queue

The generation runs in a separate thread to avoid blocking the event loop, with tokens passed through an asyncio.Queue:

```python
async def _stream_response_internal(self, request: LLMRequest) -> AsyncGenerator[str, None]:
    """Stream AI response with zero-latency token delivery"""
    q: asyncio.Queue = asyncio.Queue()
    stop_event = threading.Event()
    loop = asyncio.get_running_loop()
    
    def worker():
        """Worker thread for AI generation"""
        stream_iter = self.model.create_chat_completion(
            messages=[{"role": "user", "content": request.prompt}],
            stream=True,
            **generation_params
        )
        
        for chunk in stream_iter:
            delta = chunk.get("choices")[0].get("delta", {}).get("content")
            if delta:
                # Thread-safe token delivery
                loop.call_soon_threadsafe(q.put_nowait, delta)
        
        # Signal completion
        loop.call_soon_threadsafe(q.put_nowait, None)
    
    # Start worker thread
    t = threading.Thread(target=worker, daemon=True)
    t.start()
    
    # Yield tokens as they arrive
    while True:
        token = await q.get()
        if token is None:
            break
        yield token
```

**Benefits:**
- Generation doesn't block event loop
- Zero latency between generation and delivery
- Thread-safe operations via `call_soon_threadsafe`

#### 2. Optimized Model Parameters

```python
generation_params = {
    "n_batch": 512,        # 2-3x faster first token
    "n_threads": 10,       # Parallel processing on CPU
    "max_tokens": 1500,    # Reasonable response length
    "temperature": 0.7,    # Balanced creativity
    "top_p": 0.9,         # Nucleus sampling
}
```

**Parameter Impact:**
- `n_batch=512`: Accelerates first token by 2-3x (optimal for CPU, doesn't overload memory)
- `n_threads=10`: Parallel processing on 8-16 core CPUs

#### 3. Fast-Start Mode

Automatic acceleration for simple requests:

```python
# Detect simple queries (no context, no concurrent requests)
acceleration_enabled = (
    not request.context or not request.context.strip()  # No history
    and len(self._active_requests) <= 1                 # No other requests
)

if acceleration_enabled:
    # Reduce token limit for faster completion
    fast_token_limit = min(1500, generation_params["max_tokens"])
    generation_params["max_tokens"] = fast_token_limit
    
    # Increase focus (reduce randomness)
    generation_params["top_p"] = max(0.5, generation_params["top_p"] - 0.15)
```

**Effect:** 30-40% speedup for simple requests

#### 4. HTTP Streaming (Server-Sent Events)

```python
@router.post("/chat/rag/stream")
async def chat_with_rag_stream(query: str = Form(...)):
    """Stream AI response via SSE"""
    
    async def generate_stream():
        async for chunk in rag_service.stream_rag_response(query):
            # Send each token immediately
            yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
        
        # Signal completion
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # CRITICAL: Disable nginx buffering
        }
    )
```

**Critical Header:** `X-Accel-Buffering: no` disables nginx buffering, ensuring tokens are sent immediately.

#### 5. Two-Phase Generation

Quick response marker after ~200 characters:

```python
accumulated_text = ""
quick_response_sent = [False]

for chunk in stream_iter:
    delta = chunk.get("choices")[0].get("delta", {}).get("content")
    
    if delta:
        accumulated_text += delta
        
        # Send quick response marker
        if not quick_response_sent[0] and len(accumulated_text) >= 200:
            quick_response_sent[0] = True
            loop.call_soon_threadsafe(
                q.put_nowait, 
                "__QUICK_RESPONSE_READY__"
            )
```

**Purpose:** Provides early feedback to users that response is generating well.

### Performance Metrics

| Metric | Before Optimization | After Optimization | Improvement |
|--------|-------------------|-------------------|-------------|
| First token | 10-20 sec | 2-5 sec | 4-10x faster |
| Generation speed | 0.5-1 token/sec | 1-2 tokens/sec | 2x faster |
| Delivery latency | 500-1000ms | <100ms | 5-10x faster |

### Key Techniques Summary

1. **n_batch=512** — Accelerates first token by 2-3x
2. **Threading + asyncio.Queue** — Zero-latency token delivery
3. **Fast-start mode** — Automatic 30-40% speedup for simple queries
4. **Simplified prompts** — 40-60% reduction in prompt length
5. **X-Accel-Buffering: no** — Disables nginx buffering
6. **create_chat_completion** — Optimized streaming API
7. **Two-phase generation** — Quick response marker for UX

### Frontend Integration

```typescript
// EventSource for SSE streaming
const eventSource = new EventSource('/api/v1/rag/chat/rag/stream');

eventSource.onmessage = (event) => {
  if (event.data === '[DONE]') {
    eventSource.close();
    return;
  }
  
  const chunk = JSON.parse(event.data);
  
  // Update UI with new token
  setResponse(prev => prev + chunk.content);
};

eventSource.onerror = (error) => {
  console.error('Streaming error:', error);
  eventSource.close();
};
```

### Nginx Configuration for Streaming

```nginx
location /api {
    proxy_pass http://localhost:8000;
    
    # SSE support - CRITICAL for streaming
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 300s;
    
    # Headers
    proxy_set_header X-Accel-Buffering no;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
}
```

---

## Design Decisions and Rationales

### 1. Multi-Gateway Payment Strategy
**Decision**: Support multiple payment gateways (Stripe, ЮKassa, RevenueCat, Telegram Stars, VK Pay)

**Rationale**: 
- Different markets have different payment preferences
- Russian users prefer local payment methods (ЮKassa, SBP)
- Mobile platforms require native in-app purchases (RevenueCat)
- Mini apps have platform-specific payment systems
- Reduces payment friction and increases conversion rates

### 2. Subscription Tier Enforcement at Multiple Levels
**Decision**: Implement access control at backend (middleware), rate limiting (Redis), and frontend (UI)

**Rationale**:
- Backend enforcement prevents API abuse
- Rate limiting protects against excessive usage
- Frontend UI provides better user experience with upgrade prompts
- Multi-layer approach ensures security and UX

### 3. Separate Services for Each Esoteric Practice
**Decision**: Create dedicated services (RuneService, IChingService, LenormandService, etc.)

**Rationale**:
- Each practice has unique logic and data structures
- Separation of concerns improves maintainability
- Easier to add new services without affecting existing ones
- Allows for specialized AI prompts per service

### 4. Chat Service for "Clarify with Mirastros"
**Decision**: Implement dedicated ChatService with session management and context retention

**Rationale**:
- Provides conversational AI experience
- Context retention improves response quality
- Session management allows for multi-turn conversations
- Separates chat logic from other services

### 5. Telegram and VK Mini Apps as Separate Applications
**Decision**: Build mini apps as separate Next.js applications sharing the same backend

**Rationale**:
- Platform-specific authentication and payment flows
- Different UI/UX requirements for mini apps
- Simplified deployment and maintenance
- Code reuse through shared backend API

### 6. Journal Service with AI Pattern Analysis
**Decision**: Store journal entries and provide AI-powered insights

**Rationale**:
- Adds value to Premium/Platinum tiers
- Encourages user engagement and retention
- AI analysis provides personalized insights
- Creates data for improving other services

### 7. Shop Integration with Natal Chart Recommendations
**Decision**: Integrate esoteric shop with personalized product recommendations

**Rationale**:
- Additional revenue stream
- Personalization increases conversion
- Complements spiritual practice services
- Provides physical products for users

### 8. Streaming Architecture for AI Responses
**Decision**: Implement token-by-token streaming with threading and asyncio.Queue

**Rationale**:
- Improves perceived performance (first token in 2-5 seconds)
- Better user experience with real-time feedback
- Reduces user abandonment during AI generation
- Enables responsive UI updates

### 9. Native Installation Instead of Docker
**Decision**: Use native Redis, PostgreSQL, and Ollama installations on VPS

**Rationale**:
- Saves 400-500MB RAM for AI model
- Better performance for AI inference
- Simpler debugging and monitoring
- Lower memory footprint overall

### 10. Subscription Synchronization Across Platforms
**Decision**: Implement real-time subscription sync via WebSocket and cache invalidation

**Rationale**:
- Users expect consistent experience across platforms
- Prevents confusion and support tickets
- Enables seamless platform switching
- Critical for user satisfaction

---

**Document Version**: 2.0.0  
**Date**: 2025-11-23  
**Status**: Updated with complete service architecture, payment integration, subscription enforcement, and mini apps

**Changes from v1.1.0:**
- Added complete API endpoints for all services (Runes, I Ching, Lenormand, Lunar, Crystals, Horary, Chakra, Solar Return, Signs of Fate, Karmic Tasks, Mandala, Rituals, Journal, Shop, Chat, Payments, Social Auth)
- Added detailed data models for all services
- Added service implementations for all esoteric practices
- Added subscription tier enforcement architecture with rate limiting
- Added payment integration architecture (Stripe, ЮKassa, RevenueCat, Telegram Stars, VK Pay)
- Added Telegram Mini App architecture and integration
- Added VK Mini App architecture and integration
- Added "Clarify with Mirastros" chat service architecture
- Added shop service with personalized recommendations
- Added journal service with AI pattern analysis
- Added social authentication services (Google, Apple, Telegram, VK)
- Added design decisions and rationales section
- Updated feature access matrix for all subscription tiers
