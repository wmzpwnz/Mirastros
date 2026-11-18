'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api } from '../services/api';
import type { ExplanationKind, ResultExplanation } from '../../../../packages/shared-core/src/types/explanation';
import styles from './ClarifyButton.module.css';

export interface ClarifyButtonProps {
  onClarify?: () => void;
  contextType: string;
  contextData: any;
  available?: boolean; // Compatibility only: the server decides access.
  className?: string;
}
const supported = new Set(['tarot', 'numerology', 'iching', 'dreams', 'lenormand', 'synastry']);
const reasons: Record<string, string> = {
  subscription_required: 'Пояснения доступны с действующей подпиской Premium или Platinum.',
  not_configured: 'Пояснения Mirastros пока недоступны. Ваш результат сохранён.',
  daily_limit: 'На сегодня лимит пояснений исчерпан. Сохранённый ответ останется здесь.',
  result_limit: 'Для этого результата пояснение и уточнение уже использованы.',
};

export function ClarifyButton({ contextType, contextData, className = '' }: ClarifyButtonProps) {
  const kind = (contextType === 'dream' ? 'dreams' : contextType) as ExplanationKind;
  const id: string | undefined = contextData?.reading_id || contextData?.consultation_id || contextData?.id;
  const usable = supported.has(kind) && typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id);
  const [state, setState] = useState<ResultExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const request = useRef(false);
  const generation = useRef(0);
  const answer = useRef<HTMLElement>(null);
  useEffect(() => {
    const version = ++generation.current;
    setState(null); setError(''); setQuestion(''); setAsking(false); setLoading(false); request.current = false;
    if (!usable || !id) return;
    void api.getResultExplanation(kind, id).then(value => { if (version === generation.current) setState(value); })
      .catch(() => { if (version === generation.current) setError('Не удалось проверить доступ к пояснению.'); });
    return () => { generation.current++; };
  }, [kind, id, usable, attempt]);
  async function explain(followup = false) {
    if (request.current || !id || !state || (followup ? !state.can_clarify : !state.available)) return;
    if (followup && !question.trim()) { setError('Напишите один вопрос об этом результате.'); return; }
    const version = generation.current;
    request.current = true; setLoading(true); setError('');
    try {
      const value = await api.explainResult(kind, id, followup ? question.trim() : undefined);
      if (version === generation.current) {
        setState(value); setAsking(false); setQuestion('');
        requestAnimationFrame(() => answer.current?.focus({ preventScroll: true }));
      }
    } catch {
      if (version === generation.current) {
        setError('Не удалось получить пояснение. Попробуйте позже — ваш результат сохранён.');
        try { const value = await api.getResultExplanation(kind, id); if (version === generation.current) setState(value); } catch { /* Keep the previous readable state. */ }
      }
    } finally { if (version === generation.current) { request.current = false; setLoading(false); } }
  }
  // Only stored, supported results can open a paid provider operation.
  if (!usable) return null;
  return <section className={`${styles.root} ${className}`} aria-label="Пояснение Mirastros" aria-busy={loading}>
    <header className={styles.header}><span className={styles.sigil} aria-hidden="true">✧</span><div><h3>Mirastros разъясняет</h3><p>Главное о вашем результате — и одно уточнение по нему.</p></div></header>
    {!state && !error && <p role="status" className={styles.note}>Проверяем доступ…</p>}
    {state?.answer && <section ref={answer} tabIndex={-1} className={styles.answer} aria-label="Ответ Mirastros"><p>{state.answer}</p></section>}
    {state?.clarification && <div className={styles.followup}><p className={styles.question}>{state.clarification.question}</p><p>{state.clarification.answer}</p></div>}
    {state && !state.available && <p className={styles.note}>{reasons[state.reason] || 'Пояснение сейчас недоступно.'}</p>}
    {state?.reason === 'subscription_required' && <Link href="/subscription" className={styles.link}>Посмотреть подписки →</Link>}
    {state && !state.answer && <button type="button" disabled={!state.available || loading} className={`mira-action mira-action-primary ${styles.button}`} onClick={() => void explain()}>{loading ? 'Mirastros разъясняет…' : 'Разъяснить'}</button>}
    {state?.can_clarify && !asking && <button type="button" disabled={loading} className={styles.link} onClick={() => setAsking(true)}>Можно уточнить?</button>}
    {asking && state?.can_clarify && <form className={styles.form} onSubmit={event => { event.preventDefault(); void explain(true); }}>
      <label htmlFor={`explanation-${id}`}>Что в этом результате разъяснить подробнее?</label>
      <textarea id={`explanation-${id}`} maxLength={300} rows={3} value={question} disabled={loading} onChange={event => { setQuestion(event.target.value); setError(''); }} />
      <p className={styles.note}>Один вопрос · до 300 символов</p>
      <button className={`mira-action mira-action-primary ${styles.button}`} disabled={loading} type="submit">{loading ? 'Готовим уточнение…' : 'Уточнить'}</button>
    </form>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {!state && error && <button className={styles.link} type="button" onClick={() => setAttempt(value => value + 1)}>Проверить снова</button>}
  </section>;
}
