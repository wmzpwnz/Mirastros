'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';
import { ClarifyButton } from '../ClarifyButton';
import styles from './TarotRitual.module.css';

type Card = {
  id: number;
  name: string;
  suit: string;
  symbol: string;
  image: string | null;
  theme: string;
  upright: string;
  reversed: string;
};
type Spread = {
  id: string;
  category: string;
  title: string;
  description: string;
  positions: string[];
};
type Catalog = {
  deck: { name: string; back: string | null };
  categories: { id: string; title: string; symbol: string }[];
  spreads: Spread[];
  cards: Card[];
};
type Drawn = Omit<Card, 'reversed'> & {
  reversed: boolean;
  position: string;
  interpretation: string;
};
type Reading = {
  reading_id: string;
  spread_id: string;
  cards: Drawn[];
  interpretation: string;
  question: string;
  timestamp: string;
};

const cardCount = (n: number) => (n === 1 ? 'карта' : n < 5 ? 'карты' : 'карт');

function CardArt({ card, back }: { card?: Card | Drawn; back: string | null }) {
  const [failed, setFailed] = useState(false);
  const source = card?.image || (!card ? back : null);
  useEffect(() => setFailed(false), [source]);
  return source && !failed ? (
    <img
      src={source}
      alt={card?.name || 'Рубашка карты'}
      onError={() => setFailed(true)}
    />
  ) : (
    <div className={styles.art} aria-hidden="true">
      <span>✧</span>
      <i>{card?.symbol || '☽'}</i>
      <span>{card ? card.name : 'MIRASTROS'}</span>
      <small>{card ? 'ТАРО · 78 СИМВОЛОВ' : '✦ · ✦ · ✦'}</small>
    </div>
  );
}
export default function TarotRitual() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [category, setCategory] = useState('day');
  const [spread, setSpread] = useState<Spread | null>(null);
  const [question, setQuestion] = useState('');
  const [reversed, setReversed] = useState(false);
  const [picking, setPicking] = useState(false);
  const [choices, setChoices] = useState<number[]>([]);
  const [reading, setReading] = useState<Reading | null>(null);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [activeCard, setActiveCard] = useState(0);
  const [meaningOpen, setMeaningOpen] = useState(false);
  const [drawPulse, setDrawPulse] = useState(false);
  const [history, setHistory] = useState<Reading[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [library, setLibrary] = useState(false);
  const [query, setQuery] = useState('');
  const requestId = useRef('');
  const pending = useRef(false);
  useEffect(() => {
    let active = true;
    api
      .request<Catalog>('/tarot/rituals/catalog')
      .then((value) => {
        if (active) setCatalog(value);
      })
      .catch(() => {
        if (active)
          setError('Не удалось загрузить колоду. Попробуйте ещё раз.');
      });
    api
      .request<{ readings: Reading[] }>('/tarot/rituals/history')
      .then((value) => {
        if (active) setHistory(value.readings);
      })
      .catch(() => {
        if (active)
          setHistoryError(
            'Для личной истории войдите в аккаунт. Если вы уже вошли, повторите загрузку позже.'
          );
      });
    const id = new URLSearchParams(window.location.search).get('reading');
    if (id)
      api
        .request<Reading>('/tarot/rituals/reading/' + encodeURIComponent(id))
        .then((value) => {
          if (active) {
            setReading(value);
            setRevealed(value.cards.map((_, i) => i));
          }
        })
        .catch(() => {
          if (active)
            setError(
              'Не удалось открыть сохранённый расклад. Проверьте вход в аккаунт.'
            );
        });
    return () => {
      active = false;
    };
  }, [attempt]);
  function open(value: Reading) {
    setReading(value);
    setRevealed(value.cards.map((_, i) => i));
    setActiveCard(0);
    setMeaningOpen(false);
    setPicking(false);
    setSpread(null);
    setError('');
    window.history.replaceState(null, '', '?reading=' + value.reading_id);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function drawOne() {
    if (!spread || choices.length >= spread.positions.length) return;
    const available =
      catalog?.cards.map((_, i) => i).filter((i) => !choices.includes(i)) || [];
    const index = available[Math.floor(Math.random() * available.length)];
    if (index === undefined) return;
    setChoices((old) => [...old, index]);
    setDrawPulse(true);
    window.setTimeout(() => setDrawPulse(false), 520);
  }
  function reset() {
    if (pending.current) return;
    setReading(null);
    setSpread(null);
    setPicking(false);
    setChoices([]);
    setActiveCard(0);
    setMeaningOpen(false);
    setError('');
    window.history.replaceState(null, '', window.location.pathname);
  }
  function selectSpread(value: Spread) {
    setSpread(value);
    setChoices([]);
    setQuestion('');
    setPicking(false);
    setError('');
    requestId.current = crypto.randomUUID();
  }
  async function draw() {
    if (
      !spread ||
      pending.current ||
      choices.length !== spread.positions.length
    )
      return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const value = await api.request<Reading>('/tarot/rituals/reading', {
        method: 'POST',
        body: JSON.stringify({
          request_id: requestId.current,
          spread_id: spread.id,
          question,
          reversed_cards: reversed,
          choices,
        }),
      });
      setReading(value);
      setRevealed([]);
      setActiveCard(0);
      setMeaningOpen(false);
      setPicking(false);
      setHistory((old) =>
        [value, ...old.filter((r) => r.reading_id !== value.reading_id)].slice(
          0,
          30
        )
      );
      window.history.replaceState(null, '', '?reading=' + value.reading_id);
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Не удалось сохранить расклад. Повторите попытку — выбор сохранён.'
      );
    } finally {
      setBusy(false);
      pending.current = false;
    }
  }
  const complete = reading && revealed.length === reading.cards.length;
  return (
    <main className={`${styles.root} ${reading ? styles.rootReading : ''}`}>
      <header className={styles.header}>
        <Link href="/dashboard">
          <img src="/logo.png" width="145" alt="Mirastros" />
        </Link>
        <Link href="/dashboard">← Сводка дня</Link>
      </header>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>МИР ОБРАЗОВ · ПРОСТРАНСТВО ВЫБОРА</p>
        <h1>Таро Mirastros</h1>
        <p>Необязательно знать ответ. Начни с того, что волнует тебя сейчас.</p>
        <span>78 карт · 22 старших и 56 младших арканов</span>
      </div>
      {error && (
        <div className={styles.error} role="alert">
          {error} <Link href="/auth/login">Войти</Link>
          <button
            onClick={() => {
              setError('');
              setAttempt((a) => a + 1);
            }}
          >
            Повторить загрузку
          </button>
        </div>
      )}
      {!catalog && !error && <p role="status">Открываем колоду…</p>}
      {catalog && (
        <>
          {reading ? (
            <section className={styles.resultScreen}>
              <div className={styles.sectionHead}>
                <div>
                  <p className={styles.eyebrow}>ТВОЙ СОХРАНЁННЫЙ РАСКЛАД</p>
                  <h2>
                    {catalog.spreads.find((s) => s.id === reading.spread_id)
                      ?.title || 'Твой расклад'}
                  </h2>
                  <p>{new Date(reading.timestamp).toLocaleString('ru-RU')}</p>
                </div>
                <button onClick={reset}>К раскладам</button>
              </div>
              {reading.question && <blockquote>{reading.question}</blockquote>}
              <p className={styles.revealHint} aria-live="polite">
                {complete
                  ? 'Все символы открыты'
                  : 'Коснись карт, чтобы раскрыть'}
              </p>
              <div className={styles.table}>
                {reading.cards.map((card, i) => (
                  <div
                    key={card.id}
                    className={`${styles.cardSlot} ${styles.cardSlotCompact}`}
                  >
                    <p>
                      {i + 1}. {card.position}
                    </p>
                    <button
                      className={styles.card}
                      aria-label={
                        revealed.includes(i)
                          ? card.name
                          : `Раскрыть карту ${i + 1}`
                      }
                      aria-pressed={revealed.includes(i)}
                      onClick={() =>
                        setRevealed((old) =>
                          old.includes(i) ? old : [...old, i]
                        )
                      }
                    >
                      <div
                        className={`${styles.cardInner} ${
                          revealed.includes(i) ? styles.flipped : ''
                        }`}
                      >
                        <div className={styles.back}>
                          <CardArt back={catalog.deck.back} />
                        </div>
                        <div
                          className={`${styles.front} ${
                            card.reversed ? styles.reversed : ''
                          }`}
                        >
                          <CardArt
                            card={{
                              ...card,
                              image:
                                catalog.cards.find((c) => c.id === card.id)
                                  ?.image || card.image,
                            }}
                            back={null}
                          />
                        </div>
                      </div>
                    </button>
                    <button
                      className={styles.cardLabel}
                      onClick={() => {
                        setActiveCard(i);
                        setMeaningOpen(true);
                        if (!revealed.includes(i))
                          setRevealed((old) => [...old, i]);
                      }}
                      aria-pressed={activeCard === i}
                      aria-label={
                        revealed.includes(i)
                          ? `Разобрать: ${card.name}`
                          : `Открыть карту ${i + 1}`
                      }
                    >
                      {revealed.includes(i) ? 'Разобрать ↗' : 'Открыть'}
                    </button>
                  </div>
                ))}
              </div>
              {!complete && (
                <button
                  className={styles.primary}
                  onClick={() => {
                    setRevealed(reading.cards.map((_, i) => i));
                    setActiveCard(0);
                    setMeaningOpen(true);
                  }}
                >
                  Раскрыть весь расклад ✧
                </button>
              )}
              {complete && (
                <>
                  <div
                    className={styles.cardTabs}
                    role="tablist"
                    aria-label="Толкование карт"
                  >
                    {reading.cards.map((card, i) => (
                      <button
                        key={card.id}
                        role="tab"
                        aria-selected={activeCard === i}
                        onClick={() => setActiveCard(i)}
                      >
                        {i + 1} · {card.position}
                      </button>
                    ))}
                  </div>
                  {meaningOpen && (
                    <button
                      className={styles.meaningBackdrop}
                      aria-label="Закрыть значение карты"
                      onClick={() => setMeaningOpen(false)}
                    />
                  )}
                  <section
                    className={styles.meaningPanel}
                    role="tabpanel"
                    key={activeCard}
                    data-expanded={meaningOpen}
                  >
                    <button
                      className={styles.closeMeaning}
                      onClick={() => setMeaningOpen(false)}
                    >
                      Закрыть
                    </button>
                    <p className={styles.eyebrow}>
                      {activeCard + 1} · {reading.cards[activeCard].position}
                    </p>
                    <h2>
                      {reading.cards[activeCard].name}{' '}
                      <small>
                        {reading.cards[activeCard].reversed
                          ? 'Перевёрнутая'
                          : 'Прямая'}
                      </small>
                    </h2>
                    <p>{reading.cards[activeCard].interpretation}</p>
                    <p className={styles.prompt}>
                      Что в этом образе связано с твоим вопросом, а что не
                      откликается?
                    </p>
                  </section>
                  <details className={styles.fullReading}>
                    <summary>Общая нить расклада</summary>
                    <p>{reading.interpretation}</p>
                  </details>
                  <details className={styles.explainDisclosure}>
                    <summary>Попросить Mirastros разъяснить расклад</summary>
                    <ClarifyButton contextType="tarot" contextData={reading} />
                  </details>
                  <p className={styles.note}>
                    Расклад сохранён. Оракул разъясняет его по условиям твоего
                    доступа.
                  </p>
                </>
              )}
            </section>
          ) : spread ? (
            <section className={styles.session}>
              <button
                className={styles.backButton}
                disabled={busy}
                onClick={reset}
              >
                ← Все ситуации
              </button>
              <p className={styles.eyebrow}>
                ШАГ {picking ? 2 : 1} ИЗ 2 · {spread.positions.length}{' '}
                {cardCount(spread.positions.length).toUpperCase()}
              </p>
              <h2>{spread.title}</h2>
              <p className={styles.sessionDescription}>{spread.description}</p>
              {!picking ? (
                <>
                  <ol className={styles.positions}>
                    {spread.positions.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ol>
                  <label htmlFor="tarot-question">
                    Твой вопрос или намерение · необязательно
                  </label>
                  <textarea
                    id="tarot-question"
                    maxLength={1000}
                    rows={2}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Что я хочу понять в этой ситуации?"
                  />
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={reversed}
                      onChange={(e) => setReversed(e.target.checked)}
                    />{' '}
                    Использовать перевёрнутые карты
                  </label>
                  <p className={styles.note}>
                    Перевёрнутая карта — другой угол взгляда.
                  </p>
                  {spread.category === 'team' && (
                    <p className={styles.note}>
                      Для добровольной рефлексии о своих действиях. Не
                      используйте карты для оценки кандидатов, найма или
                      увольнения.
                    </p>
                  )}
                  <button
                    className={styles.primary}
                    onClick={() => setPicking(true)}
                  >
                    Перейти к колоде ✧
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.drawProgress} aria-live="polite">
                    Выбрано {choices.length} из {spread.positions.length} ·{' '}
                    {choices.length < spread.positions.length
                      ? `следующая: ${spread.positions[choices.length]}`
                      : 'выбор готов'}
                  </p>
                  <div className={styles.drawStage}>
                    <div
                      className={`${styles.deckStack} ${
                        drawPulse ? styles.drawPulse : ''
                      }`}
                      aria-hidden="true"
                    >
                      <CardArt back={catalog.deck.back} />
                    </div>
                    <div
                      className={styles.pickedCards}
                      aria-label="Выбранные карты"
                    >
                      {Array.from(
                        { length: spread.positions.length },
                        (_, i) => (
                          <div
                            key={i}
                            className={`${styles.pickedCard} ${
                              choices[i] !== undefined ? styles.picked : ''
                            }`}
                          >
                            <span>
                              {choices[i] !== undefined ? i + 1 : '✧'}
                            </span>
                            <small>{spread.positions[i]}</small>
                          </div>
                        )
                      )}
                    </div>
                    {choices.length < spread.positions.length && (
                      <button
                        className={styles.drawButton}
                        disabled={busy}
                        onClick={drawOne}
                      >
                        Вытянуть карту ✧
                      </button>
                    )}
                    {choices.length > 0 && (
                      <button
                        className={styles.undoButton}
                        disabled={busy}
                        onClick={() => setChoices((old) => old.slice(0, -1))}
                      >
                        Вернуть последнюю
                      </button>
                    )}
                  </div>
                  <button
                    className={styles.primary}
                    disabled={
                      busy || choices.length !== spread.positions.length
                    }
                    onClick={draw}
                  >
                    {busy ? 'Сохраняем твой расклад…' : 'Открыть мой расклад'}
                  </button>
                  <button
                    className={styles.backButton}
                    disabled={busy}
                    onClick={() => setPicking(false)}
                  >
                    ← К вопросу
                  </button>
                </>
              )}
            </section>
          ) : (
            <>
              <div className={styles.sectionHead}>
                <h2>С чем ты пришёл сегодня?</h2>
                <button
                  onClick={() => {
                    const daily = catalog.spreads.find((s) => s.id === 'daily');
                    if (daily) selectSpread(daily);
                  }}
                >
                  ☀ Карта дня
                </button>
              </div>
              <div
                className={styles.categories}
                role="group"
                aria-label="Темы раскладов"
              >
                <button
                  aria-pressed={category === 'all'}
                  onClick={() => setCategory('all')}
                >
                  Все ситуации
                </button>
                {catalog.categories.map((c) => (
                  <button
                    key={c.id}
                    aria-pressed={category === c.id}
                    onClick={() => setCategory(c.id)}
                  >
                    <span>{c.symbol}</span>
                    {c.title}
                  </button>
                ))}
              </div>
              <div className={styles.catalog}>
                {catalog.spreads
                  .filter((s) => category === 'all' || s.category === category)
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => selectSpread(s)}
                      aria-label={`${s.title}, ${
                        s.positions.length
                      } ${cardCount(s.positions.length)}`}
                    >
                      <span className={styles.sigil}>
                        {
                          catalog.categories.find((c) => c.id === s.category)
                            ?.symbol
                        }
                      </span>
                      <small>
                        {s.positions.length} {cardCount(s.positions.length)} ·{' '}
                        {s.positions.length === 1 ? '1–2' : '3–5'} мин
                      </small>
                      <h3>{s.title}</h3>
                      <p>{s.description}</p>
                      <span className={styles.enter}>Начать сеанс →</span>
                    </button>
                  ))}
              </div>
            </>
          )}
          {!spread && !reading && (
            <section className={styles.library}>
              <button
                onClick={() => setLibrary(!library)}
                aria-expanded={library}
              >
                Знакомство с колодой · все 78 карт {library ? '−' : '+'}
              </button>
              {library && (
                <>
                  <label htmlFor="card-search">Найти карту</label>
                  <input
                    id="card-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Например, Звезда"
                  />
                  <div className={styles.meanings}>
                    {catalog.cards
                      .filter((c) =>
                        c.name
                          .toLocaleLowerCase()
                          .includes(query.toLocaleLowerCase())
                      )
                      .map((c) => (
                        <details key={c.id}>
                          <summary>
                            {c.symbol} {c.name}
                          </summary>
                          <p>{c.upright}</p>
                          <h4>Перевёрнутое положение</h4>
                          <p>{c.reversed}</p>
                        </details>
                      ))}
                  </div>
                </>
              )}
            </section>
          )}
          <details className={styles.history}>
            <summary>Моя история · {history.length}</summary>
            {historyError && (
              <p>
                {historyError} <Link href="/auth/login">Войти</Link>
              </p>
            )}
            {!historyError && !history.length && (
              <p>
                Здесь появится твой первый расклад. Карты сохраняются
                автоматически.
              </p>
            )}
            <div>
              {history.map((r) => (
                <button
                  key={r.reading_id}
                  disabled={busy}
                  onClick={() => open(r)}
                >
                  <small>
                    {new Date(r.timestamp).toLocaleDateString('ru-RU')}
                  </small>
                  <strong>
                    {catalog.spreads.find((s) => s.id === r.spread_id)?.title ||
                      'Расклад'}
                  </strong>
                  <span>
                    {r.cards.length} {cardCount(r.cards.length)} · открыть →
                  </span>
                </button>
              ))}
            </div>
          </details>
        </>
      )}
      <footer className={styles.note}>
        Таро — символический инструмент для размышления. Решения о здоровье,
        деньгах и других людях опираются на реальные обстоятельства. Пока колода
        оформлена символами Mirastros; авторские иллюстрации будут добавлены
        позже.
      </footer>
    </main>
  );
}
