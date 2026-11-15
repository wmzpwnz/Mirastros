import type { ReactNode } from 'react';
import Link from 'next/link';
import { OrnamentFrame } from '../ornaments/OrnamentFrame';

/** One scrollable, keyboard-safe surface for every account entry screen. */
export function AuthShell({ title, description, page, loading = false, children, footer }: {
  title: string; description?: string; page: string; loading?: boolean; children: ReactNode; footer?: ReactNode;
}) {
  return <div className="auth-shell auth-preset">
    <div className="auth-bg-wrapper" aria-hidden="true"><picture>
      <source media="(max-width:600px)" srcSet="/images/mirastros-reference-mobile.webp" />
      <img src="/images/mirastros-reference-desktop.webp" alt="" className="auth-bg-img" />
    </picture><div className="auth-bg-overlay" /></div>
    <header className="auth-header"><Link href="/" className="auth-brand-return" aria-label="На главную Mirastros"><img src="/logo.png" alt="Mirastros" width="800" height="205" /></Link></header>
    <main className="auth-warp" data-page={page} data-loading={loading} aria-labelledby="auth-title">
      <div className="auth-card"><OrnamentFrame className="auth-preset-frame" />
        <div className="auth-card-inner">
          <h1 id="auth-title" className="auth-title">{title}</h1>
          {description && <p className="auth-description">{description}</p>}
          {children}
          {footer && <p className="auth-footer">{footer}</p>}
        </div>
      </div>
    </main>
    <p className="auth-signature" aria-hidden="true">Ваш путь к звёздам и себе</p>
  </div>;
}
