# 🎨 HEROPANEL UX/UI IMPROVEMENTS - СПЕЦИФИКАЦИЯ V3 (ФИНАЛЬНАЯ)

**Цель:** Довести HeroPanel до 100% по UX/UI дизайну  
**Приоритет:** Практичные улучшения с правильной реализацией  
**Дата:** 8 февраля 2026  
**Версия:** 3.0 (финальная после детального code review)

---

## 📊 ИСПРАВЛЕНИЯ V3

### Что исправлено относительно V2:

1. **Toast notifications** - правильная обработка ошибок с накоплением
2. **Swipe/Keyboard** - использование availableByDensity вместо фиксированного массива
3. **Roving focus** - добавлен перенос фокуса на активную вкладку
4. **ARIA семантика** - aria-expanded вместо полноценных tabs (проще для accordion)
5. **CSS классы** - указаны конкретные места применения в JSX
6. **NatalChartBlock рефакторинг** - отмечен как полноценный mini-refactor

---

## 🎯 ПЛАН УЛУЧШЕНИЙ

### ФАЗА 1: МИКРОИНТЕРАКТИВНОСТЬ (Priority: HIGH)

#### 1.1 Enhanced Hover States

**Решение:**
```css
/* ДОБАВИТЬ в конец apps/web/src/app/global.css */
.mira-card-hover-enhanced {
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0.2, 1);
}

.mira-card-hover-enhanced::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    135deg,
    rgba(212, 175, 55, 0.3),
    rgba(190, 143, 68, 0.2),
    transparent
  );
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.4s;
  z-index: -1;
  filter: blur(8px);
}

.mira-card-hover-enhanced:hover::before {
  opacity: 1;
}

.mira-card-hover-enhanced:hover {
  transform: translateY(-6px) scale(1.01);
}
```

**Применение в JSX:**
```typescript
// PersonalHeroSection.tsx line ~1398
<div className="hero-card mira-card mira-card-hover mira-card-hover-enhanced ...">

// CompactHoroscopeBlock.tsx line ~102
<div className="hero-card hero-panel-card hero-horoscope-card mira-card mira-card-hover mira-card-hover-enhanced ...">
```

---

#### 1.2 Focus States

```css
/* ДОБАВИТЬ в конец apps/web/src/app/global.css */
.mira-card:focus-visible,
.mira-button:focus-visible {
  outline: 2px solid rgba(212, 175, 55, 0.8);
  outline-offset: 4px;
  box-shadow: 
    0 0 0 4px rgba(212, 175, 55, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.4);
}

button:focus-visible,
a:focus-visible,
[role="button"]:focus-visible {
  outline: 2px solid var(--cosmic-gold);
  outline-offset: 2px;
}
```

---

### ФАЗА 2: МОБИЛЬНАЯ ОПТИМИЗАЦИЯ (Priority: HIGH)

#### 2.1 Touch Targets

```css
/* ДОБАВИТЬ в конец apps/web/src/app/global.css */
@media (max-width: 768px) {
  /* Только для accordion кнопок, не трогаем .mira-button */
  .hero-horoscope-period > button {
    min-height: 44px;
    padding: 12px 16px;
  }
}
```

---

#### 2.2 Swipe Gestures (ПРАВИЛЬНО)

```typescript
// CompactHoroscopeBlock.tsx
import { useSwipeable } from 'react-swipeable';

export const CompactHoroscopeBlock: React.FC<Props> = ({ ... }) => {
  // ИСПОЛЬЗОВАТЬ availableByDensity, НЕ фиксированный массив!
  const availableByDensity: Array<'daily' | 'weekly' | 'monthly'> =
    density === 'comfort'
      ? ['daily', 'weekly', 'monthly']
      : density === 'compact'
      ? ['daily', 'weekly', 'monthly']
      : ['daily'];

  const currentIndex = availableByDensity.indexOf(expandedPeriod);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      // Следующий ДОСТУПНЫЙ период
      const nextIndex = (currentIndex + 1) % availableByDensity.length;
      setExpandedPeriod(availableByDensity[nextIndex]);
    },
    onSwipedRight: () => {
      // Предыдущий ДОСТУПНЫЙ период
      const prevIndex = (currentIndex - 1 + availableByDensity.length) % availableByDensity.length;
      setExpandedPeriod(availableByDensity[prevIndex]);
    },
    trackMouse: false,
    trackTouch: true,
  });

  return (
    <div {...handlers} className="hero-horoscope-card ...">
      {/* content */}
    </div>
  );
};
```

---

### ФАЗА 3: ACCESSIBILITY (Priority: HIGH)

#### 3.1 Keyboard Navigation + Roving Focus (ПРАВИЛЬНО)

```typescript
// CompactHoroscopeBlock.tsx
const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

const handleKeyDown = (e: React.KeyboardEvent, period: 'daily' | 'weekly' | 'monthly') => {
  const currentIndex = availableByDensity.indexOf(period);

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % availableByDensity.length;
      const nextPeriod = availableByDensity[nextIndex];
      setExpandedPeriod(nextPeriod);
      // ROVING FOCUS: перенос фокуса
      buttonRefs.current[nextPeriod]?.focus();
      break;

    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + availableByDensity.length) % availableByDensity.length;
      const prevPeriod = availableByDensity[prevIndex];
      setExpandedPeriod(prevPeriod);
      // ROVING FOCUS: перенос фокуса
      buttonRefs.current[prevPeriod]?.focus();
      break;

    case 'Home':
      e.preventDefault();
      const firstPeriod = availableByDensity[0];
      setExpandedPeriod(firstPeriod);
      buttonRefs.current[firstPeriod]?.focus();
      break;

    case 'End':
      e.preventDefault();
      const lastPeriod = availableByDensity[availableByDensity.length - 1];
      setExpandedPeriod(lastPeriod);
      buttonRefs.current[lastPeriod]?.focus();
      break;
  }
};
```

---

#### 3.2 ARIA для Accordion (ПРАВИЛЬНО)

```typescript
// CompactHoroscopeBlock.tsx
// ИСПОЛЬЗОВАТЬ aria-expanded, НЕ полноценные tabs
{availableByDensity.map((period) => {
  const isExpanded = expandedPeriod === period;
  
  return (
    <div key={period} data-period={period}>
      <button
        ref={(el) => { buttonRefs.current[period] = el; }}
        onClick={() => {
          if (lockedByTier) return;
          if (isAvailable) {
            setExpandedPeriod(isExpanded && period !== 'daily' ? 'daily' : period);
          }
        }}
        onKeyDown={(e) => handleKeyDown(e, period)}
        aria-expanded={isExpanded}
        aria-controls={`horoscope-content-${period}`}
        aria-label={`${label.name} гороскоп${periodLabel ? `, ${periodLabel}` : ''}`}
        disabled={!isAvailable && !lockedByTier}
      >
        {/* button content */}
      </button>

      {isAvailable && horoscope && (
        <div
          id={`horoscope-content-${period}`}
          ref={(el) => { contentRefs.current[period] = el; }}
          aria-hidden={!isExpanded}
        >
          {/* content */}
        </div>
      )}
    </div>
  );
})}
```

---

#### 3.3 Screen Reader Support

```css
/* ДОБАВИТЬ в конец apps/web/src/app/global.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```typescript
// PersonalHeroSection.tsx
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {loading ? 'Загрузка данных панели управления' : ''}
</div>
```

---

### ФАЗА 4: LOADING STATES (Priority: MEDIUM)

#### 4.1 Skeleton Screens

```typescript
// apps/web/src/components/SkeletonCard.tsx
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`mira-card p-5 ${className || ''}`}>
      <div className="animate-pulse space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded" />
          <div className="h-3 bg-white/10 rounded w-5/6" />
          <div className="h-3 bg-white/10 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
};
```

---

### ФАЗА 5: ERROR FEEDBACK (Priority: MEDIUM)

#### 5.1 Toast Notifications (ПРАВИЛЬНО)

```typescript
// PersonalHeroSection.tsx
import toast, { Toaster } from 'react-hot-toast';

const loadData = async () => {
  setLoading(true);
  const promises: Promise<void>[] = [];
  const errors: string[] = []; // НАКОПЛЕНИЕ ошибок

  // Natal chart
  if (isPremium) {
    const cacheKey = `natal_${user.id || 'curr'}`;
    const cached = getCachedData<NatalChart>(cacheKey);
    if (cached) {
      setNatalChart(cached);
    } else {
      promises.push(
        api.getNatalChart()
          .then((chart) => {
            setNatalChart(chart);
            if (chart) setCachedData(cacheKey, chart);
          })
          .catch((err) => {
            console.error('Failed to load natal chart:', err);
            errors.push('натальную карту'); // ДОБАВИТЬ в массив
          })
      );
    }
  }

  // Horoscopes
  if (zodiacSign) {
    const now = new Date();
    const dailyKey = `horoscope_daily_${zodiacSign}_${formatIsoDate(now)}`;
    const cachedDaily = getCachedData<Horoscope>(dailyKey);
    
    if (cachedDaily) {
      setHoroscopes((prev) => ({ ...prev, daily: cachedDaily }));
    } else {
      setRatingsLoading(true);
      promises.push(
        api.getHoroscope(zodiacSign, 'daily')
          .then((daily) => {
            setHoroscopes((prev) => ({ ...prev, daily }));
            if (daily) setCachedData(dailyKey, daily);
          })
          .catch((err) => {
            console.error('Failed to load daily horoscope:', err);
            errors.push('гороскоп'); // ДОБАВИТЬ в массив
          })
          .finally(() => setRatingsLoading(false))
      );
    }
  }

  // ... остальные запросы аналогично

  try {
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  } finally {
    setLoading(false);
    
    // ПОКАЗАТЬ ОДИН TOAST в конце, если были ошибки
    if (errors.length > 0) {
      const errorMessage = errors.length === 1
        ? `Не удалось загрузить ${errors[0]}`
        : `Не удалось загрузить: ${errors.join(', ')}`;
      
      toast.error(errorMessage, {
        icon: '⚠️',
        duration: 5000,
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
        },
      });
    }
  }
};
```

```typescript
// В layout или PersonalHeroSection
<Toaster 
  position="top-right"
  toastOptions={{
    style: {
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
    },
  }}
/>
```

---

### ФАЗА 6: РЕФАКТОРИНГ (Priority: LOW)

#### 6.1 Вынос NatalChartBlock (ПОЛНОЦЕННЫЙ MINI-REFACTOR)

**Внимание:** Это НЕ быстрая задача! Компонент зависит от helper-функций.

**Шаги:**

1. Создать `apps/web/src/components/NatalChartBlock.tsx`
2. Перенести helper-функции из PersonalHeroSection.tsx:
   - `getElementFromSign` (line ~1443)
   - `calculateElements`
   - `calculateModalities`
   - `getAscendantRuler`
   - `getRetrogradePlanets`
   - `getDominantPlanet`
   - `signToNum`

3. Перенести компонент NatalChartBlock (line ~1634)
4. Добавить React.memo

```typescript
// apps/web/src/components/NatalChartBlock.tsx
import React from 'react';
import type { NatalChart, User } from '../types';
import type { HeroDensity } from './hero/heroDensity';

// Helper functions
const signToNum = (sign: string): number => { /* ... */ };
const getElementFromSign = (sign: string): string => { /* ... */ };
const calculateElements = (planets: NatalChart['planets']) => { /* ... */ };
// ... остальные helpers

interface NatalChartBlockProps {
  natalChart: NatalChart | null;
  user: User;
  loading: boolean;
  density: HeroDensity;
  onViewFull: () => void;
}

export const NatalChartBlock = React.memo<NatalChartBlockProps>(
  ({ natalChart, user, loading, density, onViewFull }) => {
    // Компонент код
  },
  (prevProps, nextProps) => {
    return (
      prevProps.natalChart === nextProps.natalChart &&
      prevProps.loading === nextProps.loading &&
      prevProps.density === nextProps.density
    );
  }
);
```

**Время:** 2-3 часа (не "быстрая задача")

---

## 📋 IMPLEMENTATION ROADMAP

### День 1: Микроинтерактивность + Мобильная
- [ ] Enhanced hover states в global.css
- [ ] Применить .mira-card-hover-enhanced в JSX
- [ ] Focus states в global.css
- [ ] Touch targets для accordion
- [ ] Swipe gestures с availableByDensity

### День 2: Accessibility
- [ ] Keyboard navigation с roving focus
- [ ] ARIA aria-expanded для accordion
- [ ] sr-only класс
- [ ] aria-live для loading

### День 3: Loading + Error
- [ ] SkeletonCard компонент
- [ ] Skeleton в PersonalHeroSection
- [ ] Toast с накоплением ошибок

### День 4: Рефакторинг (опционально)
- [ ] Вынести helpers из PersonalHeroSection
- [ ] Создать NatalChartBlock.tsx
- [ ] React.memo

**Время:** 3-4 дня

---

## 📦 ЗАВИСИМОСТИ

```bash
npm install react-hot-toast react-swipeable
```

---

## 🔧 ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

1. **global.css**
   - Enhanced hover (.mira-card-hover-enhanced)
   - Focus states
   - Touch targets
   - sr-only

2. **CompactHoroscopeBlock.tsx**
   - Swipe с availableByDensity
   - Keyboard + roving focus
   - ARIA aria-expanded
   - buttonRefs для фокуса

3. **PersonalHeroSection.tsx**
   - Toast с накоплением ошибок
   - aria-live
   - Применить .mira-card-hover-enhanced
   - SkeletonCard

4. **SkeletonCard.tsx** (новый)

5. **NatalChartBlock.tsx** (опционально, mini-refactor)

---

## ✅ ЧЕКЛИСТ

### День 1
- [ ] .mira-card-hover-enhanced в global.css
- [ ] Применить в PersonalHeroSection line ~1398
- [ ] Применить в CompactHoroscopeBlock line ~102
- [ ] Focus states в global.css
- [ ] Touch targets в global.css
- [ ] Swipe с availableByDensity

### День 2
- [ ] buttonRefs в CompactHoroscopeBlock
- [ ] handleKeyDown с roving focus
- [ ] aria-expanded на кнопках
- [ ] aria-controls + id на контенте
- [ ] sr-only в global.css
- [ ] aria-live в PersonalHeroSection

### День 3
- [ ] SkeletonCard.tsx
- [ ] errors: string[] массив
- [ ] Накопление ошибок в catch
- [ ] Один toast в finally
- [ ] Toaster в layout

### День 4
- [ ] Вынести helpers
- [ ] NatalChartBlock.tsx
- [ ] React.memo

---

## ⚠️ КРИТИЧЕСКИЕ МОМЕНТЫ

1. **Swipe/Keyboard:** ТОЛЬКО availableByDensity, НЕ фиксированный массив
2. **Roving focus:** buttonRefs.current[period]?.focus()
3. **ARIA:** aria-expanded для accordion, НЕ полноценные tabs
4. **Toast:** Накопление ошибок, один toast в конце
5. **CSS классы:** Указаны конкретные строки для применения
6. **NatalChartBlock:** Полноценный refactor, не быстрая задача

---

## 🎯 ЗАКЛЮЧЕНИЕ

V3 - финальная версия с правильными решениями:

**Исправлено:**
- Toast с накоплением ошибок
- Swipe/Keyboard с availableByDensity
- Roving focus для keyboard UX
- aria-expanded вместо tabs
- Конкретные места применения CSS
- NatalChartBlock как mini-refactor

**Время:** 3-4 дня  
**Риск:** Минимальный  
**Качество:** Профессиональное

---

**Версия:** 3.0 (финальная)  
**Дата:** 8 февраля 2026  
**Автор:** Kiro AI
