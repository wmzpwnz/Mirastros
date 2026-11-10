'use client';

import Link from 'next/link';
import styles from './HeroSection.module.css';

interface HeroSectionProps { id?: string; }

function Corner({ className }: { className: string }) {
  return <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <path d="M3 77V14C3 7 7 3 14 3h63M9 68V17c0-5 3-8 8-8h51M3 35C22 35 35 22 35 3M9 47C26 44 44 26 47 9" />
    <path d="M8 8c20-3 28 11 20 19C19 35 5 22 8 8Zm7 7c12 0 18 8 10 11-5 2-11-4-10-11ZM3 54c16-20 20-7 13-3S5 66 9 70M54 3c-20 16-7 20-3 13S66 5 70 9M37 17l7 7-7 7-7-7Z" />
    <path d="M40 40c9-3 16-9 20-18-2 13-9 22-20 25-3 11-12 18-25 20 9-4 15-11 18-20l7-7Z" /><circle cx="24" cy="24" r="3" />
  </svg>;
}

// A decorative astrolabe, not a replacement brand mark. The original logo
// remains unmodified at /logo.png. No external animation runtime is added.
function Astrolabe() {
  return <svg className={styles.astrolabe} viewBox="0 0 180 180" fill="none" aria-hidden="true">
    <circle cx="90" cy="90" r="80" /><circle cx="90" cy="90" r="68" /><circle cx="90" cy="90" r="47" />
    <path d="m90 8 18 57 62 25-62 18-18 62-18-62L8 90l64-25L90 8Zm0 28 38 54-38 38-38-38 38-54Z" />
    {Array.from({ length: 12 }, (_, i) => <g key={i} transform={`rotate(${i * 30} 90 90)`}><path d="M90 10v12" /><circle cx="90" cy="29" r="1.5" /></g>)}
    <path d="m90 71 5 14 14 5-14 5-5 14-5-14-14-5 14-5 5-14Z" />
  </svg>;
}

export const HeroSection = ({ id = 'hero' }: HeroSectionProps) => (
  <section id={id} className={`mira-section active ${styles.root}`} aria-labelledby="landing-title">
    <div className={`hero-bg-wrapper ${styles.background}`} aria-hidden="true">
      <picture>
        <source media="(max-width: 600px)" srcSet="/images/mirastros-cosmos-mobile.webp" />
        <img className="hero-bg-img" src="/images/mirastros-cosmos.webp" alt="" fetchPriority="high" decoding="async" />
      </picture>
    </div>
    <div className={`hero-overlay ${styles.overlay}`} aria-hidden="true" />
    <div className={styles.frame} aria-hidden="true">
      <Corner className={`${styles.corner} ${styles.topLeft}`} /><Corner className={`${styles.corner} ${styles.topRight}`} />
      <Corner className={`${styles.corner} ${styles.bottomLeft}`} /><Corner className={`${styles.corner} ${styles.bottomRight}`} />
      <span className={styles.frameCrest}>◇ ── ✧ ── ◇</span>
    </div>
    <div className={`hero-logo-buttons-group ${styles.content}`}>
      <Astrolabe />
      <h1 id="landing-title" className={styles.logo}><img src="/logo.png" alt="Mirastros" width="800" height="205" fetchPriority="high" /></h1>
      <p className={styles.tagline}><span>Ваш путь.</span> <span>Ваша судьба.</span> <span>Ваша вселенная.</span></p>
      <div className={styles.rule} aria-hidden="true"><span>✦</span></div>
      <p className={styles.description}>Пространство астрологии, древних знаний<br className={styles.desktopBreak} /> и символических практик для осознанной жизни.</p>
      <nav className={styles.actions} aria-label="Вход в Mirastros">
        <Link href="/auth/login" className={styles.login}><span aria-hidden="true">✧</span> Вход</Link>
        <Link href="/auth/register" className={styles.register}><span aria-hidden="true">✦</span> Регистрация</Link>
      </nav>

    </div>
    <div className={`hero-flying-gifs ${styles.flyingPortals}`} aria-hidden="true" />
    <div className={styles.scrollCue} aria-hidden="true"><span />Листайте — впереди ваш мир Mirastros</div>
  </section>
);
