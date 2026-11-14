'use client';

import { useEffect, useRef, useState } from 'react';

/** Keep a partially downloaded animated image from painting an empty opaque
 * surface over the poster (notably in WebKit). Cached loads are handled too. */
function AnimatedLoop({ src, onError }: { src: string; onError: () => void }) {
  const [loaded, setLoaded] = useState(false);
  return <img src={src} alt="" width="640" height="640" loading="eager" data-animation="image" data-loaded={loaded}
    ref={node => { if (node?.complete && node.naturalWidth > 0 && !loaded) setLoaded(true); }}
    style={{ position: 'absolute', inset: 0, opacity: loaded ? 1 : 0 }}
    onLoad={() => setLoaded(true)} onError={onError} />;
}

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
    // On iPhone/iPad use the image loop directly: it has no media autoplay
    // permission and does not depend on video compositing inside a 3D card.
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios) setFallback(true);
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
    <img ref={posterRef} src={poster} alt="" width="640" height="640" loading={eager ? 'eager' : 'lazy'} fetchPriority={id === 'circle' ? 'high' : undefined} data-animation="poster" />
    {imageAnimation && <AnimatedLoop src={`/animations/${media}.webp`} onError={() => setImageFailed(true)} />}
    {animate && !fallback && <video ref={videoRef} autoPlay loop muted playsInline preload="auto" poster={poster} aria-hidden="true" tabIndex={-1} onError={event => { if (event.target === event.currentTarget && event.currentTarget.error) setFallback(true); }}>
      <source src={`/${media}.mp4`} type="video/mp4" onError={() => sourceFailed('mp4')} />
      <source src={`/${media}.webm`} type="video/webm" onError={() => sourceFailed('webm')} />
    </video>}
  </>;
}
