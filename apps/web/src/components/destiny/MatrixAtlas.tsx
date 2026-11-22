'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';
import styles from './MatrixAtlas.module.css';

type Position = { key: string; label: string; value: number; formula: string; x: number | null; y: number | null };
type Atlas = { birth_date: string; methodology_version: string; source: string; positions: Position[] };

export default function MatrixAtlas() {
  const [matrix, setMatrix] = useState<Atlas | null>(null);
  const [date, setDate] = useState('');
  const [selected, setSelected] = useState('core');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([api.request<Atlas | null>('/destiny-matrix/atlas'), api.getCurrentUser()])
      .then(([saved, user]) => {
        if (!active) return;
        setMatrix(saved);
        setDate(saved?.birth_date || user.birthDate?.split('T')[0] || '');
      })
      .catch(() => { if (active) setError('Войдите в аккаунт, чтобы открыть и сохранить свою матрицу.'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);
  const position = matrix?.positions.find(item => item.key === selected);
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
    <div className={styles.heading}><div><p>ЛИЧНЫЙ АТЛАС</p><h1>Моя матрица</h1></div>
      <form onSubmit={calculate}><label htmlFor="matrix-date">Дата рождения</label><div><input id="matrix-date" type="date" value={date} max={new Date().toISOString().slice(0, 10)} required disabled={busy} onChange={e => setDate(e.target.value)} /><button disabled={busy}>{busy ? 'Загрузка…' : 'Рассчитать матрицу'}</button></div></form>
    </div>
    {error && <p role="alert" className={styles.error}>{error} <Link href="/auth/login">Войти</Link></p>}
    {matrix && position ? <>
      <div className={styles.spread}>
        <section className={styles.plate} aria-label="Схема матрицы"><div className={styles.caption}>Личный и родовой квадраты <span>{matrix.birth_date.split('-').reverse().join('.')}</span></div>
          <div className={styles.wheel}>
            <svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth=".25"><circle cx="50" cy="50" r="47" /><circle cx="50" cy="50" r="43" /><circle cx="50" cy="50" r="26" /><circle cx="50" cy="50" r="9" /><path d="M8 50 50 8 92 50 50 92Z M20 20H80V80H20Z M8 50H92 M50 8V92 M20 20L80 80 M80 20L20 80" /></g></svg>
            {matrix.positions.filter(item => item.x !== null).map(item => <button key={item.key} className={styles.node} style={{ left: item.x + '%', top: item.y + '%' }} aria-label={item.label + ', ' + item.value} aria-pressed={selected === item.key} onClick={() => setSelected(item.key)}>{item.value}</button>)}
          </div><p className={styles.hint}>Выберите число, чтобы открыть его расчёт</p>
        </section>
        <aside className={styles.reading}><p className={styles.caption}>ВЫБРАННАЯ ПОЗИЦИЯ</p><div aria-live="polite"><h2>{position.label}</h2><div className={styles.energy}>{position.value}<span>Энергия</span></div></div><details open><summary>Как получилось число</summary><p>{position.formula}</p></details>
          <label htmlFor="matrix-position">Другие позиции</label><select id="matrix-position" value={selected} onChange={e => setSelected(e.target.value)}>{matrix.positions.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</select>
          <p className={styles.hint}>Матрица сохранена в вашем аккаунте.</p><button onClick={download}>Скачать расчёт</button>
        </aside>
      </div>
      <section className={styles.axes}><h2>Линии и предназначения</h2><div>{matrix.positions.filter(item => item.x === null).map(item => <button key={item.key} aria-pressed={selected === item.key} onClick={() => setSelected(item.key)}><span>{item.label}</span><strong>{item.value}</strong></button>)}</div></section>
      <details className={styles.method}><summary>Методика расчёта</summary><p>Личный и родовой квадраты, центры и предназначения рассчитаны по опубликованной схеме. Числа больше 22 сокращаются сложением цифр. Версия {matrix.methodology_version} сохраняется вместе с результатом.</p><a href={matrix.source} target="_blank" rel="noreferrer">Источник формул ↗</a><p>Матрица предназначена для символического осмысления личного опыта.</p></details>
    </> : !busy && <section className={styles.empty}><img src="/images/portals/destiny-matrix.webp" alt="" /><h2>Откройте свою матрицу</h2><p>Подтвердите дату рождения и нажмите «Рассчитать матрицу».</p></section>}
    <nav className={styles.dock} aria-label="Навигация Mirastros"><Link href="/dashboard">Главная</Link><Link href="/dashboard?explore=1">Направления</Link><Link href="/destiny-matrix" aria-current="page">Матрица</Link></nav>
  </main>;
}
