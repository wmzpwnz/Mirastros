'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { TunnelMediaTrack } from '../constants/tunnelMedia';
import { getSectionRange, getScrollPerSlide, TUNNEL_OVERLAP } from '../utils/tunnelScrollMath';

interface DynamicBackgroundProps {
  sources?: TunnelMediaTrack;
  images?: Array<string | { src: string; alt?: string }>;
  blurAmount?: number;
  scale?: number;
  overlap?: number;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  sources,
  images,
  blurAmount = 0,
  scale = 1.1,
  overlap = TUNNEL_OVERLAP,
}) => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const normalizedSources = useMemo<TunnelMediaTrack>(() => {
    if (sources) return sources;

    return (images ?? []).map((imageEntry) => {
      const src = typeof imageEntry === 'string' ? imageEntry : imageEntry?.src;

      if (!src) return null;
      if (src.endsWith('.webm')) {
        return {
          webm: src,
          mp4: src.replace(/\.webm$/i, '.mp4'),
        };
      }
      if (src.endsWith('.mp4')) {
        return {
          webm: src.replace(/\.mp4$/i, '.webm'),
          mp4: src,
        };
      }

      return { webm: src, mp4: src };
    });
  }, [images, sources]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const triggers: ScrollTrigger[] = [];
    normalizedSources.forEach((source, index) => {
      const video = videoRefs.current[index];

      if (!source || !video) return;

      const trigger = ScrollTrigger.create({
        trigger: document.body,
        start: () => {
          const scrollPerSlide = getScrollPerSlide(window.innerHeight);
          const { start } = getSectionRange(index, scrollPerSlide, overlap);
          return `${start}px top`;
        },
        end: () => {
          const scrollPerSlide = getScrollPerSlide(window.innerHeight);
          const { end } = getSectionRange(index, scrollPerSlide, overlap);
          return `${end}px top`;
        },
        invalidateOnRefresh: true,
        onEnter: () => {
          void video.play().catch(() => null);
          gsap.to(video, { opacity: 1, duration: 0.45, ease: 'power2.out' });
        },
        onLeave: () => {
          video.pause();
          gsap.to(video, { opacity: 0, duration: 0.45, ease: 'power2.in' });
        },
        onEnterBack: () => {
          void video.play().catch(() => null);
          gsap.to(video, { opacity: 1, duration: 0.45, ease: 'power2.out' });
        },
        onLeaveBack: () => {
          video.pause();
          gsap.to(video, { opacity: 0, duration: 0.45, ease: 'power2.in' });
        },
      });

      triggers.push(trigger);
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [normalizedSources, overlap]);

  return (
    <div className="mira-backgrounds" aria-hidden>
      {normalizedSources.map((source, index) => {
        if (!source) {
          return <div key={index} className="mira-bg" style={{ opacity: 0 }} />;
        }

        return (
          <video
            key={index}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            className="mira-bg"
            style={{
              filter: `blur(${blurAmount}px)`,
              transform: `scale(${scale})`,
              opacity: 0,
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              display: 'block',
            }}
            playsInline
            muted
            loop
            preload="none"
          >
            <source src={source.webm} type="video/webm" />
            <source src={source.mp4} type="video/mp4" />
          </video>
        );
      })}
    </div>
  );
};
