'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { User } from '../../types';
import { dayInZone, forecastCopy, illuminationOf, lunarRhythm, nextMoonEvent, resolveTimeZone, resolveZodiac } from './dailyOverviewModel';
import { useDailyOverview } from './useDailyOverview';
import { OrnamentFrame } from '../ornaments/OrnamentFrame';
import { MOON_PHASE_NAMES_EXTENDED } from '../../constants/moon';
import styles from './DailyOverview.module.css';

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d={diagonal ? 'M5 15 15 5M5 5h10v10' : 'M3 10h13m-5-5 5 5-5 5'} /></svg>;
}

function MoonVisual({ phase }: { phase?: string }) {
  const waxing = phase?.startsWith('waxing') || phase === 'first_quarter';
  const shadow = phase === 'new_moon' ? 0 : phase === 'full_moon' ? 130 :
    phase?.includes('crescent') ? 25 : phase?.includes('gibbous') ? 84 : 55;
  return (
    <div className={styles.moonOrbit} aria-hidden="true">

      <svg viewBox="0 0 160 160" className={styles.moon}>
        <defs>
          <radialGradient id="daily-moon-surface" cx="32%" cy="25%" r="80%">
            <stop stopColor="#f7f2e9" /><stop offset=".5" stopColor="#b9bdce" /><stop offset="1" stopColor="#6a708a" />
          </radialGradient>
          <filter id="daily-moon-texture"><feTurbulence type="fractalNoise" baseFrequency=".075" numOctaves="4" seed="11" /><feColorMatrix type="saturate" values="0" /><feBlend in="SourceGraphic" mode="soft-light" /></filter>
          <clipPath id="daily-moon-disc"><circle cx="80" cy="80" r="55" /></clipPath>
        </defs>
        {phase ? <g clipPath="url(#daily-moon-disc)">
          <circle cx="80" cy="80" r="55" fill="url(#daily-moon-surface)" filter="url(#daily-moon-texture)" />

          <circle cx={80 + (waxing ? -shadow : shadow)} cy="80" r="55" fill="#121126" opacity=".96" />
        </g> : <circle cx="80" cy="80" r="55" fill="#141326" stroke="#a5a4be" strokeOpacity=".3" />}
        <circle cx="80" cy="80" r="55" fill="none" stroke="#d9d7e7" strokeOpacity=".3" />
      </svg>
    </div>
  );
}

export function DailyOverview({ user, openDirections }: { user: User; openDirections?: () => void }) {
  const timeZone = resolveTimeZone(user.timezone);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    const onVisible = () => { if (document.visibilityState === 'visible') setNow(new Date()); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, []);
  const today = dayInZone(now, timeZone);
  const zodiac = resolveZodiac(user.zodiacSign);
  const { forecast, moon, forecastState, moonState, updatedAt, refresh } = useDailyOverview(user.id, zodiac?.[0], today, timeZone);
  const copy = forecastCopy(forecast);
  const illumination = illuminationOf(moon);
  const rhythm = lunarRhythm(moon);
  const event = nextMoonEvent(moon, today);
  const moonSign = resolveZodiac(moon?.zodiac_sign)?.[1].name || moon?.zodiac_sign || 'Нет данных';
  const dateLabel = new Intl.DateTimeFormat('ru-RU', { timeZone, weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  const zoneLabel = new Intl.DateTimeFormat('ru-RU', { timeZone, timeZoneName: 'short' }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value;
  const updatedLabel = updatedAt ? new Intl.DateTimeFormat('ru-RU', { timeZone, hour: '2-digit', minute: '2-digit' }).format(updatedAt) : null;
  const forecastHref = `/services/horoscope${zodiac ? `?sign=${zodiac[0]}&period=daily&date=${today}` : ''}`;
  const loading = forecastState === 'loading' || moonState === 'loading';
  const partial = forecastState === 'error' || moonState === 'error';
  const name = user.fullName?.trim().split(/\s+/)[0] || 'Искатель';
  const tier = user.subscriptionTier === 'platinum' ? 'Platinum' : user.subscriptionTier === 'premium' ? 'Premium' : 'Базовый доступ';

  const nav = [
    ['/dashboard', 'Сводка дня', '☉'],
    ['/auth/onboarding?view=portrait', 'Мой портрет', '✧'],
    ['/services/lunar', 'Лунный календарь', '☾'],
    ['/history', 'Моя история', '◷'],
    ['/profile', 'Профиль', '♙'],
  ];
  const phase = moon && (MOON_PHASE_NAMES_EXTENDED[moon.phase] || moon.phase_name);
  const frame = <OrnamentFrame className={styles.trim} />;
  const directions = openDirections
    ? <button className={styles.travel} onClick={openDirections}>Войти в туннель <ArrowIcon /></button>
    : <Link className={styles.travel} href="/services">К направлениям <ArrowIcon /></Link>;

  return <section className={styles.root} aria-labelledby="daily-overview-title">
    <header className={styles.header}>
      <Link href="/dashboard" aria-label="Mirastros — личный кабинет"><img className={styles.logo} src="/logo.png" alt="Mirastros" width="800" height="205" /></Link>
      <div className={styles.account}><Link href="/subscription">{tier}</Link><Link href="/profile" className={styles.avatar} aria-label="Открыть профиль">{name.slice(0, 1)}</Link></div>
    </header>
    <div className={styles.layout}>
      <nav className={styles.sidebar} aria-label="Личный кабинет">
        {nav.map(([url, label, icon]) => <Link href={url} key={url} aria-current={url === '/dashboard' ? 'page' : undefined}><span aria-hidden="true">{icon}</span>{label}</Link>)}
        <Link href="/services"><span aria-hidden="true">✥</span>Все направления</Link>
      </nav>
      <div className={styles.content}>
        <div className={styles.heading}>
          <div><time dateTime={today}>{dateLabel}</time><h1 id="daily-overview-title">Ваш день, {name}</h1></div>
          <div className={styles.freshness} role="status"><span>{loading ? 'Обновляем…' : partial ? 'Часть данных недоступна' : updatedLabel ? `Обновлено в ${updatedLabel}` : zoneLabel}</span>
            <button type="button" onClick={refresh} disabled={loading} aria-label="Обновить сводку">↻</button>
          </div>
        </div>

        <article className={styles.hero} aria-busy={forecastState === 'loading'}>
          {frame}
          <div className={styles.heroCopy}>
            <p className={styles.label}>{forecast?.is_personalized ? 'Персональный гороскоп' : 'Гороскоп на сегодня'}</p>
            <h2>{zodiac?.[1].name || 'Ваш гороскоп'}</h2>
            {forecast ? <><p className={styles.focus}>{copy.focus}</p><p className={styles.excerpt}>{copy.forecast}</p></>
              : <p className={styles.focus}>{forecastState === 'missing' ? 'Добавьте дату рождения, чтобы открыть прогноз для своего знака.' : forecastState === 'error' ? 'Сегодняшний прогноз пока недоступен.' : 'Загружаем прогноз…'}</p>}
            <Link className="mira-action mira-action-primary" href={forecastState === 'missing' ? '/profile' : forecastHref}>{forecastState === 'missing' ? 'Заполнить профиль' : 'Открыть прогноз'} <ArrowIcon /></Link>
          </div>
          {zodiac && <div className={styles.signArt} aria-hidden="true">
            <img src={zodiac[0] === 'aries' ? '/zodiac/aries.png' : '/images/preloader-zodiac-gold.webp'} alt="" width="666" height="666" />
            {zodiac[0] !== 'aries' && <span>{zodiac[1].emoji.replace(/\uFE0F/g, '')}︎</span>}
          </div>}
        </article>

        <div className={styles.grid}>
          <article className={styles.panel} aria-busy={moonState === 'loading'}>
            {frame}<p className={styles.label}>Луна сейчас</p>
            <div className={styles.lunar}>
              <MoonVisual phase={moon?.phase} />
              <div><h2>{phase || (moonState === 'loading' ? 'Загрузка…' : 'Лунные данные недоступны')}</h2>
                {moon && <p>{moonSign} · Освещённость <strong>{illumination === null ? '—' : `${Math.round(illumination)}%`}</strong></p>}
              </div>
            </div>
            {rhythm && <p className={styles.detail}>{rhythm.text}</p>}
            {event && <p className={styles.event}>{event.title} <time dateTime={event.date}>{new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${event.date}T12:00:00Z`))}</time></p>}
            <Link className={styles.link} href="/services/lunar">Лунный календарь <ArrowIcon /></Link>
          </article>
          <article className={styles.panel}>
            {frame}<p className={styles.label}>Рекомендация дня</p>
            <h2>Один шаг для себя</h2>
            <p className={styles.detail}>{copy.advice || (forecastState === 'loading' ? 'Загружаем рекомендацию…' : 'Вернитесь к личному портрету и выберите тему, которую хотите изучить сегодня.')}</p>
            <Link className={styles.link} href="/auth/onboarding?view=portrait">Мой портрет <ArrowIcon /></Link>
          </article>
        </div>
        <div className={styles.directions}>{frame}<div><h2>Направления Mirastros</h2><p>Таро, натальная карта, матрица судьбы</p></div>{directions}</div>
      </div>
    </div>
  </section>;
}
