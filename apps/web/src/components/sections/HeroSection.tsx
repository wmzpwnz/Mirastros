'use client';

import Link from 'next/link';
import { OrnamentFrame, MirastrosSeal } from '../ornaments/OrnamentFrame';
import styles from './HeroSection.module.css';

interface HeroSectionProps { id?: string; showScrollCue?: boolean; }

export const HeroSection = ({ id = 'hero', showScrollCue = true }: HeroSectionProps) => (
  <section id={id} className={`mira-section active ${styles.root}`} aria-labelledby="landing-title">
    <div className={`hero-bg-wrapper ${styles.background}`} aria-hidden="true">
      <picture>
        <source media="(max-width: 600px)" srcSet="/images/mirastros-cosmos-mobile.webp" />
        <img className="hero-bg-img" src="/images/mirastros-cosmos.webp" alt="" fetchPriority="high" decoding="async" />
      </picture>
    </div>
    <div className={`hero-overlay ${styles.overlay}`} aria-hidden="true" />
    <OrnamentFrame className={styles.frame} />
    <div className={`hero-logo-buttons-group ${styles.content}`}>
      <MirastrosSeal className={styles.astrolabe} />
      <h1 id="landing-title" className={styles.logo}><img src="/logo.png" alt="Mirastros" width="800" height="205" fetchPriority="high" /></h1>
      <p className={styles.tagline}><span>Ваш путь.</span> <span>Ваша судьба.</span> <span>Ваша вселенная.</span></p>
      <p className={styles.invitation}>Открой свой космический путь</p>
      <div className={styles.rule} aria-hidden="true"><span>✦</span></div>
      <p className={styles.description}>Астрология, нумерология, Таро и древние знания<br className={styles.desktopBreak} /> и символических практик для осознанной жизни.</p>
      <nav className={styles.actions} aria-label="Вход в Mirastros">
        <Link href="/auth/login" className={styles.login}><span aria-hidden="true">✧</span> Вход</Link>
        <Link href="/auth/register" className={styles.register}><span aria-hidden="true">✦</span> Регистрация</Link>
      </nav>

    </div>
    {showScrollCue && <div className={styles.scrollCue} aria-hidden="true"><span />Листайте — впереди ваш мир Mirastros</div>}
  </section>
);
