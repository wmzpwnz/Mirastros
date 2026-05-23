'use client';

import React from 'react';

interface ServiceSectionProps {
  id?: string;
  badge?: string;
  title: string;
  description: string;
  media?: {
    webm: string;
    mp4: string;
    poster?: string;
  };
  imageUrl?: string;
  imageAlt: string;
  children?: React.ReactNode;
}

/**
 * ServiceSection Component
 * A reusable section component for service showcases
 */
export const ServiceSection = React.forwardRef<HTMLDivElement, ServiceSectionProps>(
  (
    {
      id,
      badge,
      title,
      description,
      media,
      imageUrl,
      imageAlt,
      children,
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        id={id}
        className="mira-section"
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="section-container section-container-tunnel">
          <div className="section-layout-split-modern section-layout-tunnel-portal">
            <div className="section-media section-media-wrapper">
              {badge && (
                <div className="section-category section-badge-modern" aria-hidden="true">
                  {badge}
                </div>
              )}
              <div className="section-media-card">
                {media ? (
                  <video
                    className="section-media-image"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
                    poster={media.poster}
                    aria-label={imageAlt}
                  >
                    <source src={media.webm} type="video/webm" />
                    <source src={media.mp4} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    className="section-media-image"
                  />
                )}
                <div className="section-media-glow"></div>
              </div>
            </div>

            <div className="section-text-wrapper">
              <div className="section-text-card">
                <h2 className="section-title-modern">
                  {title}
                </h2>
                <p className="section-description-modern">
                  {description}
                </p>
                {children}
                <div className="section-accent-corner section-accent-corner-tl"></div>
                <div className="section-accent-corner section-accent-corner-br"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

ServiceSection.displayName = 'ServiceSection';
