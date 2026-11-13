'use client';

import { useEffect, useRef, useState } from 'react';

/** Original project animations. At most the nearby flight cards decode video;
 * list mode uses viewport visibility. The complete poster remains the fallback. */
export function PortalArtwork({ id, media, eager, active, interactive = true }: {
  id: string; media: string; eager: boolean; active?: boolean; interactive?: boolean;
}) {
  const posterRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const failedSources = useRef(new Set<string>());
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

  const nearby = active ?? inView;
  const animate = motionAllowed && nearby;
  useEffect(() => { failedSources.current.clear(); setFailed(false); }, [nearby]);
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
        setPlaying(!video.paused);
        stopRetry();
      }).catch(error => {
        if (disposed || error?.name === 'AbortError') return;
        if (error?.name === 'NotSupportedError') { setFailed(true); return; }
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

  const startManually = () => {
    const video = videoRef.current;
    if (!video) return;
    setBlocked(false);
    if (video.error || failed) { failedSources.current.clear(); setFailed(false); video.load(); }
    video.muted = true;
    // Keep this call synchronous inside the button gesture, including reduced-motion opt-in.
    void video.play().then(() => setPlaying(!video.paused)).catch(error => { if (error?.name === 'NotSupportedError') setFailed(true); else setBlocked(true); });
  };

  const sourceFailed = (source: string) => {
    failedSources.current.add(source);
    if (failedSources.current.size === 2) { setFailed(true); setPlaying(false); }
  };

  return <>
    <img ref={posterRef} src={`/images/portals/${id}.webp`} alt="" width="640" height="640" loading={eager ? 'eager' : 'lazy'} />
    {nearby && <video ref={videoRef} autoPlay={motionAllowed} loop muted playsInline preload={motionAllowed ? 'metadata' : 'none'} poster={`/images/portals/${id}.webp`} aria-label="Анимация раздела" controls={interactive && (blocked || failed)} tabIndex={interactive && (blocked || failed) ? 0 : -1} data-playing={playing} data-playback={failed ? 'failed' : playing ? 'playing' : blocked ? 'blocked' : 'loading'} onPlaying={() => { setPlaying(true); setBlocked(false); setFailed(false); }} onPause={() => setPlaying(false)} onError={event => { if (event.target === event.currentTarget && event.currentTarget.error) { setFailed(true); setPlaying(false); } }}>
      <source src={`/${media}.mp4`} type="video/mp4" onError={() => sourceFailed('mp4')} />
      <source src={`/${media}.webm`} type="video/webm" onError={() => sourceFailed('webm')} />
    </video>}
    {nearby && !playing && <span className="portal-playback" data-interactive={interactive}>
      <button type="button" disabled={!interactive} tabIndex={interactive ? 0 : -1} onClick={startManually} aria-label={failed ? 'Повторить загрузку анимации' : 'Воспроизвести анимацию'}><span aria-hidden="true">▷</span> {failed ? 'Повторить загрузку' : 'Воспроизвести'}</button>
      {failed && <a href={`/${media}.mp4`} target="_blank" rel="noopener noreferrer" tabIndex={interactive ? 0 : -1}>Открыть видео отдельно ↗</a>}
    </span>}
  </>;
}
