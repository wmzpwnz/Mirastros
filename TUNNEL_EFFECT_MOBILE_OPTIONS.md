# 🚀 Варианты реализации Tunnel Effect на мобильных и во всех приложениях

**Дата:** 14 февраля 2026  
**Цель:** Единый tunnel effect на Web (mobile), VK-mini, Telegram-mini, Mobile (React Native)

---

## 📋 Содержание

1. [Общая стратегия](#1-общая-стратегия)
2. [Web на мобильных (браузер)](#2-web-на-мобильных-браузер)
3. [VK-mini и Telegram-mini](#3-vk-mini-и-telegram-mini)
4. [Mobile (React Native)](#4-mobile-react-native)
5. [Общий пакет shared-core](#5-общий-пакет-shared-core)
6. [Сравнительная таблица](#6-сравнительная-таблица)
7. [Рекомендуемый план внедрения](#7-рекомендуемый-план-внедрения)

---

## 1. ОБЩАЯ СТРАТЕГИЯ

### Принцип: «Адаптивная интенсивность»

| Уровень | Платформа | Scale | Blur | Flying GIFs | Секций |
|---------|----------|-------|------|-------------|--------|
| **Full** | Desktop Web | 0.4→2.5 | Да | Да | 21 |
| **Medium** | Web mobile, планшеты | 0.5→1.8 | Лёгкий | Нет/упрощён | 21 |
| **Light** | VK/Telegram mini | 0.7→1.2 | Нет | Нет | 5–10 |
| **Micro** | React Native | 0.8→1.2 | Нет | Нет | 5–6 |

---

## 2. WEB НА МОБИЛЬНЫХ (браузер)

Сейчас: tunnel **отключён** при `max-width: 1023px`.

### Вариант A: «Lite Tunnel» (рекомендуется для старта)

**Идея:** Включить tunnel на мобильных, но с облегчёнными параметрами.

| Параметр | Desktop | Mobile Lite |
|----------|---------|-------------|
| `scrollPerSlide` | vh × 2 | vh × 1.5 |
| Scale секций | 0.4 → 1 → 2.5 | 0.6 → 1 → 1.8 |
| Blur | 0–30px | 0–12px (или отключить) |
| Flying GIFs | 19 видео | **Отключить** или 3–5 статичных картинок |
| `will-change` | transform, opacity, filter | transform, opacity |

**Изменения:**
1. Убрать/условить `@media (max-width: 1023px)` в `global.css` — не отключать tunnel полностью.
2. В `page.tsx` и `dashboard/page.tsx` — детект `isMobile`, передавать в `initSageEastScroll({ mobile: true })`.
3. В `initSageEastScroll` — ветка для mobile: другие scale/blur, без flying GIFs.
4. Добавить `overflow: hidden` на viewport для мобильных, чтобы избежать clipping.

**Плюсы:** Быстро, мало рисков.  
**Минусы:** Визуально проще, чем на desktop.

---

### Вариант B: «Full Tunnel с оптимизацией»

**Идея:** Полный tunnel на мобильных, но с оптимизациями.

- **Lazy Flying GIFs:** создавать только 5–7 видео, когда секция Hero в зоне видимости.
- **Blur через CSS:** `backdrop-filter` вместо `filter` на отдельных элементах (если поддерживается).
- **Reduce motion:** проверка `prefers-reduced-motion`, отключение для accessibility.
- **Intersection Observer:** не создавать GSAP анимации для секций далеко от viewport (виртуализация анимаций).

**Плюсы:** Максимальная визуальная близость к desktop.  
**Минусы:** Сложнее, выше риск лагов на слабых устройствах.

---

### Вариант C: «Гибрид — tunnel только на планшетах»

**Идея:** Оставить отключение на телефонах (<768px), включить Lite Tunnel на планшетах (768–1023px).

```css
/* Телефоны: без tunnel */
@media (max-width: 767px) { ... }

/* Планшеты: lite tunnel */
@media (min-width: 768px) and (max-width: 1023px) {
  .viewport { /* tunnel layout */ }
}
```

**Плюсы:** Баланс UX и производительности.  
**Минусы:** Разное поведение на телефоне и планшете.

---

## 3. VK-MINI И TELEGRAM-MINI

Сейчас: упрощённый Z-Scroll (scale + opacity, zig-zag).

### Вариант A: «Усиленный Z-Scroll» (рекомендуется)

**Идея:** Улучшить текущий ZScrollContainer без GSAP.

**Изменения в `ZScrollContainer.tsx`:**

1. **Scale:** 0.7 → 1 → 0.7 (вместо 0.8 → 1 → 0.8).
2. **Perspective:** добавить `perspective: 1000px` на контейнер.
3. **translateZ:** симулировать глубину через `transform: translateZ()` (если поддерживается).
4. **Плавность:** `transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
5. **Единый breakpoint:** одинаковое поведение в VK и Telegram.

**Псевдокод:**
```tsx
// При scroll progress 0..1 для секции
const scale = 0.7 + progress * 0.3;           // 0.7 → 1
const translateZ = (1 - progress) * -100;       // «глубина» туннеля
const opacity = Math.min(1, progress * 1.2);
```

**Плюсы:** Без новых зависимостей, стабильно на мобильном webview.  
**Минусы:** Нет blur, визуально проще desktop.

---

### Вариант B: «GSAP в mini-apps»

**Идея:** Подключить GSAP + ScrollTrigger в VK/Telegram.

- Плюсы: Один и тот же tunnel, что и на web.
- Минусы: +~50KB gzip, возможные проблемы в webview (touch, scroll).

**Рекомендация:** Не использовать на первом этапе.

---

### Вариант C: «CSS Scroll-Driven Animations»

**Идея:** Использовать `animation-timeline: scroll()` (новый стандарт).

```css
@supports (animation-timeline: scroll()) {
  .tunnel-section {
    animation: tunnel-zoom linear;
    animation-timeline: scroll();
  }
}
```

- Плюсы: Нативный CSS, без JS.
- Минусы: Поддержка пока ограничена (Chrome 115+, не везде в webview).

**Рекомендация:** Добавить как progressive enhancement позже.

---

## 4. MOBILE (React Native)

Сейчас: ZScrollView с scale 0.8→1, zig-zag, opacity.

### Вариант A: «Усиленный Z-Scroll» (рекомендуется)

**Идея:** Увеличить «туннельность» без blur.

**Изменения в `ZScrollView.tsx`:**

1. **Scale:** 0.6 → 1 → 0.6 (больше диапазон).
2. **Z-эффект:** добавить лёгкий `translateY` при входе/выходе (имитация глубины).
3. **Opacity:** 0.2 → 1 → 0.2 (сильнее fade).
4. **Easing:** `Easing.bezier(0.25, 0.46, 0.45, 0.94)` для плавности.

```tsx
const scale = interpolate(scrollY.value, inputRange, [0.6, 1, 0.6], Extrapolate.CLAMP);
const opacity = interpolate(scrollY.value, inputRange, [0.2, 1, 0.2], Extrapolate.CLAMP);
const translateY = interpolate(scrollY.value, inputRange, [30, 0, -30], Extrapolate.CLAMP);
```

**Плюсы:** Быстро, без новых зависимостей.  
**Минусы:** Blur в RN сложнее.

---

### Вариант B: «Blur через expo-blur»

**Идея:** Добавить размытие при удалении от центра.

```tsx
import { BlurView } from 'expo-blur';

// Обёртка секции: при scale < 0.9 показывать BlurView поверх
{scale < 0.9 && (
  <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
)}
```

- Плюсы: Реальный blur.
- Минусы: Доп. зависимость, возможные артефакты на Android.

---

### Вариант C: «Reanimated Layout Animations»

**Идея:** Использовать `Layout` из Reanimated для анимаций при появлении.

- Плюсы: Декларативно, плавно.
- Минусы: Не даёт scroll-based tunnel сам по себе, нужна комбинация с текущим ZScrollView.

---

## 5. ОБЩИЙ ПАКЕТ SHARED-CORE

**Идея:** Вынести общую логику tunnel в `packages/shared-core`.

### Структура

```
packages/shared-core/src/
├── tunnel/
│   ├── constants.ts       # TUNNEL_SCALE_MOBILE, TUNNEL_SCALE_DESKTOP, etc.
│   ├── types.ts           # TunnelConfig, TunnelPreset
│   └── presets.ts         # presets: { desktop, mobile, mini, native }
```

### Конфиг-пресеты

```typescript
export const TUNNEL_PRESETS = {
  desktop: {
    scaleIn: 0.4,
    scaleOut: 2.5,
    blurMax: 30,
    flyingGifs: true,
    scrollPerSlideMultiplier: 2,
  },
  mobile: {
    scaleIn: 0.6,
    scaleOut: 1.8,
    blurMax: 12,
    flyingGifs: false,
    scrollPerSlideMultiplier: 1.5,
  },
  mini: {
    scaleIn: 0.7,
    scaleOut: 1.2,
    blurMax: 0,
    flyingGifs: false,
  },
  native: {
    scaleIn: 0.6,
    scaleOut: 1,
    opacityMin: 0.2,
  },
} as const;
```

Каждое приложение импортирует пресет и применяет его в своей реализации.

---

## 6. СРАВНИТЕЛЬНАЯ ТАБЛИЦА

| Вариант | Сложность | Время | Риск | Визуал | Рекомендация |
|---------|-----------|-------|------|--------|--------------|
| **Web A: Lite Tunnel** | Низкая | 1–2 дня | Низкий | ★★★☆☆ | ✅ Старт |
| **Web B: Full + оптимизация** | Высокая | 1–2 нед | Средний | ★★★★★ | Фаза 2 |
| **Web C: Только планшеты** | Низкая | 0.5 дня | Низкий | ★★★☆☆ | Альтернатива A |
| **Mini A: Усиленный Z-Scroll** | Низкая | 1 день | Низкий | ★★★★☆ | ✅ |
| **Mini B: GSAP** | Средняя | 2–3 дня | Средний | ★★★★★ | Не рекоменд. |
| **Native A: Усиленный Z-Scroll** | Низкая | 0.5 дня | Низкий | ★★★★☆ | ✅ |
| **Native B: + BlurView** | Средняя | 1 день | Средний | ★★★★★ | Опционально |
| **Shared-core presets** | Средняя | 1 день | Низкий | — | ✅ Параллельно |

---

## 7. РЕКОМЕНДУЕМЫЙ ПЛАН ВНЕДРЕНИЯ

### Фаза 1: «Быстрые победы» (3–5 дней)

1. **Web mobile — Lite Tunnel**
   - Условный `initSageEastScroll({ mobile })` с облегчёнными параметрами.
   - Отключить flying GIFs на mobile.
   - Смягчить или убрать blur на mobile.

2. **VK-mini и Telegram-mini**
   - Усилить ZScrollSection: scale 0.7→1, добавить perspective.
   - Унифицировать логику между VK и Telegram.

3. **Mobile (React Native)**
   - Расширить scale в ZScrollItem: 0.6→1→0.6.
   - Усилить opacity и добавить translateY.

### Фаза 2: «Унификация» (1–2 недели)

4. **Shared-core presets**
   - Вынести константы tunnel в `packages/shared-core`.
   - Все приложения используют пресеты.

5. **Web mobile — опциональный Full**
   - Lazy flying GIFs (3–5 шт).
   - Лёгкий blur при хорошей производительности.

### Фаза 3: «Полировка» (по необходимости)

6. **React Native — BlurView**
   - Добавить expo-blur для секций вне центра.

7. **CSS Scroll-Driven Animations**
   - Progressive enhancement для современных браузеров.

---

## 📎 Чек-лист для реализации

- [ ] Создать `utils/tunnelScrollMath.ts` с общими константами
- [ ] Добавить `isMobile` / `useTunnelPreset()` в web
- [ ] Модифицировать `initSageEastScroll` для mobile preset
- [ ] Обновить `global.css`: условный tunnel вместо полного отключения
- [ ] Усилить ZScrollSection в VK-mini и Telegram-mini
- [ ] Усилить ZScrollItem в mobile (React Native)
- [ ] Добавить TUNNEL_PRESETS в shared-core
- [ ] Тесты на реальных устройствах (iOS Safari, Android Chrome, VK/Telegram webview)

---

**Документ подготовлен:** AI Assistant  
**Версия:** 1.0
