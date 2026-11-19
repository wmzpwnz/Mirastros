'use client';

import { useEffect, useRef, useState } from 'react';
import { OrnamentFrame } from './ornaments/OrnamentFrame';
import styles from './Preloader.module.css';

/** A brief first-visit entrance. Wait for the actual logo, backdrop and fonts,
 * not an ever-growing PerformanceObserver count or simulated percentages. */
export const Preloader = ({ onComplete }: { onComplete?: () => void }) => {
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let completed = false;
    let fadeTimer: ReturnType<typeof setTimeout>;
    const finish = () => {
      if (cancelled || completed) return;
      completed = true;
      setLeaving(true);
      fadeTimer = setTimeout(() => { if (!cancelled) completeRef.current?.(); }, 400);
    };
    const image = (src: string) => new Promise<void>(resolve => {
      const asset = new Image();
      asset.onload = asset.onerror = () => resolve();
      asset.src = src;
    });
    let minimumTimer: ReturnType<typeof setTimeout>;
    const minimum = new Promise<void>(resolve => { minimumTimer = setTimeout(resolve, 1600); });
    const assets = Promise.allSettled([
      image('/logo.png'),
      image('/images/preloader-zodiac-gold.webp'),
      image(typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 600px), (max-width: 1024px) and (orientation: portrait)').matches ? '/images/mirastros-reference-mobile.webp' : '/images/mirastros-reference-desktop.webp'),
      document.fonts?.ready ?? Promise.resolve(),
    ]);
    void Promise.all([minimum, assets]).then(finish);
    const deadline = setTimeout(finish, 6500);
    return () => { cancelled = true; clearTimeout(deadline); clearTimeout(minimumTimer); clearTimeout(fadeTimer); };
  }, []);

  return <div className={styles.root} data-leaving={leaving} data-preloader aria-label="Mirastros загружается">
    <OrnamentFrame className={styles.frame} />
    <div className={styles.content}>
      <p className={styles.eyebrow}>Ваш путь начинается здесь</p>
      <div className={styles.circle}>
        <img className={styles.wheel} src="/images/preloader-zodiac-gold.webp" alt="" width="1024" height="1024" loading="eager" fetchPriority="high" data-preloader-wheel />
      </div>
      <img className={styles.brand} src="/logo.png" alt="Mirastros" fetchPriority="high" width="800" height="205" />
      <div className={styles.status} role="status" aria-live="polite">
        <span className={styles.line} aria-hidden="true" />
        <p>{leaving ? 'Добро пожаловать' : 'Открываем ваше пространство'}</p>
      </div>
    </div>
    <p className={styles.signature}>Звёзды · Символы · Самопознание</p>
  </div>;
};
