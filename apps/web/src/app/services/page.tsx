'use client';

import Link from 'next/link';
import { PortalCover } from '../../../../../packages/design-system/src/components/PortalCover';
import { journeyModules } from '../../components/journey/catalog';
import { PortalArtwork } from '../../components/journey/PortalArtwork';
import styles from './catalog.module.css';

export default function ServicesPage() {
  return <main className={styles.root}>
    <header className={styles.header}>
      <Link href="/dashboard" className={styles.back}>← В личный кабинет</Link>
      <span className={styles.kicker}>Мир Mirastros</span>
      <h1>Выберите свой путь</h1>
      <p>Числа, звёзды и древние символы.<br />Каждое направление — новое знакомство с собой.</p>
    </header>
    <div className={styles.grid}>
      {journeyModules.map((item, i) => <Link key={item.id} href={item.href} className={styles.card} aria-label={`Открыть: ${item.title}`}>
        <PortalCover title={item.title} description={item.subtitle} accent={item.accent} artwork={<PortalArtwork id={item.id} media={item.media} eager={i < 5} />} />
      </Link>)}
    </div>
    <p className={styles.caption}>{journeyModules.length} направлений · Один профиль · Ваш собственный ритм</p>
  </main>;
}
