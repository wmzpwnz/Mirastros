# 📊 ПОЛНЫЙ ОТЧЁТ: ЭФФЕКТ ТУННЕЛЯ (TUNNEL EFFECT) В ПРОЕКТЕ MIRASTROS

**Дата анализа:** 14 февраля 2026  
**Версия:** 1.0  
**Статус:** Детальный анализ кода, архитектуры и реализации

---

## 📋 СОДЕРЖАНИЕ

1. [Обзор концепции](#1-обзор-концепции)
2. [Архитектура и компоненты](#2-архитектура-и-компоненты)
3. [Web-приложение: Z-Scroll Tunnel Effect](#3-web-приложение-z-scroll-tunnel-effect)
4. [Dashboard: Personal Hero Tunnel](#4-dashboard-personal-hero-tunnel)
5. [Мобильные приложения (VK-mini, Telegram-mini)](#5-мобильные-приложения)
6. [Mobile (React Native)](#6-mobile-react-native)
7. [Tunnel Infinite Menu](#7-tunnel-infinite-menu)
8. [CSS и layout для tunnel effect](#8-css-и-layout-для-tunnel-effect)
9. [Динамические фоны и синхронизация](#9-динамические-фоны-и-синхронизация)
10. [Конфигурация и feature flags](#10-конфигурация-и-feature-flags)
11. [Проблемы и рекомендации](#11-проблемы-и-рекомендации)

---

## 1. ОБЗОР КОНЦЕПЦИИ

### 1.1 Что такое Tunnel Effect в Mirastros

**Tunnel Effect (эффект туннеля)** — это визуальная техника скролла, создающая ощущение «пролёта сквозь туннель» при прокрутке страницы. Вместо обычного вертикального скролла контент:

- **Масштабируется** (zoom in/out) при входе и выходе из viewport
- **Размывается** (blur) при удалении от центра
- **Смещается** по оси Z (глубина) — отсюда название **Z-Scroll**
- **Появляется/исчезает** с плавными переходами

### 1.2 Где используется

| Приложение | Реализация | Технологии |
|------------|------------|------------|
| **Web (Landing)** | Полноценный Z-Scroll с flying GIFs | GSAP, ScrollTrigger |
| **Web (Dashboard)** | Z-Scroll с Personal Hero | GSAP, ScrollTrigger |
| **VK-mini** | Упрощённый Z-Scroll | CSS transitions, scroll events |
| **Telegram-mini** | Упрощённый Z-Scroll | IntersectionObserver, CSS |
| **Mobile (React Native)** | Z-Scroll с zig-zag | Reanimated, interpolate |
| **Dashboard2-preview** | Tunnel Infinite Menu | 3D carousel, requestAnimationFrame |

---

## 2. АРХИТЕКТУРА И КОМПОНЕНТЫ

### 2.1 Карта файлов

```
mirastros-universal/
├── apps/web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Landing: initSageEastScroll, Hero tunnel + flying GIFs
│   │   │   ├── dashboard/page.tsx          # Dashboard: Z-Scroll tunnel, Personal Hero
│   │   │   ├── dashboard2-preview/page.tsx # Tunnel Infinite Menu preview
│   │   │   ├── global.css                  # .viewport, .mira-section, tunnel geometry
│   │   │   └── section-layouts.css         # Section layouts FOR tunnel effect
│   │   ├── components/
│   │   │   ├── PersonalHeroSection.tsx    # Personal Hero: tunnel effect on scroll
│   │   │   ├── DynamicBackground.tsx      # Синхронизация фонов с scroll
│   │   │   ├── sections/HeroSection.tsx   # Landing Hero (target for tunnel)
│   │   │   └── preview/
│   │   │       ├── VideoInfiniteMenu.tsx   # 3D carousel tunnel menu
│   │   │       └── ReactBitsInfiniteMenuPreview.tsx
│   │   └── constants/
│   │       └── tunnelInfiniteMenuItems.ts  # Данные для tunnel menu
│   └── .env.local                         # NEXT_PUBLIC_ENABLE_ZSCROLL=true
├── apps/vk-mini/
│   └── src/components/ZScrollContainer.tsx  # ZScrollContainer, ZScrollSection, ZScrollCard
├── apps/telegram-mini/
│   └── src/components/ZScrollContainer.tsx  # Упрощённый Z-Scroll
├── apps/mobile/
│   └── src/components/ZScrollView.tsx       # ZScrollView, ZScrollItem (Reanimated)
└── packages/design-system/
    └── docs/MIGRATION_WEB_APP.md            # Сохранение Z-Scroll при миграции
```

### 2.2 Связь с Design System

Согласно `.kiro/specs/design-system-unification/`:
- **Z-Scroll** и tunnel effect **сохраняются** при унификации дизайн-системы
- Космическая эстетика + tunnel — ключевые визуальные элементы бренда

---

## 3. WEB-ПРИЛОЖЕНИЕ: Z-SCROLL TUNNEL EFFECT

### 3.1 Точка входа: `apps/web/src/app/page.tsx`

**Функция:** `initSageEastScroll()` — инициализирует весь tunnel effect на лендинге.

#### 3.1.1 Механика скролла

```typescript
// Ключевые параметры
const slides = gsap.utils.toArray('.mira-section');
const scrollPerSlide = vh * 2;  // 2× высота viewport на секцию
const totalHeight = totalSlides * scrollPerSlide;

document.body.style.height = `${totalHeight}px`;  // Искусственная высота для скролла
```

- **Viewport фиксирован** (`position: fixed`), скроллится только `body`
- Каждая секция получает **2× высоты экрана** для анимации
- **Overlap:** анимация секции N заканчивается на `(N+1.3)*scrollPerSlide` (30% перекрытие)

#### 3.1.2 Этапы анимации Hero (первая секция)

| Этап | Прогресс | Действие |
|------|----------|----------|
| **Stage 1** | 0–50% | Фон zoom 1→2.5, blur 0→30px (вход в туннель) |
| **Stage 2** | 50–70% | Лого и кнопки fade out + blur |
| **Stage 3** | 70–85% | Overlay затемняется |
| **Stage 4** | 70–98% | **Flying GIFs:** появление → freeze → полёт → blur → исчезновение |
| **Stage 5** | 98–100% | Секция полностью fade out |

**Flying GIFs** — уникальная фича: 19 видео (taro, astro, horo, natal и т.д.) появляются из текста, «замирают» на 0.15s, затем разлетаются в разные стороны с разной скоростью и blur.

#### 3.1.3 Промежуточные секции (Tarot, Astrology, …)

- **Начальное состояние:** `opacity: 0`, `scale: 0.4`, `x: ±12vw` (чётные слева, нечётные справа)
- **Вход:** zoom до 1, opacity 1, центр экрана
- **Выход:** zoom до 2.5, opacity 0 (без blur — сознательное решение)
- **Category:** появляется из центра, смещается вверх (`y: -25`)

#### 3.1.4 Shop (последняя секция) — Reverse Tunnel

- **Обратная анимация Hero:** контент появляется из blur, фон zoom out из 2.5→1.15
- Создаёт симметрию: «вход в туннель» → «выход из туннеля»

### 3.2 ScrollTrigger

```typescript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: document.body,
    start: `${startScroll}px top`,
    end: `${endScroll}px top`,
    scrub: 0.5,  // Привязка к скроллу
  }
});
```

- **Trigger:** `document.body` — единая точка привязки
- **Scrub:** анимация синхронизирована со скроллом (не авто-анимация)

### 3.3 Адаптивность

- **Desktop (≥1024px):** полный tunnel effect
- **Mobile (<1024px):** tunnel **отключён** — `global.css` переключает `.viewport` на `position: relative`, секции стекаются обычным скроллом
- **Resize:** при изменении размера окна все ScrollTrigger пересоздаются

---

## 4. DASHBOARD: PERSONAL HERO TUNNEL

### 4.1 `apps/web/src/app/dashboard/page.tsx`

**Логика:** аналогична лендингу, но:

- Первая секция — **PersonalHeroSection** (персональный Hero с данными пользователя)
- Есть **DestinyMatrixSection** (Матрица судьбы)
- **Media query:** `mqlDesktop = window.matchMedia('(min-width: 1024px)')`
- На мобильных: `cleanup()` — tunnel не инициализируется

### 4.2 Personal Hero Tunnel в `PersonalHeroSection.tsx`

```typescript
// Строки 933–985
useEffect(() => {
  const heroBgWrapper = document.querySelector('.personal-hero-bg');
  const heroBgImg = heroBgWrapper?.querySelector('.hero-bg-img');
  // ...
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: '200vh top',
      scrub: 0.5,
    },
  });
  tl.to(heroBgImg, { scale: 2.5, filter: 'blur(30px)', ... }, 0);
  tl.to(heroOverlay, { opacity: 0.95, ... }, 0);
}, []);
```

**Потенциальный конфликт:** PersonalHeroSection создаёт свой ScrollTrigger с `end: '200vh top'`, а Dashboard page создаёт свои ScrollTrigger для каждой секции. Оба используют `document.body` как trigger — возможны дублирования и конфликты при cleanup.

### 4.3 Dashboard: анимация секций

- **Personal Hero:** фон zoom + blur, overlay затемнение, fade out секции
- **Shop:** reverse — фон из blur, контент fade in
- **Остальные:** slide in/out с `x: ±12vw`, без blur

---

## 5. МОБИЛЬНЫЕ ПРИЛОЖЕНИЯ (VK-mini, Telegram-mini)

### 5.1 VK-mini: `ZScrollContainer.tsx`

**Реализация:** упрощённая, без GSAP.

- **ZScrollContainer:** индикатор прогресса скролла (полоска сверху)
- **ZScrollSection:** при скролле вычисляется `progress` (0–1) по позиции секции в viewport
  - `scale`: 0.8 → 1.0
  - `opacity`: 0 → 1
- **ZScrollCard:** обёртка с `Card` из design-system

**Отличие от Web:** нет zoom-туннеля, только scale + opacity. Эффект «приближения» при центрировании.

### 5.2 Telegram-mini: `ZScrollContainer.tsx`

- **IntersectionObserver** для видимости секций
- **Scroll progress:** `(windowHeight - sectionTop) / (windowHeight + sectionHeight)`
- **Transform:** `translateY`, `translateX` (zig-zag), `scale`
- **Alternate positioning:** чётные секции `-20→0`, нечётные `20→0` по X

Ближе к «туннелю» за счёт zig-zag и scale.

---

## 6. MOBILE (React Native)

### 6.1 `apps/mobile/src/components/ZScrollView.tsx`

**Технология:** React Native Reanimated.

```typescript
// ZScrollItem — интерполяция по scrollY
const scale = interpolate(scrollY.value, inputRange, [0.8, 1, 0.8], Extrapolate.CLAMP);
const opacity = interpolate(scrollY.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);
const translateX = interpolate(scrollY.value, inputRange,
  index % 2 === 0 ? [-50, 0, 50] : [50, 0, -50], Extrapolate.CLAMP);
```

- **Scale:** 0.8 → 1 → 0.8 при прохождении секции
- **Opacity:** 0.3 → 1 → 0.3
- **Zig-zag:** чётные [-50, 0, 50], нечётные [50, 0, -50] по X
- **Snap:** `snapToInterval={itemHeight}` — по одной секции за раз

Нативный tunnel-like эффект без blur (Reanimated не поддерживает blur напрямую).

---

## 7. TUNNEL INFINITE MENU

### 7.1 Концепция

**Tunnel Infinite Menu** — 3D карусель с элементами, расположенными по окружности. При вращении создаётся эффект «туннеля» из карточек.

### 7.2 Файлы

- `tunnelInfiniteMenuItems.ts` — 19 пунктов (Таро, Астрология, Гороскоп, …) с `image`, `video`, `href`
- `VideoInfiniteMenu.tsx` — 3D carousel с `rotation`, `radius`, depth через `Math.cos(index * angleStep + rotation)`
- `ReactBitsInfiniteMenuPreview.tsx` — превью с теми же items
- `dashboard2-preview/page.tsx` — страница превью

### 7.3 Механика VideoInfiniteMenu

- **Rotation:** `requestAnimationFrame` + `BASE_ROTATION_SPEED`
- **Depth:** `Math.cos(index * angleStep + rotation)` — кто «впереди»
- **Wheel/drag:** управление скоростью вращения
- **Selected item:** элемент с максимальным depth

Это отдельный «туннель» — не scroll-based, а rotation-based.

---

## 8. CSS И LAYOUT ДЛЯ TUNNEL EFFECT

### 8.1 `global.css`

```css
/* Fixed Viewport for Z-Scroll */
.viewport {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  overflow: hidden;
  perspective: 1000px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Z-Scroll Sections */
.mira-section {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100vh;
  opacity: 0;
  will-change: transform, opacity, filter;
  pointer-events: none;
}

.mira-section.active {
  pointer-events: auto;
}

/* Hero: tunnel geometry + local scroll */
.mira-section.mira-hero {
  align-items: flex-start !important;
  overflow-y: auto;
  overscroll-behavior-y: contain;
}

/* Mobile: disable tunnel */
@media (max-width: 1023px) {
  .viewport {
    position: relative;
    height: auto;
    overflow: visible;
    perspective: none;
  }
  .mira-section {
    position: relative;
    opacity: 1 !important;
    pointer-events: auto;
  }
}
```

**Ключевое:** `perspective: 1000px` создаёт 3D-контекст для transform. На мобильных perspective сбрасывается.

### 8.2 `section-layouts.css`

Варианты layout для секций внутри tunnel:

- `section-layout-split` — текст слева, медиа справа
- `section-layout-split-reverse` — зеркально
- `section-layout-overlay` — текст поверх медиа
- `section-layout-vertical` — текст сверху, медиа снизу
- `section-layout-asymmetric`, `section-layout-framed`, `section-layout-diagonal`
- `section-layout-split-modern` — с карточками и акцентами

Секции используют эти layout'ы, tunnel effect применяется к `.mira-section` поверх них.

---

## 9. ДИНАМИЧЕСКИЕ ФОНЫ И СИНХРОНИЗАЦИЯ

### 9.1 `DynamicBackground.tsx`

**Назначение:** переключение фоновых видео (GIF/WebM) в зависимости от активной секции.

```typescript
// Синхронизация с scroll math из page.tsx
const scrollPerSlide = window.innerHeight * 2;

ScrollTrigger.create({
  trigger: document.body,
  start: `${index * scrollPerSlide}px top`,
  end: `${(index + 1) * scrollPerSlide}px top`,
  onEnter: () => { video.play(); gsap.to(video, { opacity: 1, ... }); },
  onLeave: () => { video.pause(); gsap.to(video, { opacity: 0, ... }); },
  // ...
});
```

- Каждая секция имеет свой фон (taro.webm, astro.webm, …)
- При входе секции в viewport — play + fade in
- При выходе — pause + fade out

**Важно:** `scrollPerSlide` должен совпадать с `page.tsx` и `dashboard/page.tsx`, иначе рассинхрон.

### 9.2 Landing vs Dashboard — разные массивы фонов

- **Landing:** `backgroundImages` с `.webm` (экономия трафика)
- **Dashboard:** `backgroundImages` с `.gif`
- Разная длина массивов (Dashboard включает Destiny Matrix)

---

## 10. КОНФИГУРАЦИЯ И FEATURE FLAGS

### 10.1 `config/index.ts`

```typescript
features: {
  enableZScroll: process.env.NEXT_PUBLIC_ENABLE_ZSCROLL === 'true',
  // ...
}
```

### 10.2 Использование

- В `page.tsx` и `dashboard/page.tsx` **нет проверки** `config.features.enableZScroll` — tunnel всегда инициализируется при наличии DOM
- Переменная задаётся в `.env.local`: `NEXT_PUBLIC_ENABLE_ZSCROLL=true`
- Kill switch не используется в коде — только в документации миграции

---

## 11. ПРОБЛЕМЫ И РЕКОМЕНДАЦИИ

### 11.1 Критические

| # | Проблема | Файл | Рекомендация |
|---|----------|------|--------------|
| 1 | **Дублирование ScrollTrigger** | PersonalHeroSection + dashboard/page | Personal Hero tunnel должен управляться только из dashboard page; убрать отдельный useEffect из PersonalHeroSection |
| 2 | **Cleanup ScrollTrigger** | dashboard/page.tsx | `cleanup()` убивает триггеры по `trigger === document.body`, но не все триггеры создаются с этим условием — нужна более надёжная очистка |
| 3 | **Рассинхрон scroll math** | page.tsx, dashboard, DynamicBackground | Вынести `scrollPerSlide`, `totalHeight` в общий модуль/константы |

### 11.2 Важные

| # | Проблема | Рекомендация |
|---|----------|--------------|
| 4 | **enableZScroll не используется** | Добавить проверку `config.features.enableZScroll` перед `initSageEastScroll` |
| 5 | **Разные форматы фонов** (webm vs gif) | Унифицировать: webm для всех, или конфигурировать по окружению |
| 6 | **PersonalHeroSection tunnel при mobile** | На мобильных tunnel отключён в dashboard, но useEffect в PersonalHeroSection всё равно создаёт ScrollTrigger — добавить media query check |
| 7 | **Flying GIFs — тяжёлая анимация** | 19 видео создаются в DOM при каждом scroll; рассмотреть lazy creation или ограничение количества |

### 11.3 Средние

| # | Проблема | Рекомендация |
|---|----------|--------------|
| 8 | **Дублирование логики** | Landing и Dashboard содержат ~80% одинаковой логики initSageEastScroll — вынести в `useZScrollTunnel()` hook |
| 9 | **Z-Scroll в mini-apps** | VK и Telegram реализуют разный уровень «туннеля» — документировать ожидаемое поведение |
| 10 | **Section layouts** | `section-layouts.css` — 650+ строк; часть правил может конфликтовать с tunnel transform |

### 11.4 Рекомендуемая архитектура

```
hooks/
  useZScrollTunnel.ts      # Общая логика: scroll math, ScrollTrigger setup, cleanup
  useTunnelSection.ts      # Анимация одной секции (Hero/Shop/Other)

utils/
  tunnelScrollMath.ts      # scrollPerSlide, totalHeight, getSectionRange(index)

components/
  TunnelViewport.tsx       # Обёртка .viewport с контекстом
  TunnelSection.tsx       # Обёртка .mira-section с data-атрибутами для анимации
```

### 11.5 Статус реализации (14 февраля 2026)

| # | Статус | Примечание |
|---|--------|------------|
| 1 | **fixed** | Дублирующий Hero tunnel `useEffect` удалён из `PersonalHeroSection.tsx` и `PersonalHeroSection/index.tsx` |
| 2 | **fixed** | Cleanup переведён на scoped-реестры (`createdTriggers`, `createdTimelines`) в `useZScrollTunnel` |
| 3 | **fixed** | Scroll math вынесен в `utils/tunnelScrollMath.ts` и подключён в Landing/Dashboard/DynamicBackground/SectionNavigationMenu |
| 4 | **fixed** | `enableZScroll` реально участвует в инициализации tunnel через `useZScrollTunnel` |
| 5 | **fixed** | Tunnel media переведён на `webm+mp4` (`constants/tunnelMedia.ts`, `DynamicBackground`) |
| 6 | **fixed** | Mobile режим управляется флагами (`enableZScrollMobile`, `zScrollDesktopMinWidth`) без скрытой инициализации |
| 7 | **fixed** | Добавлен lite-mode и бюджет flying videos (`utils/tunnelPerf.ts`) |
| 8 | **fixed** | Оркестрация вынесена в `hooks/useZScrollTunnel.ts`, page-level анимации — в `app/tunnel/*Animations.ts` |
| 9 | **fixed** | Добавлен mini-app контракт: `docs/zscroll-miniapps-contract.md` |
| 10 | **fixed** | Добавлена изоляция tunnel-рендера (`body.zscroll-enabled`, `contain`, `will-change`, `backface-visibility`) для снижения конфликтов `section-layouts.css` с transform-анимациями |

---

## 📈 МЕТРИКИ

| Метрика | Landing | Dashboard | VK-mini | Telegram-mini | Mobile |
|---------|---------|-----------|---------|---------------|--------|
| Секций | 21 | 22 | 5 | 5 | ~6 |
| ScrollTrigger | ~25+ | ~25+ | 0 | 0 | 0 |
| GSAP | Да | Да | Нет | Нет | Нет |
| Blur | Да | Да | Нет | Нет | Нет |
| Flying GIFs | Да | Нет | Нет | Нет | Нет |
| Mobile tunnel | Нет | Нет | Упрощён | Упрощён | Reanimated |

---

## ✅ ЗАКЛЮЧЕНИЕ

**Tunnel Effect** в Mirastros — центральный визуальный элемент, реализованный на **Web** через GSAP + ScrollTrigger с полноценным zoom/blur/flying GIFs, на **mini-apps** — упрощёнными scale/opacity/zig-zag, на **Mobile** — через Reanimated.

Основные зоны улучшения:
1. Устранение дублирования и конфликтов ScrollTrigger
2. Вынос общей логики в хуки и утилиты
3. Использование feature flag `enableZScroll`
4. Унификация форматов фонов и scroll math

---

**Отчёт подготовлен:** AI Assistant  
**Дата:** 14 февраля 2026  
**Версия:** 1.0
