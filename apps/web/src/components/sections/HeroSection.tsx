'use client';

import Link from 'next/link';
import { OrnamentFrame, MirastrosSeal } from '../ornaments/OrnamentFrame';
import styles from './HeroSection.module.css';

interface HeroSectionProps { id?: string; showScrollCue?: boolean; }

export const HeroSection = ({ id = 'hero', showScrollCue = true }: HeroSectionProps) => (
  <section id={id} className={`mira-section active ${styles.root}`} aria-labelledby="landing-title">
    <div className={`hero-bg-wrapper ${styles.background}`} aria-hidden="true">
      <picture>
        <source media="(max-width: 600px)" srcSet="/images/mirastros-sanctuary.webp" />
        <img className="hero-bg-img" src="/images/mirastros-sanctuary.webp" alt="" fetchPriority="high" decoding="async" />
      </picture>
    </div>
    <div className={`hero-overlay ${styles.overlay}`} aria-hidden="true" />
    <OrnamentFrame className={styles.frame} />
    <div className={`hero-logo-buttons-group ${styles.content}`}>
      <MirastrosSeal className={styles.astrolabe} />
      <h1 id="landing-title" className={styles.logo}><img src="/logo.png" alt="Mirastros" width="800" height="205" fetchPriority="high" /></h1>
      <p className={styles.tagline}>Твой путь к звёздам и себе</p>
      <p className={styles.invitation}>Открой свой космический путь</p>
      <div className={styles.rule} aria-hidden="true"><span>✦</span></div>
      <p className={styles.description}>Астрология, нумерология, Таро и древние знания<br className={styles.desktopBreak} /> для осознанного знакомства с собой.</p>
      <nav className={styles.actions} aria-label="Вход в Mirastros">
        <Link href="/auth/login" className={`mira-action mira-action-primary ${styles.login}`}><span aria-hidden="true">✧</span> Вход</Link>
        <Link href="/auth/register" className={`mira-action mira-action-secondary ${styles.register}`}><span aria-hidden="true">✦</span> Регистрация</Link>
      </nav>

    </div>
    <ul className={styles.benefits} aria-label="Возможности Mirastros">
      {[
        ['Один профиль', 'Для всех направлений', 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-2a8 8 0 0 1 16 0v2'],
        ['Личная история', 'Ваши результаты', 'M4 4h16v17H4V4Zm4 5h8m-8 4h8m-8 4h5'],
        ['Мир символов', 'Таро, числа и звёзды', 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z'],
        ['Свой ритм', 'Лунный календарь', 'M16 3a9 9 0 1 0 5 15A10 10 0 0 1 16 3Z'],
      ].map(([title, text, path]) => <li key={title}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth=".9" aria-hidden="true"><path d={path} /></svg><span><strong>{title}</strong><small>{text}</small></span></li>)}
    </ul>
    {showScrollCue && <div className={styles.scrollCue} aria-hidden="true"><span />Листайте — впереди ваш мир Mirastros</div>}
  </section>
);
