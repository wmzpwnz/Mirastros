'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import type { WelcomeLocation, WelcomePlace, WelcomePortrait, WelcomeState, WelcomeStep } from '../../services/welcomeTypes';
import { MirastrosSeal, OrnamentFrame } from '../ornaments/OrnamentFrame';
import styles from './PersonalWelcome.module.css';

function todayISO() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

const steps = ['Ваше имя', 'Дата рождения', 'Место и время'];
const headings = ['Как вас зовут?', 'Когда началась ваша история?', 'Где зажглась ваша звезда?'];
const descriptions = ['Откройте историю своего имени и первое послание Mirastros.', 'Дата откроет ваше число жизненного пути.', 'Город и время помогут раскрыть небесную часть вашего портрета.'];

function Reading({ portrait, step }: { portrait: WelcomePortrait; step: number }) {
  const { name, number, sky } = portrait;
  if (step === 1) return <><span className={styles.readingLabel}>История имени</span><h2>{name.name}</h2><p>{name.origin}</p><span className={styles.readingLabel}>Символическое послание</span><p>{name.message}</p></>;
  if (step === 2) return number ? <><span className={styles.readingLabel}>Число жизненного пути</span><h2>{number.value} <span>· {number.title}</span></h2><p>{number.message}</p><details><summary>Как получилось это число</summary><p className={styles.formula}>{number.formula}</p><p>Сумма цифр даты рождения. В этой системе числа 11, 22 и 33 сохраняются без сокращения.</p></details></> : <><h2>У каждой истории свой ритм</h2><p>Добавьте дату позже — тогда здесь появится ваш первый числовой ключ.</p></>;
  return sky?.available ? <><span className={styles.readingLabel}>Первые координаты вашего неба</span><dl className={styles.sky}><div><dt>☉ Солнце</dt><dd>{sky.sun?.join(' / ')}</dd></div><div><dt>☽ Луна</dt><dd>{sky.moon?.join(' / ')}</dd></div><div><dt>↗ Асцендент</dt><dd>{sky.ascendant || 'Нужно время'}</dd></div></dl><p>{sky.message}</p><p className={styles.note}>{sky.note}</p></> : <><h2>Ваша карта остаётся открытой</h2><p>{sky?.note || 'Место и время можно добавить позже в профиле. Для небесного портрета также нужна дата рождения.'}</p></>;
}

export function PersonalWelcome() {
  const router = useRouter();
  const [state, setState] = useState<WelcomeState | null>(null);
  const [step, setStep] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(true);
  const [city, setCity] = useState('');
  const [location, setLocation] = useState<WelcomeLocation | null>(null);
  const [places, setPlaces] = useState<WelcomePlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  const searchVersion = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const reading = useRef<HTMLElement>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        let value = await api.getWelcomeState();
        const params = new URLSearchParams(window.location.search);
        const portrait = params.get('view') === 'portrait';
        const editing = params.get('edit') === '1';
        if (value.completed && !portrait && !editing) { router.replace('/dashboard'); return; }
        if (!value.started && !portrait) value = await api.startWelcome();
        if (!mounted) return;
        setState(value);
        setName(value.profile.full_name);
        setBirthDate(value.profile.birth_date || '');
        setBirthTime(value.profile.birth_time?.slice(0, 5) || '');
        setUnknownTime(!value.profile.birth_time);
        setLocation(value.profile.birth_location);
        setCity(value.profile.birth_location?.city || '');
        setStep(portrait ? 4 : editing ? 1 : value.next_step);
        setError('');
      } catch (cause) {
        if (!mounted) return;
        const message = cause instanceof Error ? cause.message : 'Не удалось открыть знакомство.';
        if (/401|403|not authenticated|требуется авторизация/i.test(message)) router.replace('/auth/login');
        else setError('Не удалось загрузить ваш профиль. Проверьте соединение и попробуйте снова.');
      }
    }
    void load();
    return () => { mounted = false; };
  }, [router, attempt]);

  useEffect(() => { if (state) heading.current?.focus({ preventScroll: true }); }, [step, !!state]);
  useEffect(() => { if (revealed) reading.current?.focus({ preventScroll: true }); }, [revealed]);

  async function search() {
    if (searching) return;
    const query = city.trim();
    if (query.length < 3) { setSearchError('Введите не менее трёх символов.'); return; }
    const version = ++searchVersion.current;
    setSearching(true); setSearchError(''); setPlaces([]); setSearched(false);
    try {
      const result = await api.searchBirthplaces(query);
      if (version === searchVersion.current) { setPlaces(result); setSearched(true); }
    } catch (cause) {
      if (version === searchVersion.current) setSearchError(cause instanceof Error ? cause.message : 'Не удалось найти город. Попробуйте ещё раз.');
    } finally { setSearching(false); }
  }

  async function save(skip = false) {
    if (busy.current || !state) return;
    let payload: WelcomeStep;
    if (step === 1) {
      if (!name.trim()) { setError('Укажите, как к вам обращаться.'); return; }
      payload = { step: 'name', full_name: name.trim() };
    } else if (step === 2) {
      if (!skip && (!birthDate || birthDate < '1900-01-01' || birthDate > todayISO())) { setError('Укажите дату рождения от 1900 года до сегодняшнего дня.'); return; }
      payload = { step: 'birth', birth_date: skip ? state.profile.birth_date : birthDate };
    } else {
      if (!skip && city.trim() && !location) { setError('Нажмите «Найти» и выберите город из результатов или добавьте его позже.'); return; }
      if (!skip && !unknownTime && !/^\d{2}:\d{2}$/.test(birthTime)) { setError('Укажите время рождения или выберите «Не знаю время».'); return; }
      payload = { step: 'sky', birth_time: skip ? state.profile.birth_time : unknownTime ? null : birthTime, birth_location: skip ? state.profile.birth_location : location };
    }
    busy.current = true; setSaving(true); setError('');
    try {
      const result = await api.saveWelcomeStep(payload);
      setState(result);
      if (skip) { setStep(s => s + 1); setRevealed(false); }
      else { setRevealed(true); if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); }
    } catch (cause) { const message = cause instanceof Error ? cause.message : 'Не удалось сохранить. Попробуйте ещё раз.'; if (/401|403|not authenticated|требуется авторизация/i.test(message)) router.replace('/auth/login'); else setError(message); }
    finally { busy.current = false; setSaving(false); }
  }

  async function enter() {
    if (busy.current) return;
    busy.current = true; setSaving(true); setError('');
    try { await api.completeWelcome(); router.push('/dashboard'); }
    catch { setError('Не удалось завершить знакомство. Ваши данные сохранены — попробуйте ещё раз.'); }
    finally { busy.current = false; setSaving(false); }
  }

  function next() { setRevealed(false); setError(''); setStep(s => s + 1); }
  function back() { setRevealed(false); setError(''); setStep(s => Math.max(1, s - 1)); }
  function submit(event: FormEvent) { event.preventDefault(); void save(); }

  return <main className={styles.root} data-welcome data-step={step} data-lenis-prevent>
    <div className={styles.background} aria-hidden="true" />
    <header className={styles.header}><Link href="/" aria-label="На главную Mirastros"><img src="/logo.png" alt="Mirastros" width="800" height="205" /></Link><Link href="/dashboard">{state?.completed ? 'В кабинет' : 'Продолжить позже'} <span aria-hidden="true">↗</span></Link></header>
    <div className={styles.panel}>
      <OrnamentFrame className={styles.frame} />
      <aside className={styles.aside} aria-label="Ваш путь знакомства">
        <span className={styles.eyebrow}>Личное знакомство</span>
        <div className={styles.sigil} data-unlocked={step}><MirastrosSeal /><span className={styles.personalGlyph} aria-hidden="true">{step === 4 ? state?.portrait.number?.value || '✧' : ['','✧','✦','☽'][step]}</span></div>
        <p className={styles.asideTitle}>Ваша история<br />среди звёзд</p>
        <p className={styles.asideText}>Имя, числа и небо постепенно складываются в ваш личный портрет.</p>
        <ol className={styles.steps}>{steps.map((label, i) => <li key={label} aria-current={step === i + 1 ? 'step' : undefined} data-done={step > i + 1}><span>{step > i + 1 ? '✧' : `0${i + 1}`}</span>{label}</li>)}</ol>
        <p className={styles.duration}>{step === 4 ? 'Первое знакомство состоялось' : 'Три шага · около двух минут'}</p>
      </aside>
      <div className={styles.content}>
        {!state ? <div role="status"><h1 ref={heading} tabIndex={-1}>Открываем ваше пространство</h1>{error ? <><p role="alert">{error}</p><button className="mira-action mira-action-primary" onClick={() => setAttempt(n => n + 1)}>Попробовать снова</button><Link className={styles.secondary} href="/auth/login">Войти в аккаунт</Link></> : <p>Настраиваем первые координаты…</p>}</div> : step < 4 ? <>
          <span className={styles.eyebrow}>Шаг {step} из 3</span>
          <h1 ref={heading} tabIndex={-1}>{headings[step - 1]}</h1>
          <p className={styles.description}>{descriptions[step - 1]}</p>
          {revealed ? <>
            <section className={styles.reading} ref={reading} tabIndex={-1} aria-label="Послание Mirastros"><Reading portrait={state.portrait} step={step} /></section>
            <button className={`mira-action mira-action-primary ${styles.primary}`} onClick={next}>{step === 1 ? 'К дате рождения' : step === 2 ? 'К месту рождения' : 'Открыть мой портрет'} <span aria-hidden="true">→</span></button>
            <button className={styles.secondary} onClick={() => setRevealed(false)}>Изменить ответ</button>
          </> : <form onSubmit={submit} aria-busy={saving}>
            {step === 1 && <div className={styles.field}><label htmlFor="welcome-name">Ваше имя</label><input id="welcome-name" autoComplete="given-name" value={name} onChange={e => { setName(e.target.value); setError(''); }} required maxLength={255} disabled={saving} placeholder="Как к вам обращаться" /><p className={styles.note}>Мы уже подставили имя из аккаунта. Его можно изменить.</p></div>}
            {step === 2 && <div className={styles.field}><label htmlFor="welcome-date">Дата рождения</label><input id="welcome-date" type="date" disabled={saving} min="1900-01-01" max={todayISO()} value={birthDate} onChange={e => { setBirthDate(e.target.value); setError(''); }} required /><p className={styles.note}>Одна дата для нумерологии, матрицы судьбы и астрологии.</p></div>}
            {step === 3 && <>
              <div className={styles.field}><label htmlFor="welcome-city">Город рождения</label><div className={styles.search}><input id="welcome-city" disabled={saving} autoComplete="off" value={city} maxLength={120} placeholder="Город и страна" onChange={e => { setCity(e.target.value); setLocation(null); setPlaces([]); setSearched(false); setSearchError(''); setError(''); searchVersion.current++; }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void search(); } }} /><button type="button" onClick={() => void search()} disabled={searching || saving}>{searching ? 'Ищем…' : 'Найти'}</button></div>
                {location && <p className={styles.selected}>✧ {location.city}{location.country ? `, ${location.country}` : ''}</p>}
                {places.length > 0 && <ul className={styles.places} aria-label="Найденные места">{places.map((place, i) => <li key={`${place.latitude}-${place.longitude}-${i}`}><button type="button" onClick={() => { setLocation({ city: place.city, country: place.country, latitude: place.latitude, longitude: place.longitude }); setCity(place.city); setPlaces([]); setSearched(false); setError(''); }}>{place.label}</button></li>)}</ul>}
                {searched && !places.length && !location && <p role="status" className={styles.note}>Город не найден. Добавьте страну к запросу или заполните позже.</p>}
                {searchError && <p role="alert" className={styles.error}>{searchError}</p>}
                <p className={styles.attribution}>Поиск: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a></p>
              </div>
              <div className={styles.field}><span className={styles.fieldLabel}>Время рождения</span><label className={styles.check}><input type="checkbox" disabled={saving} checked={unknownTime} onChange={e => { setUnknownTime(e.target.checked); setError(''); }} />Не знаю время</label>{!unknownTime && <input id="welcome-time" aria-label="Точное время рождения" type="time" disabled={saving} value={birthTime} onChange={e => { setBirthTime(e.target.value); setError(''); }} required />}<p className={styles.note}>Точное время нужно для асцендента. Его можно добавить позже.</p></div>
            </>}
            {error && <p role="alert" className={styles.error}>{error}</p>}
            <button className={`mira-action mira-action-primary ${styles.primary}`} type="submit" disabled={saving || searching}>{saving ? 'Открываем ваш знак…' : step === 1 ? 'Узнать значение имени' : step === 2 ? 'Открыть моё число' : 'Раскрыть моё небо'} <span aria-hidden="true">✧</span></button>
            {step > 1 && <button type="button" className={styles.secondary} disabled={saving} onClick={() => void save(true)}>Добавлю позже</button>}
          </form>}
          {step > 1 && <button className={styles.back} onClick={back} disabled={saving}>← Назад</button>}
        </> : <>
          <span className={styles.eyebrow}>Ваш личный портрет</span>
          <h1 ref={heading} tabIndex={-1}>{state.portrait.name.name},<br />ваша карта открыта</h1>
          <p className={styles.summary}>{state.portrait.summary}</p>
          <div className={styles.portrait}>
            <article><span className={styles.readingLabel}>✧ Ваше имя</span><h2>{state.portrait.name.name}</h2><p>{state.portrait.name.origin}</p></article>
            {state.portrait.number && <article><span className={styles.readingLabel}>✦ Число жизненного пути</span><h2>{state.portrait.number.value} · {state.portrait.number.title}</h2></article>}
            {state.portrait.sky?.available && <article><span className={styles.readingLabel}>☽ Ваше небо</span><p>Солнце: {state.portrait.sky.sun?.join(' / ')} · Луна: {state.portrait.sky.moon?.join(' / ')}{state.portrait.sky.ascendant ? ` · Асцендент: ${state.portrait.sky.ascendant}` : ''}</p>{!state.portrait.sky.time_known && <p className={styles.note}>{state.portrait.sky.note}</p>}</article>}
          </div>
          <p className={styles.note}>Символический портрет для личных наблюдений. Данные сохранены в вашем профиле.</p>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <button className={`mira-action mira-action-primary ${styles.primary}`} onClick={() => void enter()} disabled={saving}>{saving ? 'Открываем ваш день…' : 'Открыть мой день'} <span aria-hidden="true">↗</span></button>
          <Link className={styles.secondary} href="/auth/onboarding?edit=1" onClick={e => { e.preventDefault(); window.history.replaceState(null, '', '/auth/onboarding?edit=1'); setRevealed(false); setStep(1); }}>Уточнить мои данные</Link>
        </>}
      </div>
    </div>
    <footer className={styles.footer}>Ваш путь · Ваш ритм · Ваш Mirastros</footer>
  </main>;
}
