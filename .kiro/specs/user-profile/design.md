# Design: User Profile Feature

## Overview

The User Profile feature provides users with a comprehensive account management system. Users can view and edit their profile information, manage subscriptions, view billing history, customize preferences, manage security settings, and control privacy. The feature includes responsive design for all devices and accessibility compliance.

## Architecture

### High-Level Structure

```
apps/web/src/app/
├── profile/
│   ├── page.tsx                    # Main profile page
│   └── components/
│       ├── ProfileHeader.tsx       # Profile header with avatar
│       ├── ProfileForm.tsx         # Edit profile form
│       ├── SubscriptionSection.tsx # Subscription details
│       ├── BillingSection.tsx      # Billing history
│       ├── PreferencesSection.tsx  # User preferences
│       ├── SecuritySection.tsx     # Security settings
│       ├── PrivacySection.tsx      # Privacy controls
│       ├── SessionsSection.tsx     # Active sessions
│       ├── DeleteAccountDialog.tsx # Account deletion
│       └── SidebarNav.tsx          # Sidebar navigation
├── api/
│   └── profile/
│       ├── route.ts               # GET/PUT profile
│       ├── password/
│       │   └── route.ts           # POST change password
│       ├── sessions/
│       │   └── route.ts           # GET sessions, DELETE session
│       ├── preferences/
│       │   └── route.ts           # GET/PUT preferences
│       ├── privacy/
│       │   └── route.ts           # GET/PUT privacy settings
│       ├── billing/
│       │   └── route.ts           # GET billing history
│       ├── subscription/
│       │   └── route.ts           # GET/PUT subscription
│       └── delete/
│           └── route.ts           # POST delete account
```

### Component Hierarchy

```
ProfilePage (page.tsx)
├── Header Section
│   ├── Page Title
│   └── ProfileHeader (avatar, name, tier)
├── Navigation
│   ├── SidebarNav (desktop)
│   │   ├── Profile
│   │   ├── Subscription
│   │   ├── Billing
│   │   ├── Preferences
│   │   ├── Security
│   │   ├── Privacy
│   │   └── Delete Account
│   └── TabNav (mobile)
├── Main Content
│   ├── ProfileForm (editable profile)
│   ├── SubscriptionSection
│   ├── BillingSection
│   ├── PreferencesSection
│   ├── SecuritySection
│   ├── PrivacySection
│   ├── SessionsSection
│   └── DeleteAccountDialog
├── Loading State
├── Error State
└── Success Messages
```

## Data Models

```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  tier: 'freemium' | 'premium' | 'platinum';
  start_date: string;
  renewal_date?: string;
  auto_renew: boolean;
  status: 'active' | 'cancelled' | 'expired';
}

interface Invoice {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  pdf_url?: string;
}

interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'paypal';
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

interface UserPreferences {
  user_id: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_frequency: 'instant' | 'daily' | 'weekly' | 'never';
}

interface PrivacySettings {
  user_id: string;
  profile_visible: boolean;
  data_sharing: boolean;
  analytics_enabled: boolean;
}

interface Session {
  id: string;
  user_id: string;
  device: string;
  location: string;
  ip_address: string;
  last_activity: string;
  created_at: string;
  is_current: boolean;
}

interface UsageStatistics {
  total_consultations: number;
  consultations_this_month: number;
  most_used_service: string;
  account_age_days: number;
  last_consultation_date?: string;
  breakdown_by_service: Record<string, number>;
}
```

## Styling and Design System

### Color Scheme
- Primary: `mirastros-gold` (#D4AF37)
- Background: Dark theme with `white/5` to `white/10` overlays
- Text: `white` for primary, `gray-400` for secondary
- Accent: `mirastros-gold/10` for highlights
- Success: `green-500/20` for success, `green-400` for text
- Danger: `red-500/20` for delete, `red-400` for text

### Layout
- Max width: `max-w-6xl` for content
- Sidebar: `w-64` on desktop, hidden on mobile
- Padding: `py-12 px-4` for pages
- Sections: `mb-8` between sections
- Cards: `bg-white/5 border border-white/10 rounded-lg p-6`

### Interactive Elements
- Buttons: `py-2 px-4 rounded-lg transition`
- Primary: `bg-mirastros-gold hover:bg-mirastros-gold/90 text-black`
- Secondary: `bg-white/5 hover:bg-white/10 border border-white/10 text-white`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`

## API Endpoints

### GET /api/profile
Fetch user profile information.

**Response:** `UserProfile`

### PUT /api/profile
Update user profile information.

**Body:** `Partial<UserProfile>`

**Response:** `UserProfile`

### GET /api/profile/subscription
Fetch subscription details.

**Response:** `Subscription`

### PUT /api/profile/subscription
Update subscription (upgrade/downgrade).

**Body:** `{ tier: 'premium' | 'platinum' }`

**Response:** `Subscription`

### GET /api/profile/billing
Fetch billing history.

**Response:** `{ invoices: Invoice[], payment_method: PaymentMethod }`

### GET /api/profile/preferences
Fetch user preferences.

**Response:** `UserPreferences`

### PUT /api/profile/preferences
Update user preferences.

**Body:** `Partial<UserPreferences>`

**Response:** `UserPreferences`

### GET /api/profile/privacy
Fetch privacy settings.

**Response:** `PrivacySettings`

### PUT /api/profile/privacy
Update privacy settings.

**Body:** `Partial<PrivacySettings>`

**Response:** `PrivacySettings`

### POST /api/profile/password
Change password.

**Body:** `{ current_password: string, new_password: string }`

**Response:** `{ success: boolean }`

### GET /api/profile/sessions
Fetch active sessions.

**Response:** `{ sessions: Session[] }`

### DELETE /api/profile/sessions/[id]
Logout specific session.

**Response:** `{ success: boolean }`

### POST /api/profile/delete
Delete account.

**Body:** `{ password: string }`

**Response:** `{ success: boolean }`

## Correctness Properties

### Property 1: Profile Data Consistency
Profile data should be consistent across all views and persist after updates.

### Property 2: Subscription Tier Enforcement
Subscription tier should determine feature availability and be enforced on backend.

### Property 3: Payment Security
Payment information should be encrypted and never exposed in API responses.

### Property 4: Session Management
Active sessions should be accurately tracked and revocable.

### Property 5: Preference Persistence
User preferences should persist across sessions and apply immediately.

### Property 6: Privacy Enforcement
Privacy settings should be enforced and user data should not be shared without consent.

### Property 7: Account Deletion Completeness
Account deletion should remove all user data and be irreversible.

### Property 8: Password Security
Passwords should be hashed and never transmitted in plain text.

### Property 9: Email Verification
Email changes should require verification before taking effect.

### Property 10: Billing Accuracy
Invoices and billing information should be accurate and match payment records.
