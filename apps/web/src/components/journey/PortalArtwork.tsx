'use client';

import { useEffect, useRef, useState } from 'react';

/** Original project animations. At most the nearby flight cards decode video;
 * list mode uses viewport visibility. The complete poster remains the fallback. */
export function PortalArtwork({ id, media, eager, active }: {
  id: string; media: string; eager: boolean; active?: boolean;
}) {
  const posterRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionAllowed(!reduce.matches && !document.hidden);
    sync();
    reduce.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      reduce.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
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
    // Explicit bounds also avoid stale 3D intersection reports when returning to list mode.
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [listMode]);

  const animate = motionAllowed && !failed && (active ?? inView);
  useEffect(() => {
    setPlaying(false);
    setBlocked(false);
    const video = videoRef.current;
    if (!animate || !video) return;
    let disposed = false;
    const stopRetry = () => {
      window.removeEventListener('pointerdown', retry);
      window.removeEventListener('touchend', retry);
      window.removeEventListener('keydown', retry);
    };
    const play = () => {
      video.muted = true;
      void video.play().then(() => {
        if (disposed) return;
        setBlocked(false);
        stopRetry();
      }).catch(error => {
        if (disposed || error?.name === 'AbortError') return;
        setBlocked(true);
        // iOS low-power/autoplay policies may require a fresh user gesture.
        window.addEventListener('pointerdown', retry, { passive: true });
        window.addEventListener('touchend', retry, { passive: true });
        window.addEventListener('keydown', retry);
      });
    };
    function retry() { if (!document.hidden) play(); }
    play();
    return () => { disposed = true; stopRetry(); video.pause(); };
  }, [animate]);

  return <>
    <img ref={posterRef} src={`/images/portals/${id}.webp`} alt="" width="640" height="640" loading={eager ? 'eager' : 'lazy'} />
    {animate && <video ref={videoRef} autoPlay loop muted playsInline preload="metadata" poster={`/images/portals/${id}.webp`} aria-hidden="true" data-playing={playing} data-playback={playing ? 'playing' : blocked ? 'blocked' : 'loading'} onPlaying={() => setPlaying(true)} onError={event => { if (event.target === event.currentTarget && event.currentTarget.error) setFailed(true); }}>
      <source src={`/${media}.mp4`} type="video/mp4" />
      <source src={`/${media}.webm`} type="video/webm" />
    </video>}
  </>;
}
