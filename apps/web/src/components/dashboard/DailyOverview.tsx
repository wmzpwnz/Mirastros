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
    <svg className={className} width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
      <path d="M2 40V11C2 6 6 2 11 2H40M8 34V13c0-3 2-5 5-5h21M2 19c9 0 17-8 17-17M8 26c7-2 12-7 14-14" />
      <path d="m7 7 5 2-3 3-2-5ZM23 2l3 3 3-3M2 23l3 3-3 3" />
      <circle cx="16" cy="16" r="2" />
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
          <clipPath id="daily-moon-disc"><circle cx="80" cy="80" r="55" /></clipPath>
        </defs>
        {phase ? <g clipPath="url(#daily-moon-disc)">
          <circle cx="80" cy="80" r="55" fill="url(#daily-moon-surface)" />
          <g fill="#62697f" opacity=".22"><circle cx="60" cy="65" r="15" /><circle cx="92" cy="103" r="19" /><circle cx="103" cy="55" r="9" /><circle cx="50" cy="98" r="7" /></g>
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

  return (
    <section className={`personal-hero-root ${styles.root}`} aria-labelledby="daily-overview-title">
      <div className={`personal-hero-bg ${styles.background}`} aria-hidden="true">
        <img className="hero-bg-img" src="/background.jpg" alt="" />
      </div>
      <div className={`personal-hero-overlay ${styles.overlay}`} aria-hidden="true" />
      <div className={styles.shell}>
        <Ornament className={`${styles.corner} ${styles.topLeft}`} />
        <Ornament className={`${styles.corner} ${styles.topRight}`} />
        <Ornament className={`${styles.corner} ${styles.bottomLeft}`} />
        <Ornament className={`${styles.corner} ${styles.bottomRight}`} />

        <header className={styles.header}>
          <Link href="/dashboard" className={styles.brand} aria-label="Mirastros — личный кабинет"><span aria-hidden="true">✧</span> MIRASTROS</Link>
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

          <article className={`${styles.panel} ${styles.focusPanel} personal-hero-block`} aria-busy={forecastState === 'loading'}>
            <p className={styles.eyebrow}>✦ Фокус дня</p>
            <Astrolabe symbol={zodiacSymbol} />
            <h2>{copy.focus || (forecastState === 'missing' ? 'Начните с себя' : forecastState === 'error' ? 'Ваш день — больше одного прогноза' : 'Настраиваем ваш дневной ориентир…')}</h2>
            <p className={styles.focusNote}>{forecastState === 'missing'
              ? 'Добавьте данные рождения в профиль, чтобы здесь появился ваш прогноз.'
              : forecastState === 'error' ? 'Прогноз не загрузился. Лунная сводка доступна независимо — вернуться к прогнозу можно позже.'
              : forecast ? forecast.is_personalized ? 'Главное из вашего персонального прогноза на сегодня.' : `Главное из общего прогноза для знака ${zodiac?.[1].name || ''}.` : 'Обращаемся к прогнозу на текущую дату.'}</p>
            <Link className={styles.primaryAction} href={forecastState === 'missing' ? '/profile' : forecastHref}>{forecastState === 'missing' ? 'Заполнить профиль' : 'Открыть прогноз'} <ArrowIcon /></Link>
          </article>

          <article className={`${styles.panel} ${styles.forecastPanel} personal-hero-block`} aria-busy={forecastState === 'loading'}>
            <p className={styles.eyebrow}><span aria-hidden="true">☉</span> Гороскоп сегодня</p>
            <div className={styles.forecastHeading}><h2>{zodiac?.[1].name || 'Ваш знак'}</h2><span aria-hidden="true">{zodiacSymbol}</span></div>
            {forecast ? <><p className={styles.forecastText}>{copy.forecast}</p><p className={styles.caption}>{forecast.is_personalized ? 'Персональная интерпретация' : 'Общий прогноз по знаку'}</p></>
              : <p className={styles.state}>{forecastState === 'missing' ? 'Укажите данные рождения в профиле. Мы не будем угадывать ваш знак.' : forecastState === 'error' ? 'Не удалось получить прогноз. Обновите сводку, чтобы повторить попытку.' : 'Загружаем прогноз на сегодня…'}</p>}
            <Link className={styles.textLink} href={forecastState === 'missing' ? '/profile' : forecastHref}>{forecastState === 'missing' ? 'К профилю' : 'Читать целиком'} <ArrowIcon diagonal /></Link>
          </article>
        </div>

        <div className={styles.bottomGrid}>
          <article className={`${styles.panel} ${styles.smallPanel} personal-hero-block`}>
            <p className={styles.eyebrow}><span aria-hidden="true">✧</span> Энергия дня</p>
            <h2>{rhythm?.title || (moonState === 'loading' ? 'Определяем ритм…' : 'Ритм пока неизвестен')}</h2>
            <p>{rhythm?.text || 'Появится после загрузки лунной фазы.'}</p>
            <span className={styles.caption}>Символика лунной фазы</span>
          </article>
          <article className={`${styles.panel} ${styles.smallPanel} personal-hero-block`}>
            <p className={styles.eyebrow}><span aria-hidden="true">◷</span> Ближайшее событие</p>
            <h2>{event?.title || (moonState === 'loading' ? 'Сверяем календарь…' : 'Дата пока неизвестна')}</h2>
            {event ? <><p className={styles.eventDate}><time dateTime={event.date}>{new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${event.date}T12:00:00Z`))}</time></p><Link className={styles.textLink} href="/services/lunar">Посмотреть календарь <ArrowIcon diagonal /></Link></> : <p>Покажем ближайшее новолуние или полнолуние, когда получим дату.</p>}
          </article>
          <article className={`${styles.panel} ${styles.smallPanel} ${styles.advicePanel} personal-hero-block`}>
            <p className={styles.eyebrow}><span aria-hidden="true">✦</span> Рекомендация дня</p>
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
