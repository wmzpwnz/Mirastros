'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { User } from '../../types';
import { dailyPractice, dailyQuestion, dayInZone, forecastCopy, illuminationOf, lunarRhythm, nextMoonEvent, personalDay, resolveTimeZone, resolveZodiac } from './dailyOverviewModel';
import { useDailyOverview } from './useDailyOverview';
import { OrnamentFrame } from '../ornaments/OrnamentFrame';
import { MOON_PHASE_NAMES_EXTENDED } from '../../constants/moon';
import { tarotCardForDate } from '../../constants/dailyTarot';
import styles from './DailyOverview.module.css';

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d={diagonal ? 'M5 15 15 5M5 5h10v10' : 'M3 10h13m-5-5 5 5-5 5'} /></svg>;
}

function DailyNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const node = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = node.current;
    if (!element || !value || !window.matchMedia ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = performance.now();
    let frame: number;
    const draw = (time: number) => {
      const progress = Math.min(1, (time - start) / 650);
      element.textContent = Math.round(value * (1 - (1 - progress) ** 3)) + suffix;
      if (progress < 1) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [value, suffix]);
  return <span ref={node} aria-live="off">{value}{suffix}</span>;
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
  const { forecast, moon, forecastState, moonState, updatedAt, refresh, recentItems, historyState } = useDailyOverview(user.id, zodiac?.[0], today, timeZone);
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
  const personal = personalDay(user.birthDate, today);
  const practice = dailyPractice(moon?.phase, today);
  const practiceKey = `mirastros:daily-practice:${user.id}:${today}`;
  const [practiceDone, setPracticeDone] = useState(false);
  const formulaDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setPracticeDone(window.localStorage.getItem(practiceKey) === 'done');
  }, [practiceKey]);

  const togglePractice = () => {
    const next = !practiceDone;
    setPracticeDone(next);
    if (next) window.localStorage.setItem(practiceKey, 'done');
    else window.localStorage.removeItem(practiceKey);
  };

  const nav = [
    ['/dashboard', 'Сводка дня', '☉'],
    ['/auth/onboarding?view=portrait', 'Мой портрет', '✧'],
    ['/services/lunar', 'Лунный календарь', '☾'],
    ['/history', 'Моя история', '◷'],
    ['/profile', 'Профиль', '♙'],
  ];
  const phase = moon && (MOON_PHASE_NAMES_EXTENDED[moon.phase] || moon.phase_name);
  const frame = <OrnamentFrame className={styles.trim} />;
  const cardToday = tarotCardForDate(today);

  return <section className={styles.root} aria-labelledby="daily-overview-title">
    <header className={styles.header}>
      <Link href="/dashboard" aria-label="Mirastros — личный кабинет"><img className={styles.logo} src="/logo.png" alt="Mirastros" width="800" height="205" /></Link>
      <div className={styles.account}><Link href="/subscription">{tier}</Link><Link href="/profile" className={styles.avatar} aria-label="Открыть профиль">{name.slice(0, 1)}</Link></div>
    </header>
    <div className={styles.layout}>
      <aside className={styles.rail}><nav className={styles.sidebar} aria-label="Личный кабинет">
        {nav.map(([url, label, icon]) => <Link href={url} key={url} aria-current={url === '/dashboard' ? 'page' : undefined}><span aria-hidden="true">{icon}</span>{label}</Link>)}
        <Link href="/services"><span aria-hidden="true">✥</span>Все направления</Link>
      </nav>        <section className={styles.historyPanel} aria-labelledby="recent-history-title">
          {frame}<div className={styles.historyHeading}><div><p className={styles.label}>Личная библиотека</p><h2 id="recent-history-title">Недавние открытия</h2></div><Link className={styles.link} href="/history">Вся история <ArrowIcon /></Link></div>
          {historyState === 'loading' ? <p className={styles.detail}>Открываем ваши последние результаты…</p>
            : historyState === 'error' ? <p className={styles.detail}>История временно недоступна. Попробуйте открыть её чуть позже.</p>
              : recentItems.length ? <div className={styles.recentList}>{recentItems.slice(0, 4).map(item => <Link href={`/history/${encodeURIComponent(item.type)}/${encodeURIComponent(item.id)}`} key={`${item.type}:${item.id}`} className={styles.recentItem}><span className={styles.recentIcon} aria-hidden="true">{item.type === 'tarot' ? '✧' : item.type === 'numerology' ? '◇' : item.type === 'dreams' ? '☾' : '✦'}</span><span><strong>{item.title}</strong><small>{new Intl.DateTimeFormat('ru-RU', { timeZone, day: 'numeric', month: 'long' }).format(new Date(item.created_at))}</small></span><ArrowIcon /></Link>)}</div>
                : <div className={styles.emptyHistory}><p>Здесь появятся сохранённые расклады и расчёты.</p>{openDirections ? <button type="button" onClick={openDirections}>Выбрать первое направление <ArrowIcon /></button> : <Link href="/services">Выбрать первое направление <ArrowIcon /></Link>}</div>}
        </section>
</aside>
      <div className={styles.content}>
        <div className={styles.heading}>
          <div><time dateTime={today}>{dateLabel}</time><h1 id="daily-overview-title">Ваш день, {name}</h1></div>
          <div className={styles.freshness} role="status"><span>{loading ? 'Обновляем…' : partial ? 'Часть данных недоступна' : updatedLabel ? `Обновлено в ${updatedLabel}` : zoneLabel}</span>
            <button type="button" onClick={refresh} disabled={loading} aria-label="Обновить сводку">↻</button>
          </div>
        </div>

        <div className={styles.sky}><article className={styles.hero} aria-busy={forecastState === 'loading'}>
          {frame}
          <div className={styles.heroCopy}>
            <p className={styles.label}>{forecast?.is_personalized ? 'Персональный гороскоп' : 'Гороскоп на сегодня'}</p>
            <h2>{zodiac?.[1].name || 'Ваш гороскоп'}</h2>
            {forecast ? <><p className={styles.focus}>{copy.focus}</p>{copy.forecast && <p className={styles.excerpt}>{copy.forecast}</p>}</>
              : <p className={styles.focus}>{forecastState === 'missing' ? 'Добавьте дату рождения, чтобы открыть прогноз для своего знака.' : forecastState === 'error' ? 'Сегодняшний прогноз пока недоступен.' : 'Загружаем прогноз…'}</p>}
            <Link className={styles.forecastLink} href={forecastState === 'missing' ? '/profile' : forecastHref}>{forecastState === 'missing' ? 'Заполнить профиль' : 'Открыть прогноз'} <ArrowIcon /></Link>
          </div>
          {zodiac && <div className={styles.signArt} aria-hidden="true">
            <img src={zodiac[0] === 'aries' ? '/zodiac/aries.png' : '/images/preloader-zodiac-gold.webp'} alt="" width="666" height="666" />
            {zodiac[0] !== 'aries' && <span>{zodiac[1].emoji.replace(/\uFE0F/g, '')}︎</span>}
          </div>}
        </article>

          <article className={styles.observatory} aria-busy={moonState === 'loading'}>
            {frame}<p className={styles.label}>Лунный ритм</p>
            <div className={styles.lunar}>
              <MoonVisual phase={moon?.phase} />
              <div><h2>{phase || (moonState === 'loading' ? 'Загрузка…' : 'Лунные данные недоступны')}</h2>
                {moon && <p>{moonSign} · Освещённость <strong>{illumination === null ? '—' : <DailyNumber value={Math.round(illumination)} suffix="%" />}</strong></p>}
              </div>
            </div>
            
            {rhythm && <p className={styles.lunarNote}>{rhythm.text}</p>}
            {event && <p className={styles.event}>{event.title} <time dateTime={event.date}>{new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${event.date}T12:00:00Z`))}</time></p>}
            <Link className={styles.link} href="/services/lunar">Лунный календарь <ArrowIcon /></Link>
          </article>
        </div>
        <section className={styles.metrics} aria-label="Ваши показатели на сегодня">
          <article className={styles.metric}>
            {frame}<p className={styles.label}>Личный день</p>
            {personal ? <><strong><DailyNumber value={personal.value} /></strong><span>{personal.meaning}</span><button type="button" className={styles.formulaToggle} aria-haspopup="dialog" onClick={() => formulaDialog.current?.showModal()}>Как рассчитано?</button>
              <dialog ref={formulaDialog} className={styles.dialog} aria-label="Расчёт личного дня" data-lenis-prevent>
                <form method="dialog"><button>Закрыть</button></form><h2>Расчёт личного дня</h2><p>{personal.formula}</p>
              </dialog></>
              : <><span>Добавьте дату рождения</span><Link className={styles.metricLink} href="/profile">Заполнить профиль <ArrowIcon /></Link></>}
          </article>
          <article className={styles.dailyAction}>{frame}
            <p className={styles.label}>Карта дня</p>
            <Link href="/services/tarot">{cardToday.name} <ArrowIcon /></Link><p className={styles.detail}>{cardToday.meaning}</p>
          </article>
          <article className={styles.dailyAction}>{frame}
            <p className={styles.label}>Практика дня</p>
            <p className={styles.detail}>{practice}</p><p className={styles.question}>{dailyQuestion(today)}</p>
            <button type="button" className={`${styles.practiceButton} ${practiceDone ? styles.practiceComplete : ''}`} onClick={togglePractice} aria-pressed={practiceDone}>
              <span aria-hidden="true">{practiceDone ? '✓' : '○'}</span><span className={styles.practiceText}>{practiceDone ? 'Отмечено на сегодня' : 'Отметить выполнение'}</span>
            </button>
          </article>
        </section>
      </div>
    </div>
  </section>;
}
