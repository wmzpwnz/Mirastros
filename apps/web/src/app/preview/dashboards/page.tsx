import styles from './gallery.module.css';

export const metadata = { title: 'Варианты дашборда · Mirastros', robots: { index: false, follow: false } };

const variants = [
  ['atlas', 'Атлас дня'],
  ['moon', 'Лунная обсерватория'],
  ['journal', 'Дневник путника'],
  ['deck', 'Расклад дня'],
] as const;

const readings = [
  ['forecast', 'Гороскоп', 'Овен', 'Сегодня стоит дать ход одному делу, которое давно ждёт первого шага.', '/zodiac/aries.png'],
  ['lunar', 'Лунный ритм', 'Растущая Луна', 'В Овне · полнолуние 24 ноября', '/images/portals/lunar.webp'],
  ['number', 'Личный день', '5 · Гибкость', 'Оставьте место для неожиданного решения.', '/images/portals/numerology.webp'],
  ['tarot', 'Карта дня', 'Отшельник', 'Побудьте в тишине, прежде чем искать чужого совета.', '/images/portals/tarot.webp'],
  ['practice', 'Практика · 2 минуты', 'Один шаг для себя', 'Уточните одну деталь своего плана. Какой разговор стоит начать?', '/images/portals/rituals.webp'],
] as const;

export default function DashboardGallery() {
  return <main className={styles.gallery}>
    <header className={styles.intro}><img src="/logo.png" alt="Mirastros" width="152" /><h1>Четыре взгляда на ваш день</h1><p>Варианты дашборда · демонстрационные данные за 20 ноября</p>
      <nav aria-label="Перейти к варианту">{variants.map(([id, name]) => <a key={id} href={'#'+id}>{name}</a>)}</nav>
    </header>
    {variants.map(([id, name], index) => <section key={id} id={id} className={styles.variant} aria-labelledby={id+'-title'}>
      <h2 id={id+'-title'}>Вариант {index+1} · {name}</h2>
      <div className={styles.board+' '+styles[id]}>
        <header className={styles.mast}><img src="/logo.png" alt="Mirastros" width="125"/><div><small>Пятница · 20 ноября</small><h3>Ваш день, Азиз</h3></div></header>
        <aside className={styles.library}><small>Личная библиотека</small><h4>Недавние открытия</h4><ul><li>Три карты о переменах <time>19 ноя</time></li><li>Моя натальная карта <time>17 ноя</time></li></ul></aside>
        <div className={styles.readings}>{readings.map(([key,label,title,copy,image]) => <article key={key} className={styles.tile+' '+styles[key]}>
          <img src={image} alt="" loading="lazy"/><div><small>{label}</small><h4>{title}</h4>{key==='lunar' && <strong>79% освещённости</strong>}<p>{copy}</p></div>
        </article>)}</div>
      </div>
    </section>)}
  </main>;
}
