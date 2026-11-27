'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import type { NatalChart, User, WelcomePlace } from '../../../types';
import { NatalChartWheel } from '../../../components/natal/NatalChartWheel';
import styles from './natal.module.css';

const SIGNS: Record<string, string> = {
  Aries: 'Овен', Taurus: 'Телец', Gemini: 'Близнецы', Cancer: 'Рак', Leo: 'Лев', Virgo: 'Дева',
  Libra: 'Весы', Scorpio: 'Скорпион', Sagittarius: 'Стрелец', Capricorn: 'Козерог', Aquarius: 'Водолей', Pisces: 'Рыбы',
};
const PLANETS: Record<string, { name: string; glyph: string; lens: string }> = {
  sun: { name: 'Солнце', glyph: '☉', lens: 'Самовыражение и чувство собственного пути' },
  moon: { name: 'Луна', glyph: '☾', lens: 'Эмоциональные потребности и привычный способ искать опору' },
  mercury: { name: 'Меркурий', glyph: '☿', lens: 'Мышление, любопытство и обмен идеями' },
  venus: { name: 'Венера', glyph: '♀', lens: 'Симпатии, близость и то, что вы цените' },
  mars: { name: 'Марс', glyph: '♂', lens: 'Инициатива, напор и способ действовать' },
  jupiter: { name: 'Юпитер', glyph: '♃', lens: 'Расширение кругозора и поиск возможностей' },
  saturn: { name: 'Сатурн', glyph: '♄', lens: 'Ответственность, границы и мастерство' },
  uranus: { name: 'Уран', glyph: '♅', lens: 'Самостоятельность и тяга к обновлению' },
  neptune: { name: 'Нептун', glyph: '♆', lens: 'Воображение, идеалы и восприимчивость' },
  pluto: { name: 'Плутон', glyph: '♇', lens: 'Глубокие перемены и работа с тем, что скрыто' },
};
const ASPECTS: Record<string, string> = {
  conjunction: 'Соединение', opposition: 'Оппозиция', trine: 'Трин', square: 'Квадрат', sextile: 'Секстиль',
  Conjunction: 'Соединение', Opposition: 'Оппозиция', Trine: 'Трин', Square: 'Квадрат', Sextile: 'Секстиль',
};
const SIGN_LENSES: Record<string, string> = {
  Aries: 'инициативно и прямо', Taurus: 'основательно и чувственно', Gemini: 'через вопросы и обмен идеями', Cancer: 'заботливо и чутко',
  Leo: 'творчески и щедро', Virgo: 'внимательно к деталям и пользе', Libra: 'через диалог и поиск равновесия', Scorpio: 'глубоко и проницательно',
  Sagittarius: 'с интересом к новым горизонтам', Capricorn: 'последовательно и ответственно', Aquarius: 'независимо и оригинально', Pisces: 'образно и восприимчиво',
};
const HOUSE_LENSES: Record<number, string> = {
  1: 'самопрезентации и первых шагов', 2: 'личных ресурсов и ценностей', 3: 'обучения и повседневного общения', 4: 'дома, корней и внутренней опоры',
  5: 'творчества, игры и самовыражения', 6: 'навыков, труда и повседневного ритма', 7: 'партнёрства и близкого диалога', 8: 'общих ресурсов и глубоких перемен',
  9: 'поиска смысла и расширения кругозора', 10: 'призвания и видимого вклада', 11: 'дружбы, сообществ и будущих замыслов', 12: 'тишины, восстановления и внутренней жизни',
};

function signName(sign?: string) { return sign ? SIGNS[sign] || SIGNS[sign[0]?.toUpperCase() + sign.slice(1).toLowerCase()] || sign : '—'; }
function degrees(value?: number) {
  if (!Number.isFinite(value)) return '';
  const whole = Math.floor(value as number);
  const minutes = Math.round(((value as number) - whole) * 60);
  return `${whole}°${String(minutes).padStart(2, '0')}′`;
}
function placeFromProfile(user: User | null): WelcomePlace | null {
  const location = user?.birthLocation;
  if (!location || typeof location !== 'object' || typeof location.latitude !== 'number' || typeof location.longitude !== 'number' || !location.city) return null;
  return { city: location.city, country: location.country || '', latitude: location.latitude, longitude: location.longitude, label: [location.city, location.country].filter(Boolean).join(', ') };
}

export default function NatalChartPage() {
  const [user, setUser] = useState<User | null>(null);
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [place, setPlace] = useState<WelcomePlace | null>(null);
  const [places, setPlaces] = useState<WelcomePlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlanet, setSelectedPlanet] = useState('sun');
  const [showMethod, setShowMethod] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const current = await api.getCurrentUser();
        if (!live) return;
        setUser(current);
        setDate(current?.birthDate || '');
        setTime(current?.birthTime ? String(current.birthTime).slice(0, 5) : '');
        const savedPlace = placeFromProfile(current);
        if (savedPlace) { setPlace(savedPlace); setPlaceQuery(savedPlace.label); }
        if (current) {
          const saved = await api.getNatalChart();
          if (live && saved) setChart(saved);
        }
      } catch { /* The form remains usable with explicitly entered birth data. */ }
      finally { if (live) setLoading(false); }
    })();
    return () => { live = false; };
  }, []);

  const planets = chart?.planets || {};
  const ascendant = chart?.houses?.find(house => house.number === 1) || chart?.houses?.[0];
  const bigThree = useMemo(() => [
    { key: 'sun', label: 'Солнце', value: planets.sun, note: 'Ваш центр и направление самовыражения' },
    { key: 'moon', label: 'Луна', value: planets.moon, note: 'Ваши чувства и внутренние потребности' },
    { key: 'ascendant', label: 'Асцендент', value: ascendant, note: 'Первое движение навстречу миру' },
  ], [planets, ascendant]);

  const searchPlaces = async () => {
    const query = placeQuery.trim();
    if (query.length < 3) { setError('Введите хотя бы три буквы города и нажмите «Найти»'); return; }
    setSearching(true); setError(''); setPlaces([]); setPlace(null);
    try { setPlaces(await api.searchBirthplaces(query)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Не удалось найти город. Попробуйте ещё раз.'); }
    finally { setSearching(false); }
  };

  const calculate = async () => {
    if (!date || !time || !place) {
      setError(!place ? 'Выберите точный город рождения из результатов поиска.' : 'Укажите дату и местное время рождения.');
      return;
    }
    setCalculating(true); setError('');
    try {
      const next = await api.calculateNatalChart({
        name: user?.fullName || 'Путник', birthDate: date,
        birthTime: time.length === 5 ? `${time}:00` : time,
        latitude: place.latitude, longitude: place.longitude,
        city: place.city, country: place.country, houseSystem: 'placidus', generateInterpretation: false,
      });
      setChart(next); setSelectedPlanet('sun');
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось построить карту. Проверьте данные рождения.'); }
    finally { setCalculating(false); }
  };

  const selectedInfo = selectedPlanet === 'ascendant'
    ? { name: 'Асцендент', glyph: '↗', lens: 'Первое впечатление и способ входить в новые обстоятельства' }
    : PLANETS[selectedPlanet] || PLANETS.sun;
  const selectedPosition = selectedPlanet === 'ascendant'
    ? (ascendant ? { ...ascendant, house: 1 } : undefined)
    : planets[selectedPlanet];
  const selectedSign = Object.keys(SIGNS).find(sign => signName(selectedPosition?.sign) === SIGNS[sign]);
  const selectedHouse = selectedPosition?.house;

  if (loading) return <main className={styles.loading}><span className={styles.loadingStar}>✧</span><p>Собираем небесную карту</p></main>;

  return <main className={styles.page}>
    <header className={styles.topbar}>
      <Link href="/dashboard" className={styles.back}>← <span>Главная</span></Link>
      <div className={styles.brand}><span className={styles.brandMark}>✧</span><span>NATAL CHART</span></div>
      <button className={styles.methodTop} onClick={() => setShowMethod(v => !v)}>Метод расчёта</button>
    </header>

    {!chart ? <section className={styles.intro}>
      <div className={styles.introCopy}>
        <p className={styles.eyebrow}>Личный небесный атлас</p>
        <h1>Карта неба<br /><em>в миг вашего рождения</em></h1>
        <p className={styles.lede}>Планеты, знаки, дома и связи между ними — рассчитанные по месту и местному времени рождения, с объяснением каждой позиции.</p>
        <div className={styles.standardTag}><span>♒</span> Тропический зодиак <i /> Плацидус <i /> Геоцентрическая карта</div>
        <Link href="/services/natal/methodology" className={styles.methodologyInline}>Открытая методика и формат ссылки <span>→</span></Link>
        {showMethod && <p className={styles.methodHint}>Положения планет и домов рассчитывает Kerykeion по выбранному месту, местному времени и историческому часовому поясу. Трактовка показывается отдельно и не меняет расчёт.</p>}
      </div>
      <div className={styles.formCard}>
        <div className={styles.formHeading}><span>01</span><div><h2>Координаты рождения</h2><p>Точность карты начинается с этих данных</p></div></div>
        <div className={styles.fields}>
          <label className={styles.field}><span>Дата рождения</span><input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
          <label className={styles.field}><span>Местное время</span><input type="time" value={time} onChange={e => setTime(e.target.value)} /><small>Время на часах в городе рождения. Если оно неизвестно, дома и Асцендент нельзя определить достоверно.</small></label>
          <div className={styles.field}>
            <span>Город рождения</span>
            <div className={styles.placeSearch}><input value={placeQuery} placeholder="Например, Казань, Россия" onChange={e => { setPlaceQuery(e.target.value); setPlace(null); setPlaces([]); }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void searchPlaces(); } }} /><button type="button" onClick={() => void searchPlaces()} disabled={searching}>{searching ? 'Ищем…' : 'Найти'}</button></div>
            {places.length > 0 && <ul className={styles.placeList}>{places.map((item, i) => <li key={`${item.latitude}:${item.longitude}:${i}`}><button type="button" onClick={() => { setPlace(item); setPlaceQuery(item.label); setPlaces([]); setError(''); }}>{item.label}<span>Выбрать →</span></button></li>)}</ul>}
            {place && <small className={styles.placeConfirmed}>✦ Место выбрано · часовой пояс определится по координатам</small>}
            <small>Поиск мест: OpenStreetMap</small>
          </div>
        </div>
        <div className={styles.dataNote}><span>✦</span><p>Время вводится как местное историческое время рождения. Часовой пояс вычисляется по выбранному городу и дате.</p></div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={styles.primary} onClick={() => void calculate()} disabled={calculating}>{calculating ? <><span className={styles.spin}>✧</span> Вычисляем положения…</> : <>Построить мою карту <span>→</span></>}</button>
      </div>
      <p className={styles.footnote}>Символическая астрологическая система · Не предсказание и не научная диагностика</p>
    </section> : <>
      <section className={styles.chartHeader}>
        <div><p className={styles.eyebrow}>Ваш небесный портрет</p><h1>Три опоры <em>вашей карты</em></h1><p>Положения показывают символический язык карты; они не задают предел вашим возможностям.</p></div>
        <button className={styles.editData} onClick={() => setChart(null)}>Изменить данные <span>↗</span></button>
      </section>
      <section className={styles.chartGrid}>
        <div className={styles.wheelPanel}>
          <div className={styles.panelHead}><span>КОЛЕСО РОЖДЕНИЯ</span><span className={styles.liveDot}>12 домов · 10 планет</span></div>
          <div className={styles.wheelWrap}><div className={styles.wheelGlow} /><NatalChartWheel chart={chart} variant="full" className={styles.wheel} selectedPlanet={selectedPlanet} onSelectPlanet={setSelectedPlanet} /></div>
          <div className={styles.wheelLegend}><span><i className={styles.legendBlue} /> Планеты</span><span><i className={styles.legendGold} /> Дома и знаки</span><span><i className={styles.legendRose} /> Аспекты</span></div>
        </div>
        <div className={styles.summaryPanel}>
          <div className={styles.panelHead}><span>ТРИ ОПОРЫ</span><span className={styles.accentGlyph}>✧</span></div>
          <p className={styles.summaryIntro}>Мирастрос предлагает читать карту как разговор трёх начал:</p>
          <div className={styles.bigThree}>{bigThree.map(item => <button key={item.key} className={`${styles.bigItem} ${selectedPlanet === item.key ? styles.bigSelected : ''}`} onClick={() => setSelectedPlanet(item.key)}>
            <span className={styles.bigGlyph}>{item.key === 'ascendant' ? '↗' : PLANETS[item.key]?.glyph}</span><span className={styles.bigLabel}>{item.label}</span><strong>{signName(item.value?.sign)}</strong><small>{item.note}</small>
          </button>)}</div>
          <div className={styles.interpretation}>
            <div className={styles.interpretationKicker}>СЕЙЧАС ОТКРЫТО · {selectedInfo.name.toUpperCase()}</div>
            <h2>{signName(selectedPosition?.sign)} <span>{degrees(selectedPosition?.degree)}</span></h2>
            {selectedPosition ? <p>{selectedInfo.lens}. В знаке {signName(selectedPosition.sign)} эта тема может проявляться {SIGN_LENSES[selectedSign || ''] || 'характерным для знака образом'}{selectedHouse ? <>; в {selectedHouse}-м доме она связана с областью {HOUSE_LENSES[selectedHouse] || 'жизненного опыта'}</> : ''}.</p> : <p>Для этой точки нет рассчитанных координат в сохранённой карте. Обновите исходные данные, чтобы получить точное положение.</p>}
            {selectedPosition && <p className={styles.reflection}>В повседневной жизни это можно исследовать так: где вы уже замечаете эту тему и какой небольшой выбор поможет прожить её более осознанно?</p>}
          </div>
          <button className={styles.methodLink} onClick={() => setShowMethod(v => !v)}>{showMethod ? 'Скрыть методику' : 'Как рассчитана карта?'} <span>{showMethod ? '−' : '+'}</span></button>
        </div>
      </section>
      <section className={styles.planetSection}>
        <div className={styles.sectionTitle}><div><p className={styles.eyebrow}>Чтение карты</p><h2>Планеты и сферы жизни</h2></div><span>Выберите позицию — колесо и пояснение обновятся</span></div>
        <div className={styles.planetGrid}>{Object.entries(PLANETS).map(([key, info], i) => {
          const position = planets[key];
          if (!position) return null;
          return <button key={key} className={`${styles.planetCard} ${selectedPlanet === key ? styles.planetActive : ''}`} onClick={() => { setSelectedPlanet(key); document.querySelector(`.${styles.summaryPanel}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>
            <span className={styles.planetGlyph}>{info.glyph}</span><span className={styles.planetName}>{info.name}</span><strong>{signName(position.sign)}</strong><small>{position.house} дом · {degrees(position.degree)}</small><i>{String(i + 1).padStart(2, '0')}</i>
          </button>;
        })}</div>
      </section>
      <section className={styles.aspectsSection}>
        <div className={styles.sectionTitle}><div><p className={styles.eyebrow}>Взаимодействие энергий</p><h2>Аспекты карты</h2></div><span>Геометрические углы между планетами</span></div>
        <div className={styles.aspectGrid}>{chart.aspects.slice(0, 8).map((aspect, i) => <article className={styles.aspectCard} key={`${aspect.planet1}-${aspect.type}-${aspect.planet2}`}><span className={styles.aspectNumber}>{String(i + 1).padStart(2, '0')}</span><div><strong>{PLANETS[aspect.planet1.toLowerCase()]?.name || aspect.planet1} <i>✧</i> {PLANETS[aspect.planet2.toLowerCase()]?.name || aspect.planet2}</strong><p>{ASPECTS[aspect.type] || aspect.type} · орбис {Number(aspect.orb).toFixed(1)}°</p></div></article>)}{chart.aspects.length === 0 && <p className={styles.noAspects}>В этой карте нет аспектов, прошедших пороги выбранной системы расчёта.</p>}</div>
      </section>
      {showMethod && <section className={styles.methodPanel}>
        <div><p className={styles.eyebrow}>Паспорт расчёта</p><h2>Как получены координаты</h2><p>Положения планет рассчитаны для местного времени выбранного места рождения и переведены в UTC с учётом часового пояса и исторических правил перевода часов.</p></div>
        <dl><div><dt>Редакция расчёта</dt><dd>{chart.calculationMetadata?.version || 'Не указана для этой карты'}</dd></div><div><dt>Система зодиака</dt><dd>Тропическая</dd></div><div><dt>Точка зрения</dt><dd>Геоцентрическая · видимые положения</dd></div><div><dt>Система домов</dt><dd>Плацидус</dd></div><div><dt>Лунный узел</dt><dd>{chart.calculationMetadata?.lunar_node || 'Средний узел'}</dd></div><div><dt>Часовой пояс</dt><dd>{chart.calculationMetadata?.birth_timezone || 'Уточняется для сохранённой карты'}</dd></div><div><dt>Версия базы часовых поясов</dt><dd>{chart.calculationMetadata?.timezone_database_version || '—'}</dd></div><div><dt>Время UTC</dt><dd>{chart.calculationMetadata?.birth_datetime_utc ? new Date(chart.calculationMetadata.birth_datetime_utc).toISOString().replace('T', ' ').slice(0, 19) : '—'}</dd></div><div><dt>Координаты места</dt><dd>{chart.calculationMetadata?.coordinates ? `${chart.calculationMetadata.coordinates.latitude.toFixed(4)}, ${chart.calculationMetadata.coordinates.longitude.toFixed(4)}` : '—'}</dd></div><div><dt>Расчётный движок</dt><dd>{chart.calculationMetadata?.engine || 'Kerykeion'} {chart.calculationMetadata?.engine_version || ''}</dd></div><div><dt>Эфемериды</dt><dd>{chart.calculationMetadata?.ephemeris || 'Swiss Ephemeris'} {chart.calculationMetadata?.ephemeris_version || ''}</dd></div></dl>
        <Link href="/services/natal/methodology" className={styles.methodologyLink}>Открытая методика и формат цитирования <span>→</span></Link>
      </section>}
      <p className={styles.disclaimer}>Астрологические трактовки — символический инструмент самонаблюдения. Расчёт положений отделён от их интерпретации.</p>
    </>}

    <footer className={styles.footer}><span>МИРАСТРОС · ЛИЧНЫЙ НЕБЕСНЫЙ АТЛАС</span><Link href="/history">Моя история →</Link><Link href="/services">Все направления</Link></footer>
  </main>;
}
