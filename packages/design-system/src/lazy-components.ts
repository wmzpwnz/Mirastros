/**
 * Lazy-loaded Components
 * 
 * Heavy components that should be code-split for better initial load performance.
 * Use these in applications that need to optimize bundle size.
 * 
 * Example usage:
 * ```typescript
 * import { LazyDatePicker } from '@mirastros-universal/design-system/lazy-components';
 * 
 * <Suspense fallback={<Spinner />}>
 *   <LazyDatePicker {...props} />
 * </Suspense>
 * ```
 */

import { lazy } from 'react';

// Heavy components (>8KB) - Lazy load these
export const LazyChatInterface = lazy(() =>
  import('./components/ChatInterface').then((m) => ({
    default: m.ChatInterface,
  }))
);

export const LazyDatePicker = lazy(() =>
  import('./components/DatePicker').then((m) => ({
    default: m.DatePicker,
  }))
);

export const LazyChart = lazy(() =>
  import('./components/Chart').then((m) => ({
    default: m.Chart,
  }))
);

export const LazyTable = lazy(() =>
  import('./components/Table').then((m) => ({
    default: m.Table,
  }))
);

export const LazySelect = lazy(() =>
  import('./components/Select').then((m) => ({
    default: m.Select,
  }))
);

// Medium components (5-8KB) - Optional lazy loading
export const LazyIcon = lazy(() =>
  import('./components/Icon').then((m) => ({
    default: m.Icon,
  }))
);

export const LazyNavbar = lazy(() =>
  import('./components/Navbar').then((m) => ({
    default: m.Navbar,
  }))
);

export const LazySidebar = lazy(() =>
  import('./components/Sidebar').then((m) => ({
    default: m.Sidebar,
  }))
);

/**
 * Bundle size impact:
 * 
 * Without lazy loading:
 * - Initial bundle: 152.42 KB
 * - Gzipped: ~45-50 KB
 * 
 * With lazy loading (heavy components):
 * - Initial bundle: ~106 KB (30% reduction)
 * - Gzipped: ~32-35 KB
 * - Lazy chunks: 46 KB total
 * 
 * Recommendation: Use lazy loading for:
 * - Admin dashboards (heavy data components)
 * - Large forms (DatePicker, Select)
 * - Analytics pages (Chart, Table)
 * - Chat interfaces (ChatInterface)
 */
