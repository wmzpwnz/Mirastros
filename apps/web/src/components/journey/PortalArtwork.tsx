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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionAllowed(!reduce.matches && !document.hidden);
    sync();
    reduce.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    const observer = new IntersectionObserver(entries => setInView(entries[0].isIntersecting), { rootMargin: '80px' });
    if (posterRef.current) observer.observe(posterRef.current);
    return () => {
      observer.disconnect();
      reduce.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  const animate = motionAllowed && !failed && (active ?? inView);
  useEffect(() => {
    setPlaying(false);
    const video = videoRef.current;
    if (!animate || !video) return;
    video.muted = true;
    void video.play().catch(() => { /* Low-power/autoplay restrictions keep the full poster. */ });
    return () => { video.pause(); };
  }, [animate]);

  return <>
    <img ref={posterRef} src={`/images/portals/${id}.webp`} alt="" width="640" height="640" loading={eager ? 'eager' : 'lazy'} />
    {animate && <video ref={videoRef} autoPlay loop muted playsInline preload="metadata" poster={`/images/portals/${id}.webp`} aria-hidden="true" data-playing={playing} onPlaying={() => setPlaying(true)} onError={() => setFailed(true)}>
      <source src={`/${media}.webm`} type="video/webm" />
      <source src={`/${media}.mp4`} type="video/mp4" />
    </video>}
  </>;
}
