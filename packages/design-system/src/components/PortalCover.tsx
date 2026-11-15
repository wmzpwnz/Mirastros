import React, { type CSSProperties, type ReactNode } from 'react';
import { OrnamentFrame } from './OrnamentFrame';

export interface PortalCoverProps {
  title: string;
  description: string;
  artwork: ReactNode;
  accent?: string;
  featured?: boolean;
}
/** A non-interactive cover. Its caller owns the link, access rules and media. */
export function PortalCover({ title, description, artwork, accent = '#9d78d4', featured = false }: PortalCoverProps) {
  return <div className="mira-portal-cover" data-featured={featured} style={{ '--portal-accent': accent } as CSSProperties}>
    <OrnamentFrame className="mira-portal-frame" />
    <div className="mira-portal-art">{artwork}</div>
    <div className="mira-portal-caption"><h2>{title}</h2><p>{description}</p></div>
    <span className="mira-portal-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></span>
  </div>;
}
