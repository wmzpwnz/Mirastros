'use client';

import { useEffect, useRef, useState } from 'react';

/** Original silent clips, with an automatic animated-image fallback for autoplay
 * restrictions. Artwork stays animated independently of reduced camera motion. */
export function PortalArtwork({ id, media, eager, active, focused = true, posterSrc }: {
  id: string; media: string; eager: boolean; active?: boolean; focused?: boolean; posterSrc?: string;
}) {
  const posterRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const failedSources = useRef(new Set<string>());
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const poster = posterSrc ?? `/images/portals/${id}.webp`;

  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  const listMode = active === undefined;
  useEffect(() => {
    setInView(false);
    if (!listMode) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const bounds = posterRef.current?.getBoundingClientRect();
      setInView(Boolean(bounds && bounds.bottom > -80 && bounds.top < innerHeight + 80 && bounds.right > 0 && bounds.left < innerWidth));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [listMode]);

  const animate = visible && (active ?? inView);
  useEffect(() => {
    const video = videoRef.current;
    if (!animate || fallback || !video) return;
    let cancelled = false;
    failedSources.current.clear();
    video.muted = true;
    void video.play().catch(error => {
      if (!cancelled && error?.name !== 'AbortError') setFallback(true);
    });
    const timer = setTimeout(() => {
      if (!cancelled && !document.hidden && (video.paused || video.currentTime === 0)) setFallback(true);
    }, 8000);
    return () => { cancelled = true; clearTimeout(timer); video.pause(); };
  }, [animate, fallback]);

  const sourceFailed = (source: string) => {
    failedSources.current.add(source);
    if (failedSources.current.size === 2) setFallback(true);
  };
  // Only the focused flight card downloads the larger image fallback; list mode
  // already limits resources using the viewport bounds above.
  const imageAnimation = animate && focused && fallback && !imageFailed;
  return <>
    <img ref={posterRef} src={imageAnimation ? `/animations/${media}.webp` : poster} alt="" width="640" height="640" loading={eager || imageAnimation ? 'eager' : 'lazy'} data-animation={imageAnimation ? 'image' : 'poster'} onError={() => { if (imageAnimation) setImageFailed(true); }} />
    {animate && !fallback && <video ref={videoRef} autoPlay loop muted playsInline preload="auto" poster={poster} aria-hidden="true" tabIndex={-1} onError={event => { if (event.target === event.currentTarget && event.currentTarget.error) setFallback(true); }}>
      <source src={`/${media}.mp4`} type="video/mp4" onError={() => sourceFailed('mp4')} />
      <source src={`/${media}.webm`} type="video/webm" onError={() => sourceFailed('webm')} />
    </video>}
  </>;
}
