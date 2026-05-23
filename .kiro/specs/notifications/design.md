# Design: Notifications Feature

## Overview

The Notifications feature provides a comprehensive system for delivering timely, relevant information to users across multiple channels (in-app, email, push, SMS). Users can customize preferences, manage notification history, and control delivery frequency and timing.

## Architecture

### High-Level Structure

```
apps/web/src/app/
├── notifications/
│   ├── page.tsx                    # Notification center page
│   └── components/
│       ├── NotificationCenter.tsx  # Main notification panel
│       ├── NotificationList.tsx    # List of notifications
│       ├── NotificationCard.tsx    # Individual notification
│       ├── NotificationFilters.tsx # Filter controls
│       ├── NotificationStats.tsx   # Statistics dashboard
│       └── NotificationIcon.tsx    # Header notification icon
├── api/
│   └── notifications/
│       ├── route.ts               # GET notifications
│       ├── [id]/
│       │   ├── read/
│       │   │   └── route.ts       # POST mark as read
│       │   ├── archive/
│       │   │   └── route.ts       # POST archive
│       │   └── delete/
│       │       └── route.ts       # DELETE notification
│       ├── preferences/
│       │   └── route.ts           # GET/PUT preferences
│       ├── send/
│       │   └── route.ts           # POST send notification (admin)
│       └── stats/
│           └── route.ts           # GET notification statistics
└── services/
    └── notifications/
        ├── email-service.ts       # Email notification service
        ├── push-service.ts        # Push notification service
        ├── sms-service.ts         # SMS notification service
        └── notification-queue.ts  # Notification queue processor
```

### Component Hierarchy

```
NotificationCenter (page.tsx)
├── Header Section
│   ├── Page Title
│   ├── NotificationStats
│   └── Action Buttons (Mark All Read, Clear All)
├── Filter & Search Section (NotificationFilters)
│   ├── Search Input
│   ├── Type Filter
│   ├── Date Range Filter
│   ├── Status Filter (Read/Unread)
│   └── Channel Filter
├── Main Content
│   ├── NotificationList
│   │   ├── NotificationCard (repeated)
│   │   │   ├── Notification Icon
│   │   │   ├── Type Badge
│   │   │   ├── Title and Content
│   │   │   ├── Timestamp
│   │   │   ├── Action Buttons (Read, Archive, Delete)
│   │   │   └── Click to expand detail
│   │   └── Pagination Controls
│   ├── Loading State
│   ├── Error State
│   └── Empty State
└── Modals/Dialogs
    ├── Notification Detail
    ├── Preferences Dialog
    └── Quiet Hours Dialog
```

## Data Models

```typescript
interface Notification {
  id: string;
  user_id: string;
  type: 'consultation_ready' | 'subscription_update' | 'recommendation' | 'promotion' | 'account_activity' | 'maintenance' | 'new_feature';
  title: string;
  content: string;
  action_url?: string;
  channels: NotificationChannel[];
  status: 'unread' | 'read' | 'archived' | 'deleted';
  created_at: string;
  read_at?: string;
  archived_at?: string;
  metadata?: Record<string, any>;
}

type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

interface NotificationPreference {
  user_id: string;
  notification_type: string;
  channels: {
    in_app: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
  enabled: boolean;
}

interface NotificationSettings {
  user_id: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;  // HH:MM format
  quiet_hours_end: string;    // HH:MM format
  timezone: string;
  batch_notifications: boolean;
  batch_time: string;         // HH:MM format
}

interface NotificationHistory {
  id: string;
  user_id: string;
  notification_id: string;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  retry_count: number;
}

interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  notifications_by_type: Record<string, number>;
  notifications_by_channel: Record<string, number>;
  engagement_rate: number;
  most_common_type: string;
}
```

## Styling and Design System

### Color Scheme
- Primary: `mirastros-gold` (#D4AF37)
- Background: Dark theme with `white/5` to `white/10` overlays
- Text: `white` for primary, `gray-400` for secondary
- Accent: `mirastros-gold/10` for highlights
- Unread: `blue-500/20` for unread notifications
- Success: `green-500/20` for success notifications
- Warning: `yellow-500/20` for warning notifications
- Error: `red-500/20` for error notifications

### Layout
- Max width: `max-w-4xl` for content
- Padding: `py-12 px-4` for pages
- Sections: `mb-8` between sections
- Cards: `bg-white/5 border border-white/10 rounded-lg p-4`
- Notification panel: `w-96` on desktop, full width on mobile

### Interactive Elements
- Buttons: `py-2 px-4 rounded-lg transition`
- Primary: `bg-mirastros-gold hover:bg-mirastros-gold/90 text-black`
- Secondary: `bg-white/5 hover:bg-white/10 border border-white/10 text-white`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`

## API Endpoints

### GET /api/notifications
Fetch user notifications with filters and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)
- `type`: Filter by notification type
- `status`: Filter by status (unread, read, archived)
- `channel`: Filter by channel
- `date_from`: Start date (ISO format)
- `date_to`: End date (ISO format)

**Response:** `{ notifications: Notification[], total_count: number, page: number, total_pages: number }`

### POST /api/notifications/[id]/read
Mark notification as read.

**Response:** `{ success: boolean }`

### POST /api/notifications/[id]/archive
Archive notification.

**Response:** `{ success: boolean }`

### DELETE /api/notifications/[id]
Delete notification.

**Response:** `{ success: boolean }`

### GET /api/notifications/preferences
Fetch notification preferences.

**Response:** `{ preferences: NotificationPreference[], settings: NotificationSettings }`

### PUT /api/notifications/preferences
Update notification preferences.

**Body:** `{ preferences: Partial<NotificationPreference>[], settings: Partial<NotificationSettings> }`

**Response:** `{ preferences: NotificationPreference[], settings: NotificationSettings }`

### GET /api/notifications/stats
Fetch notification statistics.

**Response:** `NotificationStats`

### POST /api/notifications/send
Send notification (admin endpoint).

**Body:** `{ user_id: string, type: string, title: string, content: string, channels: NotificationChannel[] }`

**Response:** `{ notification_id: string }`

## Notification Types

### Consultation Ready
- Triggered when consultation result is ready
- Includes service type and result preview
- Action link to view result

### Subscription Update
- Triggered on subscription renewal, upgrade, downgrade
- Includes subscription details
- Action link to subscription page

### Recommendation
- Triggered when personalized recommendation is available
- Includes recommendation details
- Action link to service page

### Promotion
- Triggered when promotion or discount is available
- Includes promotion details
- Action link to promotion page

### Account Activity
- Triggered on login from new device, password change, etc.
- Includes activity details
- Action link to security settings

### Maintenance
- Triggered when system maintenance is scheduled
- Includes maintenance details
- No action link

### New Feature
- Triggered when new feature is available
- Includes feature details
- Action link to feature page

## Correctness Properties

### Property 1: Notification Delivery Reliability
Notifications should be delivered reliably with retry logic and fallback channels.

### Property 2: Preference Enforcement
User preferences should be enforced and notifications should only be sent through enabled channels.

### Property 3: Frequency Batching
Notifications should be batched according to user frequency preference.

### Property 4: Quiet Hours Enforcement
Notifications should not be sent during quiet hours.

### Property 5: Status Consistency
Notification status should be consistent across all views.

### Property 6: History Accuracy
Notification history should accurately track delivery status.

### Property 7: Timezone Handling
Quiet hours and batch times should respect user timezone.

### Property 8: Channel Availability
If primary channel fails, system should try alternative channels.

### Property 9: Data Accuracy
Notification statistics should be accurate and up-to-date.

### Property 10: Privacy Compliance
Notifications should not expose sensitive user data.
