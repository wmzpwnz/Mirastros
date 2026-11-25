'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';
import styles from './MatrixAtlas.module.css';
import { getReading } from './matrixReading';

type Position = { key: string; label: string; value: number; formula: string; x: number | null; y: number | null };
type Atlas = { birth_date: string; methodology_version: string; source: string; positions: Position[] };

export default function MatrixAtlas() {
  const [matrix, setMatrix] = useState<Atlas | null>(null);
  const [date, setDate] = useState('');
  const [selected, setSelected] = useState('core');
  const [guide, setGuide] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([api.request<Atlas | null>('/destiny-matrix/atlas'), api.getCurrentUser()])
      .then(([saved, user]) => {
        if (!active) return;
        setMatrix(saved);
        setName(user.fullName || '');
        setDate(saved?.birth_date || user.birthDate?.split('T')[0] || '');
      })
      .catch(() => { if (active) setError('Войдите в аккаунт, чтобы открыть и сохранить свою матрицу.'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);
  const position = matrix?.positions.find(item => item.key === selected);
  const reading = position ? getReading(position.key, position.value) : null;
  const steps = ['core', 'left', 'top', 'right', 'bottom', 'personal', 'family', 'social', 'spirit', 'planet'];
  const step = steps.indexOf(selected);
  function choose(key: string) {
    setSelected(key);
    if (window.matchMedia('(max-width: 700px)').matches) {
      document.getElementById('matrix-reading')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  }
  async function calculate(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const saved = await api.request<Atlas>('/destiny-matrix/atlas', {
        method: 'POST', body: JSON.stringify({ birth_date: date }),
      });
      setMatrix(saved);
      setSelected('core');
      setGuide(false);
    } catch {
      setError('Не удалось сохранить матрицу. Проверьте подключение и повторите.');
    } finally { setBusy(false); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(matrix, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mirastros-matrix.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <main className={styles.root}>
    <header className={styles.header}><Link href="/dashboard"><img src="/logo.png" alt="Mirastros" width="145" /></Link><Link href="/dashboard">В кабинет ↗</Link></header>
    <div className={styles.heading}><div><p>ЛИЧНЫЙ АТЛАС</p><h1>Твоя матрица{name ? `, ${name}` : ''}</h1></div>
      <form onSubmit={calculate}><label htmlFor="matrix-date">Дата рождения</label><div><input id="matrix-date" type="date" value={date} max={new Date().toISOString().slice(0, 10)} required disabled={busy} onChange={e => setDate(e.target.value)} /><button disabled={busy}>{busy ? 'Загрузка…' : 'Рассчитать матрицу'}</button></div></form>
    </div>
    {error && <p role="alert" className={styles.error}>{error} <Link href="/auth/login">Войти</Link></p>}
    {matrix && position && reading ? <>
      <section className={styles.intro}><div><p className={styles.caption}>ПОЗНАКОМЬСЯ С СОБОЙ ЧЕРЕЗ СИМВОЛЫ</p><h2>У каждого числа есть история</h2><p>Мирастрос проведёт тебя от центра карты к её главным темам. Выбирай точки или пройди разбор по шагам — объяснение появится рядом.</p></div><button onClick={() => { setGuide(true); choose('core'); }}>Разобрать мою матрицу ✧</button></section>
      <div className={styles.spread}>
        <section className={styles.plate} aria-label="Схема матрицы"><div className={styles.caption}>Личный и родовой квадраты <span>{matrix.birth_date.split('-').reverse().join('.')}</span></div>
          <div className={styles.wheel}>
            <svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth=".25"><circle cx="50" cy="50" r="47" /><circle cx="50" cy="50" r="43" /><circle cx="50" cy="50" r="26" /><circle cx="50" cy="50" r="9" /><path d="M8 50 50 8 92 50 50 92Z M20 20H80V80H20Z M8 50H92 M50 8V92 M20 20L80 80 M80 20L20 80" /></g></svg>
            {matrix.positions.filter(item => item.x !== null).map(item => <button key={item.key} className={styles.node} style={{ left: item.x + '%', top: item.y + '%' }} aria-label={item.label + ', ' + item.value} aria-pressed={selected === item.key} onClick={() => { setGuide(false); choose(item.key); }}>{item.value}<small>{item.key === 'core' ? 'Центр' : item.label.replace(' вершина', '').replace(' угол', '')}</small></button>)}
          </div><p className={styles.hint}>Светлая точка выбрана · Нажми на другую, чтобы узнать её смысл</p>
        </section>
        <aside id="matrix-reading" className={styles.reading}>
          <div className={styles.caption}>{guide ? `ТВОЙ РАЗБОР · ${step + 1} ИЗ ${steps.length}` : 'ПОСЛАНИЕ МИРАСТРОС'}<span>{position.label}</span></div>
          <div aria-live="polite" aria-atomic="true">
            <div className={styles.energy}>{position.value}<span>{reading.name}</span></div>
            <h2>{reading.title}</h2><p>{reading.meaning}</p>
            <h3>Возможность</h3><p>{reading.opportunity}</p>
            <h3>На что обратить внимание</h3><p>{reading.challenge}</p>
            <blockquote>{reading.question}</blockquote>
            <div className={styles.practice}><span>МАЛЕНЬКАЯ ПРАКТИКА</span><p>{reading.practice}</p></div>
          </div>
          {guide && <div className={styles.steps}><button disabled={step <= 0} onClick={() => choose(steps[step - 1])}>← Назад</button><button onClick={() => { if (step < steps.length - 1) choose(steps[step + 1]); else setGuide(false); }}>{step === steps.length - 1 ? 'Завершить разбор ✓' : 'Следующая тема →'}</button></div>}
          <details><summary>Почему получилось это число?</summary><p>{position.formula}</p></details>
          <label htmlFor="matrix-position">Выбрать другую тему</label><select id="matrix-position" value={selected} onChange={e => { setGuide(false); choose(e.target.value); }}>{matrix.positions.map(item => <option key={item.key} value={item.key}>{getReading(item.key, item.value)?.title || item.label}</option>)}</select>
          <p className={styles.hint}>Твой расчёт сохранён в аккаунте. Толкования — авторские символические пояснения Mirastros, не научная оценка личности.</p>
        </aside>
      </div>
      <section className={styles.axes}><h2>Исследуй остальные темы</h2><p className={styles.hint}>Выбери тему — её объяснение откроется выше, рядом с картой.</p><div>{matrix.positions.filter(item => item.x === null).map(item => <button key={item.key} aria-pressed={selected === item.key} onClick={() => { setGuide(false); choose(item.key); document.getElementById('matrix-reading')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><span>{getReading(item.key, item.value)?.title || item.label}</span><strong>{item.value}</strong></button>)}</div></section>
      <details className={styles.method}><summary>Методика расчёта</summary><p>Личный и родовой квадраты, центры и предназначения рассчитаны по опубликованной схеме. Числа больше 22 сокращаются сложением цифр. Версия {matrix.methodology_version} сохраняется вместе с результатом.</p><a href={matrix.source} target="_blank" rel="noreferrer">Источник формул ↗</a><p>Матрица предназначена для символического осмысления личного опыта. Названия образов и пояснения Mirastros не являются цитатами или подтверждёнными толкованиями школы автора методики. Совпадения с твоим опытом можно исследовать; число само по себе не устанавливает фактов о характере или будущем.</p><button onClick={download}>Скачать расчёт</button></details>
    </> : !busy && <section className={styles.empty}><img src="/images/portals/destiny-matrix.webp" alt="" /><h2>Откройте свою матрицу</h2><p>Подтвердите дату рождения и нажмите «Рассчитать матрицу».</p></section>}
    <nav className={styles.dock} aria-label="Навигация Mirastros"><Link href="/dashboard">Главная</Link><Link href="/dashboard?explore=1">Направления</Link><Link href="/destiny-matrix" aria-current="page">Матрица</Link></nav>
  </main>;
}
