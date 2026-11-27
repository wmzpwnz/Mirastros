import Link from 'next/link';
import styles from '../natal.module.css';

const conventions = [
  ['Зодиак', 'Тропический'],
  ['Положения', 'Геоцентрические, видимые'],
  ['Система домов', 'Плацидус'],
  ['Лунный узел', 'Средний узел; Южный — точка напротив'],
  ['Расчётный движок', 'Kerykeion 5.1.12'],
  ['Эфемериды', 'Swiss Ephemeris · pyswisseph 2.10.3.2'],
  ['Часовые пояса', 'IANA tzdb · конкретная редакция записывается в паспорте карты'],
];

export default function NatalMethodologyPage() {
  return <main className={styles.page}>
    <header className={styles.topbar}>
      <Link href="/services/natal" className={styles.back}>← <span>К натальной карте</span></Link>
      <div className={styles.brand}><span className={styles.brandMark}>✧</span><span>MIRASTROS · STANDARD 2</span></div>
      <span />
    </header>
    <article className={styles.methodology}>
      <p className={styles.eyebrow}>Открытая методика · редакция 2</p>
      <h1>Как строится <em>натальная карта</em></h1>
      <p className={styles.methodologyLead}>Mirastros фиксирует не «единственно верную астрологию», а точную, открытую и воспроизводимую конвенцию западной тропической натальной астрологии. Любой читатель может проверить входные данные, параметры расчёта и версии программного обеспечения.</p>
      <section className={styles.methodologySection}>
        <h2>Параметры этой редакции</h2>
        <dl className={styles.conventionGrid}>{conventions.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </section>
      <section className={styles.methodologySection}>
        <h2>От рождения до расчёта</h2>
        <ol className={styles.methodologySteps}>
          <li><strong>Местные данные.</strong> Дата и время вводятся такими, какими они были записаны в месте рождения. Город выбирается из поиска вместе с координатами; подмены на Москву или другой город нет.</li>
          <li><strong>Исторический часовой пояс.</strong> Для координат находится часовой пояс IANA, а для даты рождения применяются правила, действовавшие в тот день. Неоднозначное или несуществующее время при переводе часов отклоняется, а не угадывается.</li>
          <li><strong>Единый момент времени.</strong> Местное время переводится в UTC. Положения планет, дома и аспекты вычисляются для одного и того же момента и выбранной конвенции.</li>
          <li><strong>Паспорт результата.</strong> Вместе с картой сохраняются редакция расчёта, движок, эфемериды, часовой пояс и его база, UTC-момент, координаты, зодиак и система домов.</li>
        </ol>
      </section>
      <section className={styles.methodologySection}>
        <h2>Что означает интерпретация</h2>
        <p>Положения небесных тел и геометрия карты — расчётные данные. Значения знаков, домов и аспектов — язык конкретной астрологической традиции, а не научный диагноз, обещание события или ограничение личности. Mirastros отделяет вычисления от текста толкования.</p>
      </section>
      <section className={styles.methodologySection}>
        <h2>Как сослаться на результат</h2>
        <p className={styles.citation}>«Натальная карта Mirastros, редакция расчёта 2 (mirastros-natal-2): тропический зодиак, геоцентрические видимые положения, дома Плацидуса; Kerykeion 5.1.12, Swiss Ephemeris / pyswisseph 2.10.3.2. Индивидуальный паспорт карты содержит дату, местное время и место рождения, координаты, UTC-момент и версии баз времени».</p>
        <p>Для проверки конкретной карты цитируйте её паспорт, а не только название сервиса: другой час рождения, координаты, система домов или редакция программного обеспечения могут изменить результат.</p>
      </section>
      <section className={styles.methodologySection}>
        <h2>Границы точности и полноты</h2>
        <p>Полная карта требует известного времени рождения. Если время неизвестно, Mirastros не подставляет полдень и не показывает вымышленные Асцендент или дома. Редакция 2 описывает выбранную вычислительную традицию; она не заявляет о международном экспертном консенсусе или научной доказанности астрологии.</p>
      </section>
      <p className={styles.licenseNote}>Техническая зависимость Kerykeion распространяется по AGPL-3.0; коммерческое использование требует отдельной проверки условий лицензии. Страница методики не предоставляет лицензию на стороннее программное обеспечение.</p>
      <Link href="/services/natal" className={styles.primaryLink}>Открыть свою натальную карту <span>→</span></Link>
    </article>
    <footer className={styles.footer}><span>МИРАСТРОС · МЕТОДИКА НАТАЛЬНОЙ КАРТЫ</span><Link href="/services/natal">К карте рождения →</Link></footer>
  </main>;
}
