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
const categoryGlyph: Record<string, string> = {
  day: '✦', love: '♡', work: '✧', projects: '◇', choice: '⇄', self: '☾', team: '⊙',
};
const situationDescription: Record<string, string> = {
  all: 'Подобрать расклад по своему вопросу',
  day: 'Настроение и ориентир на сегодня',
  love: 'Чувства, близость и отношения',
  work: 'Призвание, задачи и развитие',
  projects: 'Деньги, ресурсы и новые идеи',
  choice: 'Варианты и внутренний выбор',
  self: 'Опоры, привычки и самопознание',
  team: 'Команда, диалог и лидерство',
};

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
    window.scrollTo({ top: 0, behavior: 'auto' });
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
    <main className={`${styles.root} ${reading ? styles.rootReading : ''} ${spread ? styles.rootSession : ''} ${catalog && !reading && !spread ? styles.rootCatalog : ''} ${library ? styles.rootLibraryOpen : ''}`}>
      <header className={styles.header}>
        <Link href="/dashboard">
          <img src="/logo.png" width="145" alt="Mirastros" />
        </Link>
        <Link href="/dashboard">← Сводка дня</Link>
      </header>
      <div className={styles.hero}>
        <div className={styles.heroArtifact} aria-hidden="true">
          <img src="/images/portals/tarot.webp" alt="" width="640" height="640" />
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>ТИХОЕ ПРОСТРАНСТВО ДЛЯ ВАЖНОГО</p>
          <h1>Услышь, что уже зреет внутри</h1>
          <p>Выбери тему или начни с одной карты дня. Таро здесь — способ посмотреть на ситуацию под новым углом.</p>
          <div className={styles.heroActions}>
            <button className={styles.heroPrimary} onClick={() => {
              const daily = catalog?.spreads.find((s) => s.id === 'daily');
              if (daily) selectSpread(daily);
            }}>Открыть карту дня <span aria-hidden="true">↗</span></button>
            <span>78 карт <i aria-hidden="true">✦</i> личный ритуал за минуту</span>
          </div>
        </div>
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
                        onClick={() => {
                          setActiveCard(i);
                          setMeaningOpen(true);
                        }}
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
              <div className={styles.sessionTop}>
                <button
                  className={styles.backButton}
                  disabled={busy}
                  onClick={reset}
                >
                  ← Все темы
                </button>
                <div className={styles.ritualProgress} aria-label={picking ? 'Шаг 2 из 2: выбор карт' : 'Шаг 1 из 2: намерение'}>
                  <span className={!picking ? styles.progressActive : styles.progressDone}>01 <small>Намерение</small></span>
                  <i aria-hidden="true" />
                  <span className={picking ? styles.progressActive : ''}>02 <small>Карты</small></span>
                </div>
              </div>
              <div className={styles.sessionTitle}>
                <p className={styles.eyebrow}>
                  {picking ? 'СОСРЕДОТОЧЬСЯ НА ВОПРОСЕ' : `${spread.positions.length} ${cardCount(spread.positions.length).toUpperCase()} · ЛИЧНЫЙ РАСКЛАД`}
                </p>
                <h2>{spread.title}</h2>
                <p className={styles.sessionDescription}>{spread.description}</p>
              </div>
              {!picking ? (
                <>
                  <div className={styles.setupGrid}>
                    <div className={styles.positionsPanel}>
                      <p className={styles.panelEyebrow}>ПУТЬ РАСКЛАДА</p>
                      <ol className={styles.positions}>
                        {spread.positions.map((p, i) => (
                          <li key={p}><span>{String(i + 1).padStart(2, '0')}</span>{p}</li>
                        ))}
                      </ol>
                      <p className={styles.positionsHint}>Каждая карта откроет отдельную грань вопроса.</p>
                    </div>
                    <div className={styles.intentPanel}>
                      <label htmlFor="tarot-question">
                        Твоё намерение <small>необязательно</small>
                      </label>
                      <textarea
                        id="tarot-question"
                        maxLength={1000}
                        rows={2}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Что хочется увидеть яснее?"
                      />
                      <label className={styles.check}>
                        <input
                          type="checkbox"
                          checked={reversed}
                          onChange={(e) => setReversed(e.target.checked)}
                        />{' '}
                        Учитывать перевёрнутые карты
                      </label>
                      <p className={styles.note}>
                        Перевёрнутое положение покажет тему с другого ракурса.
                      </p>
                      {spread.category === 'team' && (
                        <p className={styles.teamNote}>
                          Используй расклад для личной рефлексии, не для оценки кандидатов, найма или увольнения.
                        </p>
                      )}
                      <button
                        className={styles.primary}
                        onClick={() => setPicking(true)}
                      >
                        Перейти к выбору карт <span aria-hidden="true">✧</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.drawProgress} aria-live="polite">
                    <span>
                      Выбрано {choices.length} из {spread.positions.length}
                      {choices.length < spread.positions.length
                        ? ` · следующая: ${spread.positions[choices.length]}`
                        : ' · выбор готов'}
                    </span>
                    <i className={styles.drawTrack} aria-hidden="true">
                      <b style={{ width: `${(choices.length / spread.positions.length) * 100}%` }} />
                    </i>
                  </p>
                  <div className={styles.drawStage}>
                    <div className={styles.drawOffer}>
                      <div
                        className={`${styles.deckStack} ${
                          drawPulse ? styles.drawPulse : ''
                        }`}
                        aria-hidden="true"
                      >
                        <CardArt back={catalog.deck.back} />
                      </div>
                      <div className={styles.drawInvitation}>
                        <p className={styles.panelEyebrow}>СЛЕДУЮЩИЙ СИМВОЛ</p>
                        <h3>{choices.length < spread.positions.length ? spread.positions[choices.length] : 'Карты выбраны'}</h3>
                        <p>Сохрани вопрос в мыслях и позволь карте лечь на своё место.</p>
                      </div>
                      {choices.length < spread.positions.length && (
                        <button
                          className={styles.drawButton}
                          disabled={busy}
                          onClick={drawOne}
                        >
                          Вытянуть карту <span aria-hidden="true">✧</span>
                        </button>
                      )}
                    </div>
                    <div
                      className={styles.pickedCards}
                      role="list"
                      aria-label="Выбранные карты"
                    >
                      {Array.from(
                        { length: spread.positions.length },
                        (_, i) => (
                          <div
                            key={i}
                            role="listitem"
                            className={`${styles.pickedCard} ${
                              choices[i] !== undefined ? styles.picked : ''
                            }`}
                            aria-label={`${spread.positions[i]}: ${choices[i] !== undefined ? 'карта выбрана' : 'ожидает карты'}`}
                          >
                            <span>
                              {choices[i] !== undefined ? i + 1 : '✧'}
                            </span>
                            <small>{spread.positions[i]}</small>
                          </div>
                        )
                      )}
                    </div>
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
                    {busy ? 'Сохраняем расклад…' : 'Сохранить и открыть расклад'}
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
                <div>
                  <p className={styles.eyebrow}>НАЧНИ С ТОГО, ЧТО БЛИЖЕ</p>
                  <h2>О чём хочется спросить?</h2>
                </div>
                <span className={styles.categoryHint} aria-live="polite">
                  {category === 'all' ? 'Все темы' : catalog.categories.find((item) => item.id === category)?.title}
                </span>
              </div>
              <div
                className={styles.situationGrid}
                role="group"
                aria-label="Темы раскладов"
              >
                {[{ id: 'all', title: 'Любая тема' }, ...catalog.categories].map((c) => (
                  <button
                    key={c.id}
                    className={styles.situationCard}
                    aria-pressed={category === c.id}
                    onClick={() => setCategory(c.id)}
                  >
                    <span className={styles.situationGlyph} aria-hidden="true">{categoryGlyph[c.id] || '✧'}</span>
                    <strong>{c.title}</strong>
                    <small>{situationDescription[c.id] || 'Посмотри на тему с новой стороны'}</small>
                  </button>
                ))}
              </div>
              <div className={styles.spreadSection}>
                <div className={styles.spreadHead}>
                  <h2>Варианты расклада</h2>
                  <span>Листай варианты →</span>
                  <button onClick={() => setLibrary(true)}>Колода · 78 карт ↗</button>
                </div>
                <div className={styles.catalog} role="region" aria-label="Карусель раскладов" aria-roledescription="карусель">
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
                        <span className={styles.sigil} aria-hidden="true">{categoryGlyph[s.category] || '✧'}</span>
                        <small>
                          {s.positions.length} {cardCount(s.positions.length)} ·{' '}
                          {s.positions.length === 1 ? '1–2' : '3–5'} мин
                        </small>
                        <h3>{s.title}</h3>
                        <p>{s.description}</p>
                        <span className={styles.enter}>Выбрать расклад →</span>
                      </button>
                    ))}
                </div>
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
      <nav className={styles.mobileDock} aria-label="Основная навигация">
        <Link href="/services" aria-label="Направления">
          <span aria-hidden="true">✧</span><small>Направления</small>
        </Link>
        <Link href="/services/lunar" aria-label="Календарь">
          <span aria-hidden="true">☾</span><small>Календарь</small>
        </Link>
        <Link className={styles.dockHome} href="/dashboard" aria-label="Главная">
          <span aria-hidden="true">⌂</span><small>Главная</small>
        </Link>
        <Link href="/history" aria-label="История">
          <span aria-hidden="true">▤</span><small>История</small>
        </Link>
        <Link href="/profile" aria-label="Профиль">
          <span aria-hidden="true">♙</span><small>Профиль</small>
        </Link>
      </nav>
    </main>
  );
}
