'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { User } from '../../types';
import { cleanText, dayInZone, forecastCopy, illuminationOf, lunarRhythm, nextMoonEvent, resolveTimeZone, resolveZodiac } from './dailyOverviewModel';
import { useDailyOverview } from './useDailyOverview';
import styles from './DailyOverview.module.css';

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d={diagonal ? 'M5 15 15 5M5 5h10v10' : 'M3 10h13m-5-5 5 5-5 5'} /></svg>;
}

function Ornament({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="76" height="76" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <path d="M3 77V14C3 7 7 3 14 3h63M9 68V17c0-5 3-8 8-8h51M3 35C22 35 35 22 35 3M9 47C26 44 44 26 47 9" />
      <path d="M8 8c20-3 28 11 20 19C19 35 5 22 8 8Zm7 7c12 0 18 8 10 11-5 2-11-4-10-11ZM3 54c16-20 20-7 13-3S5 66 9 70M54 3c-20 16-7 20-3 13S66 5 70 9M19 3l8 8M3 19l8 8M37 17l7 7-7 7-7-7Z" />
      <path d="M40 40c9-3 16-9 20-18-2 13-9 22-20 25-3 11-12 18-25 20 9-4 15-11 18-20l7-7Z" />
      <circle cx="24" cy="24" r="3" /><circle cx="8" cy="8" r="2" /><path d="m50 50 3-7 3 7-3 7-3-7Z" />
    </svg>
  );
}

function Astrolabe({ symbol }: { symbol: string }) {
  return (
    <svg viewBox="0 0 220 220" className={styles.astrolabe} aria-hidden="true">
      <circle cx="110" cy="110" r="102" />
      <circle cx="110" cy="110" r="88" />
      <circle cx="110" cy="110" r="65" />
      <path d="m110 19 23 59 63 4-49 40 16 64-53-35-53 35 16-64-49-40 63-4Z" />
      <path d="m110 8 0 38m0 128v38M8 110h38m128 0h38M38 38l26 26m92 92 26 26m0-144-26 26m-92 92-26 26" />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx="110" cy="15" r="1.7" transform={`rotate(${i * 30} 110 110)`} />
      ))}
      <text x="110" y="125" textAnchor="middle">{symbol}</text>
    </svg>
  );
}

function Artifact({ kind }: { kind: 'energy' | 'event' | 'advice' }) {
  return <svg className={styles.artifact} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="32" cy="32" r="29" strokeOpacity=".25" /><circle cx="32" cy="32" r="25" strokeOpacity=".15" />
    {kind === 'energy' ? <><path d="m32 8 13 21-13 25-13-25L32 8Zm0 0v46M19 29h26M32 8l5 21-5 25-5-25 5-21Z" /><path d="m10 15 2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" /></> : kind === 'event' ? <><path d="M39 12a21 21 0 1 0 13 32A22 22 0 0 1 39 12Z" /><path d="m43 10 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" /><circle cx="21" cy="33" r="3" strokeOpacity=".4" /></> : <><path d="M32 21c-6-5-14-5-21-2v28c7-3 15-3 21 2 6-5 14-5 21-2V19c-7-3-15-3-21 2Zm0 0v28M16 25l10 1m-10 5 10 1m-10 5 10 1m12-12 10-1m-10 7 10-1m-10 7 10-1" /><path d="m32 5 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" /></>}
  </svg>;
}

function MoonVisual({ phase }: { phase?: string }) {
  const waxing = phase?.startsWith('waxing') || phase === 'first_quarter';
  const shadow = phase === 'new_moon' ? 0 : phase === 'full_moon' ? 130 :
    phase?.includes('crescent') ? 25 : phase?.includes('gibbous') ? 84 : 55;
  return (
    <div className={styles.moonOrbit} aria-hidden="true">
      <span className={styles.orbitStar}>✦</span>
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

export function DailyOverview({ user }: { user: User }) {
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
  const zodiacSymbol = zodiac ? `${zodiac[1].emoji}\uFE0E` : '✧';
  const { forecast, moon, forecastState, moonState, updatedAt, refresh } = useDailyOverview(user.id, zodiac?.[0], today, timeZone);
  const copy = forecastCopy(forecast);
  const illumination = illuminationOf(moon);
  const rhythm = lunarRhythm(moon);
  const event = nextMoonEvent(moon, today);
  const moonSign = resolveZodiac(moon?.zodiac_sign)?.[1].name || moon?.zodiac_sign || 'Нет данных';
  const dateLabel = new Intl.DateTimeFormat('ru-RU', { timeZone, weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  const zoneLabel = new Intl.DateTimeFormat('ru-RU', { timeZone, timeZoneName: 'short' }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value;
  const updatedLabel = updatedAt ? new Intl.DateTimeFormat('ru-RU', { timeZone, hour: '2-digit', minute: '2-digit' }).format(updatedAt) : null;
  const forecastHref = `/services/horoscope${zodiac ? `?sign=${zodiac[0]}&period=daily` : ''}`;
  const loading = forecastState === 'loading' || moonState === 'loading';
  const partial = forecastState === 'error' || moonState === 'error';
  const name = user.fullName?.trim().split(/\s+/)[0] || 'Искатель';
  const tier = user.subscriptionTier === 'platinum' ? 'Platinum' : user.subscriptionTier === 'premium' ? 'Premium' : 'Базовый доступ';

  const panelOrnaments = <span className={styles.panelTrim} aria-hidden="true"><Ornament /><Ornament /><Ornament /><Ornament /></span>;

  return (
    <section className={`personal-hero-root ${styles.root}`} aria-labelledby="daily-overview-title">
      <div className={`personal-hero-bg ${styles.background}`} aria-hidden="true">
        <img className="hero-bg-img" src="/images/mirastros-cosmos.webp" alt="" />
      </div>
      <div className={`personal-hero-overlay ${styles.overlay}`} aria-hidden="true" />
      <div className={styles.screenFrame} aria-hidden="true" />
      <div className={styles.shell}>
        <Ornament className={`${styles.corner} ${styles.topLeft}`} />
        <Ornament className={`${styles.corner} ${styles.topRight}`} />
        <Ornament className={`${styles.corner} ${styles.bottomLeft}`} />
        <Ornament className={`${styles.corner} ${styles.bottomRight}`} />

        <header className={styles.header}>
          <Link href="/dashboard" className={styles.brand} aria-label="Mirastros — личный кабинет"><span className={styles.brandSeal} aria-hidden="true"><b>M</b></span> MIRASTROS</Link>
          <div className={styles.account}>
            <Link href="/subscription" className={styles.tier}>{tier}</Link>
            <Link href="/profile" className={styles.profile} aria-label="Открыть профиль">{name.slice(0, 1).toUpperCase()}</Link>
          </div>
        </header>

        <div className={styles.intro}>
          <div><p className={styles.eyebrow}>Личный кабинет · сводка на сегодня</p><h1 id="daily-overview-title">Ваш сегодняшний космос, <em>{name}</em></h1></div>
          <div className={styles.date}><time dateTime={today}>{dateLabel}</time><span>{zodiac?.[1].name || 'Знак не указан'} <i aria-hidden="true">·</i> {zoneLabel}</span></div>
        </div>
        <div className={styles.divider} aria-hidden="true"><span>✧</span></div>

        <div className={styles.mainGrid}>
          <article className={`${styles.panel} ${styles.moonPanel} personal-hero-block`} aria-busy={moonState === 'loading'}>
            {panelOrnaments}
            <p className={styles.eyebrow}><span aria-hidden="true">☽</span> Луна сейчас</p>
            {moonState !== 'error' && <MoonVisual phase={rhythm ? moon?.phase : undefined} />}
            <h2>{moon?.phase_name || (moonState === 'loading' ? 'Считываем лунный ритм…' : 'Лунные данные недоступны')}</h2>
            {moonState === 'error' && <p className={styles.state}>Обновите сводку, чтобы повторить.</p>}
            <dl className={styles.moonStats}>
              <div><dt>Освещённость</dt><dd>{illumination === null ? 'Нет данных' : `${Math.round(illumination)}%`}</dd></div>
              <div><dt>Луна в знаке</dt><dd>{moonSign}</dd></div>
            </dl>
            <Link className={styles.textLink} href="/services/lunar">Лунный календарь <ArrowIcon diagonal /></Link>
          </article>

          <article className={`${styles.focusPanel} personal-hero-block`} aria-busy={forecastState === 'loading'}>
            <p className={styles.eyebrow}>✦ Фокус дня</p>
            <div className={styles.portalEmblem}><Astrolabe symbol={zodiacSymbol} /><span className={styles.portalHalo} aria-hidden="true" /></div>
            <h2>{copy.focus || (forecastState === 'missing' ? 'Начните с себя' : forecastState === 'error' ? 'Ваш день — больше одного прогноза' : 'Настраиваем ваш дневной ориентир…')}</h2>
            <p className={styles.focusNote}>{forecastState === 'missing'
              ? 'Добавьте данные рождения в профиль, чтобы здесь появился ваш прогноз.'
              : forecastState === 'error' ? 'Прогноз не загрузился. Лунная сводка доступна независимо — вернуться к прогнозу можно позже.'
              : forecast ? forecast.is_personalized ? 'Главное из вашего персонального прогноза на сегодня.' : `Главное из общего прогноза для знака ${zodiac?.[1].name || ''}.` : 'Обращаемся к прогнозу на текущую дату.'}</p>
            <Link className={styles.primaryAction} href={forecastState === 'missing' ? '/profile' : forecastHref}>{forecastState === 'missing' ? 'Заполнить профиль' : 'Открыть прогноз'} <ArrowIcon /></Link>
          </article>

          <article className={`${styles.panel} ${styles.forecastPanel} personal-hero-block`} aria-busy={forecastState === 'loading'}>
            {panelOrnaments}
            <p className={styles.eyebrow}><span aria-hidden="true">☉</span> Гороскоп сегодня</p>
            <div className={styles.forecastHeading}><h2>{zodiac?.[1].name || 'Ваш знак'}</h2><span aria-hidden="true">{zodiacSymbol}</span></div>
            {forecast ? <><p className={styles.forecastText}>{copy.forecast}</p><p className={styles.caption}>{forecast.is_personalized ? 'Персональная интерпретация' : 'Общий прогноз по знаку'}</p></>
              : <p className={styles.state}>{forecastState === 'missing' ? 'Укажите данные рождения в профиле. Мы не будем угадывать ваш знак.' : forecastState === 'error' ? 'Не удалось получить прогноз. Обновите сводку, чтобы повторить попытку.' : 'Загружаем прогноз на сегодня…'}</p>}
            <Link className={styles.textLink} href={forecastState === 'missing' ? '/profile' : forecastHref}>{forecastState === 'missing' ? 'К профилю' : 'Читать целиком'} <ArrowIcon diagonal /></Link>
          </article>
        </div>

        <div className={styles.bottomGrid}>
          <article className={`${styles.panel} ${styles.smallPanel} personal-hero-block`}>
            {panelOrnaments}
            <Artifact kind="energy" />
            <p className={styles.eyebrow}>Энергия дня</p>
            <h2>{rhythm?.title || (moonState === 'loading' ? 'Определяем ритм…' : 'Ритм пока неизвестен')}</h2>
            <p>{rhythm?.text || 'Появится после загрузки лунной фазы.'}</p>
            <span className={styles.caption}>Символика лунной фазы</span>
          </article>
          <article className={`${styles.panel} ${styles.smallPanel} personal-hero-block`}>
            {panelOrnaments}
            <Artifact kind="event" />
            <p className={styles.eyebrow}>Ближайшее событие</p>
            <h2>{event?.title || (moonState === 'loading' ? 'Сверяем календарь…' : 'Дата пока неизвестна')}</h2>
            {event ? <><p className={styles.eventDate}><time dateTime={event.date}>{new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${event.date}T12:00:00Z`))}</time></p><Link className={styles.textLink} href="/services/lunar">Посмотреть календарь <ArrowIcon diagonal /></Link></> : <p>Покажем ближайшее новолуние или полнолуние, когда получим дату.</p>}
          </article>
          <article className={`${styles.panel} ${styles.smallPanel} ${styles.advicePanel} personal-hero-block`}>
            {panelOrnaments}
            <Artifact kind="advice" />
            <p className={styles.eyebrow}>Рекомендация дня</p>
            <h2>Один шаг для себя</h2>
            <p>{copy.advice || (forecastState === 'missing' ? 'Начните с профиля: ваши данные помогут настроить личную сводку.' : forecastState === 'loading' ? 'Совет появится вместе с прогнозом.' : 'Отдельной рекомендации пока нет. Выберите полезное действие из полного прогноза.')}</p>
          </article>
        </div>

        <footer className={styles.footer}>
          <div className={styles.freshness} role="status"><span className={partial ? styles.warningDot : loading ? styles.loadingDot : styles.readyDot} />{loading ? 'Обновляем сводку…' : partial ? 'Часть данных недоступна' : updatedLabel ? `Проверено в ${updatedLabel}` : 'Сводка на сегодня'}<button type="button" onClick={refresh} disabled={loading} aria-label="Обновить сводку" className={styles.refresh}>↻</button></div>
          <Link className={styles.catalogLink} href="/services">Дальше — ваш мир Mirastros <span aria-hidden="true">↓</span></Link>
        </footer>
      </div>
    </section>
  );
}
