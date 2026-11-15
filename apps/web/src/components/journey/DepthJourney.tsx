'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OrnamentFrame } from '../ornaments/OrnamentFrame';
import { HeroSection } from '../sections/HeroSection';
import { PortalArtwork } from './PortalArtwork';
import { journeyModules } from './catalog';
import { activePortal, endingOpacity, heroOpacity, portalFrame, sceneMetrics, INTRO_SCREENS } from './depthModel';
import styles from './DepthJourney.module.css';
import { PortalCover } from '../../../../../packages/design-system/src/components/PortalCover';

type View = 'flight' | 'list';
const count = journeyModules.length;
const totalScreens = count + 1.8;
// Responsive travel with a softer settling tail; depth geometry stays unchanged.
const SCROLL_SPEED = 1.22;

/** Original Mirastros implementation of a perspective gallery. Reference:
 * sageeast.com's continuous camera travel, rather than its code or photographs.
 * Each card occupies its own Z plane; the camera moves them as one scene. */
export function DepthJourney({ intro, authenticated = false }: { intro?: ReactNode; authenticated?: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const endingRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(0);
  const unitsRef = useRef(0);
  const layoutRef = useRef({ height: 1, start: 0 });
  const homeRequested = useRef(false);
  const previousView = useRef<View>('flight');
  const flags = useRef({ exploring: false, ending: false });
  const [view, setView] = useState<View>('flight');
  const [active, setActive] = useState(0);
  const [exploring, setExploring] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    const root = rootRef.current!;
    const cameraElement = cameraRef.current!;
    const cards = Array.from(cameraElement.querySelectorAll<HTMLElement>('[data-portal]'));
    const links = cards.map(card => card.querySelector<HTMLAnchorElement>('a')!);
    const fromList = previousView.current === 'list';
    previousView.current = view;
    root.dataset.ready = 'true';
    if (view === 'list') {
      cards.forEach((card, i) => { card.removeAttribute('aria-hidden'); links[i].tabIndex = 0; });
      headerRef.current!.style.opacity = '1';
      headerRef.current!.style.pointerEvents = 'auto';
      const frame = requestAnimationFrame(() => cards[activeRef.current]?.scrollIntoView({ block: 'center', behavior: 'instant' }));
      return () => { cancelAnimationFrame(frame); delete root.dataset.ready; };
    }

    gsap.registerPlugin(ScrollTrigger);
    let layout = { width: window.innerWidth, height: window.innerHeight };
    let context: gsap.Context;
    let normalizer: ReturnType<typeof ScrollTrigger.normalizeScroll>;
    let resizeTimer: ReturnType<typeof setTimeout>;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const state = { screens: 0 };
    let drawing = true;
    const setters = cards.map(card => ({ z: gsap.quickSetter(card, 'z', 'px'), x: gsap.quickSetter(card, 'x', 'px'), opacity: gsap.quickSetter(card, 'opacity'), visible: false }));

    const draw = () => {
      if (!drawing || !root.isConnected || !headerRef.current) return;
      const screens = state.screens;
      unitsRef.current = screens;
      const intro = heroOpacity(screens);
      const end = endingOpacity(screens, count);
      const index = activePortal(screens, count);
      if (index !== activeRef.current) { activeRef.current = index; setActive(index); }
      const isExploring = intro < .05;
      const isEnding = end > .5;
      if (flags.current.exploring !== isExploring) { flags.current.exploring = isExploring; setExploring(isExploring); }
      if (flags.current.ending !== isEnding) { flags.current.ending = isEnding; setEnding(isEnding); }
      if (introRef.current) {
        introRef.current.style.opacity = String(intro);
        introRef.current.style.pointerEvents = intro > .1 ? 'auto' : 'none';
        introRef.current.inert = intro <= .1;
        introRef.current.setAttribute('aria-hidden', intro <= .1 ? 'true' : 'false');
      }
      if (endingRef.current) { endingRef.current.style.opacity = String(end); endingRef.current.style.pointerEvents = isEnding ? 'auto' : 'none'; }
      headerRef.current!.style.opacity = isExploring ? '1' : '0';
      headerRef.current!.style.pointerEvents = isExploring ? 'auto' : 'none';
      root.style.setProperty('--journey-accent', journeyModules[index].accent);
      if (progressRef.current) progressRef.current.textContent = `${Math.round(Math.min(1, screens / totalScreens) * 100)}%`;
      cards.forEach((card, i) => {
        const model = portalFrame(i, screens, layout.width);
        const visible = model.visible && end < .98;
        const current = setters[i];
        if (current.visible !== visible) {
          current.visible = visible;
          card.style.visibility = visible ? 'visible' : 'hidden';
          card.style.willChange = visible ? 'transform, opacity' : 'auto';
        }
        if (visible) { current.z(model.z); current.x(model.x); current.opacity(model.opacity); card.dataset.depth = model.z.toFixed(1); }
        const selectable = visible && i === index && isExploring && !isEnding;
        links[i].tabIndex = selectable ? 0 : -1;
        card.style.pointerEvents = selectable ? 'auto' : 'none';
        card.setAttribute('aria-hidden', selectable ? 'false' : 'true');
      });
    };

    const stopNormalizer = () => {
      if (!normalizer) return;
      if (ScrollTrigger.normalizeScroll() === normalizer) ScrollTrigger.normalizeScroll(false);
      else normalizer.kill();
      normalizer = undefined;
    };
    const initialize = (restoreScreens: number) => {
      stopNormalizer();
      drawing = false;
      context?.revert();
      drawing = true;
      layout = { width: window.innerWidth, height: window.innerHeight };
      const scrollUnit = layout.height / SCROLL_SPEED;
      layoutRef.current = { height: scrollUnit, start: root.offsetTop };
      root.style.height = `${totalScreens * scrollUnit + layout.height}px`;
      root.style.setProperty('--journey-vh', `${layout.height}px`);
      cameraElement.style.perspective = `${sceneMetrics(layout.width).perspective}px`;
      state.screens = 0;
      context = gsap.context(() => {
        gsap.set(cards, { xPercent: -50, yPercent: -50, force3D: true });
        gsap.to(state, { screens: totalScreens, ease: 'none', onUpdate: draw, scrollTrigger: { trigger: root, start: 'top top', end: () => `+=${totalScreens * scrollUnit}`, scrub: reduce ? true : .28, invalidateOnRefresh: true } });
      }, root);
      ScrollTrigger.refresh();
      if (window.matchMedia('(pointer: coarse)').matches || layout.width < 1024) {
        normalizer = ScrollTrigger.normalizeScroll({ type: 'touch', allowNestedScroll: true, momentum: () => reduce ? 0 : 1.1 });
      }
      // Restore zero as well as later cards; retain the normalizer's 1px iOS floor.
      window.scrollTo({ top: Math.max(1, root.offsetTop + restoreScreens * scrollUnit), behavior: 'instant' });
      ScrollTrigger.update();
      draw();
      window.dispatchEvent(new CustomEvent('tunnel-initialized'));
    };
    initialize(homeRequested.current ? 0 : fromList ? activeRef.current + INTRO_SCREENS : 0);
    homeRequested.current = false;
    const onResize = () => {
      root.style.setProperty('--journey-vh', `${window.innerHeight}px`);
      if (Math.abs(window.innerWidth - layout.width) < 2 && Math.abs(window.innerHeight - layout.height) < layout.height * .25) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => initialize(unitsRef.current), 180);
    };
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize); window.visualViewport?.removeEventListener('resize', onResize);
      drawing = false;
      stopNormalizer(); context?.revert(); root.style.height = ''; delete root.dataset.ready;
      cards.forEach((card, i) => { card.style.visibility = ''; card.style.willChange = ''; card.style.pointerEvents = ''; card.removeAttribute('aria-hidden'); links[i].tabIndex = 0; });
    };
  }, [view]);

  const navigate = (direction: number) => {
    const target = !exploring ? INTRO_SCREENS : ending ? count - 1 + INTRO_SCREENS : direction > 0 && active === count - 1 ? count + 1.6 : Math.max(0, active + direction) + INTRO_SCREENS;
    window.scrollTo({ top: layoutRef.current.start + target * layoutRef.current.height, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const enter = () => window.scrollTo({ top: layoutRef.current.start + INTRO_SCREENS * layoutRef.current.height, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  const headerVisible = view === 'list' || exploring;

  return <main ref={rootRef} className={styles.root} data-view={view} data-account={authenticated} data-exploring={exploring} style={{ '--journey-screens': totalScreens, '--journey-accent': journeyModules[active].accent } as CSSProperties}>
    <header ref={headerRef} className={styles.header} aria-hidden={!headerVisible}>
      <Link href="/services" tabIndex={headerVisible ? 0 : -1}>Направления</Link>
      <Link href={authenticated ? "/dashboard" : "/"} className={styles.brand} onClick={event => {
        if (window.location.pathname !== (authenticated ? '/dashboard' : '/')) return;
        event.preventDefault();
        if (view === 'list') { homeRequested.current = true; setView('flight'); }
        else window.scrollTo({ top: 1, behavior: 'instant' });
      }} tabIndex={headerVisible ? 0 : -1}><img src="/logo.png" alt="Mirastros" width="800" height="205" /></Link>
      <Link href={authenticated ? "/profile" : "/auth/register"} tabIndex={headerVisible ? 0 : -1}>{authenticated ? "Профиль" : "Начать путь"}</Link>
    </header>
    <div className={styles.viewport}>
      <div className={styles.backdrop} aria-hidden="true"><img src="/images/mirastros-reference-desktop.webp" alt="" /><span /></div>
      {view === 'list' && <h1 className={styles.listTitle}>Ваш мир Mirastros</h1>}
      <OrnamentFrame className={styles.stageFrame} />
      <div ref={cameraRef} className={styles.camera} aria-label="Направления Mirastros">
        {journeyModules.map((item, i) => <article key={item.id} className={styles.card} data-portal={item.id} style={{ '--card-accent': item.accent } as CSSProperties}>
          <div className={styles.cardBody}>
          <Link className={styles.cardLink} href={item.href} aria-label={`Открыть: ${item.title}`} />
          <PortalCover title={item.title} description={item.subtitle} accent={item.accent} featured={view === 'flight'} artwork={
            <PortalArtwork id={item.id} media={item.media} eager={i < 5} focused={view === 'list' || exploring && !ending && active === i} active={view === 'list' ? undefined : exploring && !ending && Math.abs(active - i) <= 1} />
          } />
          </div>
        </article>)}
      </div>
      {view === 'flight' && <>
        <div ref={introRef} className={styles.intro}>
          {intro ? <><div className={styles.accountScroll} data-lenis-prevent>{intro}</div><button className={`mira-action mira-action-primary ${styles.enterJourney}`} onClick={enter}>Открыть порталы направлений <span aria-hidden="true">↓</span></button></> : <HeroSection showScrollCue={false} />}
        </div>
        <div ref={endingRef} className={styles.ending} aria-hidden={!ending}>
          <p className={styles.kicker}>Весь мир Mirastros — в одном аккаунте</p>
          <h2>{authenticated ? "Ваш мир всегда рядом" : "Продолжить свой путь"}</h2>
          <p>Сохранённые результаты, личные открытия<br />и ваши избранные направления.</p>
          <Link className="mira-action mira-action-primary" href={authenticated ? "/history" : "/auth/register"} tabIndex={ending ? 0 : -1}>{authenticated ? "Моя история" : "Начать свой путь"} <span aria-hidden="true">✧</span></Link>
          <Link href="/services" className={styles.catalog} tabIndex={ending ? 0 : -1}>Посмотреть все направления</Link>
          <Link href="/shop" className={styles.catalog} tabIndex={ending ? 0 : -1}>Магазин Mirastros</Link>
        </div>
      </>}
    </div>
    {authenticated && view === 'flight' && !exploring && <nav className={styles.accountNavigation} aria-label="Быстрая навигация кабинета">
      <OrnamentFrame />
      {[
        ['/dashboard', 'Главная', 'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10'],
        ['#directions', 'Направления', 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z'],
        ['/services/lunar', 'Календарь', 'M5 5h14v16H5V5Zm3-3v6m8-6v6M5 10h14'],
        ['/history', 'История', 'M5 4h14v17H5V4Zm3 5h8m-8 4h8m-8 4h5'],
        ['/profile', 'Профиль', 'M17 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM3 22v-2a9 9 0 0 1 18 0v2'],
      ].map(([href, label, path]) => {
        const content = <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d={path} /></svg><span>{label}</span></>;
        return href === '#directions' ? <button key={href} onClick={enter}>{content}</button> : <Link key={href} href={href} aria-current={href === '/dashboard' ? 'page' : undefined}>{content}</Link>;
      })}
    </nav>}
    <footer className={styles.footer}>
      <div className={styles.position}>{view === 'list' ? `${count} направлений` : <><span>{exploring ? String(active + 1).padStart(2, '0') : '✧'}</span><span className={styles.separator}>/</span><span>{exploring ? String(count).padStart(2, '0') : 'Ваш путь'}</span></>}</div>
      <nav className={styles.viewSwitch} aria-label="Режим просмотра">
        <button onClick={() => setView('flight')} aria-pressed={view === 'flight'}>Полёт</button><span aria-hidden="true">·</span><button onClick={() => setView('list')} aria-pressed={view === 'list'}>Список</button>
      </nav>
      {view === 'flight' && <div className={styles.steps}><button onClick={() => navigate(-1)} aria-label="Предыдущее направление" disabled={!exploring || (active === 0 && !ending)}>←</button><span ref={progressRef}>0%</span><button onClick={() => navigate(1)} aria-label="Следующее направление">→</button></div>}
    </footer>
  </main>;
}
