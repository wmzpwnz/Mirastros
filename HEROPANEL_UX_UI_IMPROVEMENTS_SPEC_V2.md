# 🎨 HEROPANEL UX/UI IMPROVEMENTS - СПЕЦИФИКАЦИЯ V2 (ИСПРАВЛЕННАЯ)

**Цель:** Довести HeroPanel до 100% по UX/UI дизайну  
**Приоритет:** Практичные улучшения без регрессий  
**Дата:** 8 февраля 2026  
**Версия:** 2.0 (исправленная после code review)

---

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ

**UX/UI Оценка:** ⭐⭐⭐⭐⭐ (5/5) → Цель: ⭐⭐⭐⭐⭐+ (5+/5)

### Что уже хорошо:
- ✅ Glassmorphism эффекты
- ✅ Плавные GSAP анимации
- ✅ 3 режима плотности с hysteresis и visualViewport
- ✅ Responsive grid система
- ✅ Параллельная загрузка данных
- ✅ SessionStorage кэширование
- ✅ Tunnel effect на скролле
- ✅ Профессиональный debounce в heroDensity.ts

### Что нужно улучшить (реалистично):
- ⚠️ Микроинтерактивность (hover, focus states)
- ⚠️ Мобильная оптимизация (touch targets)
- ⚠️ Accessibility (keyboard navigation в accordion, ARIA для табов)
- ⚠️ Loading states (skeleton screens)
- ⚠️ Error feedback (только на ошибки, не на успех)

### Что НЕ нужно трогать:
- ❌ heroDensity.ts - уже оптимален
- ❌ Parallax эффекты - были убраны как проблемные
- ❌ Advanced animations - риск деградации FPS

---

## 🎯 ПЛАН УЛУЧШЕНИЙ (УРЕЗАННЫЙ)

### ФАЗА 1: МИКРОИНТЕРАКТИВНОСТЬ (Priority: HIGH)

#### 1.1 Enhanced Hover States

**Проблема:** Базовые hover эффекты

**Решение:**
```css
/* Улучшенные hover states - ДОБАВИТЬ в конец global.css */
.mira-card-hover-enhanced {
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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

**Файлы для изменения:**
- `apps/web/src/app/global.css` - добавить в конец

---

#### 1.2 Focus States для Accessibility

**Проблема:** Нет видимых focus states

**Решение:**
```css
/* Focus states - ДОБАВИТЬ в конец global.css */
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

#### 2.1 Touch Targets (Точечно)

**Проблема:** Маленькие touch targets

**Решение:**
```css
/* Touch targets - ДОБАВИТЬ в конец global.css */
/* НЕ трогаем .mira-button - он управляется density токенами */
@media (max-width: 768px) {
  /* Только для accordion кнопок */
  .hero-horoscope-period > button {
    min-height: 44px;
    padding: 12px 16px;
  }
}
```

**Файлы для изменения:**
- `apps/web/src/app/global.css`

---

#### 2.2 Swipe Gestures для Accordion

**Решение:**
```typescript
// В CompactHoroscopeBlock.tsx
import { useSwipeable } from 'react-swipeable';

const CompactHoroscopeBlock: React.FC<Props> = ({ ... }) => {
  const periods: Array<'daily' | 'weekly' | 'monthly'> = ['daily', 'weekly', 'monthly'];
  const currentIndex = periods.indexOf(expandedPeriod);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const nextIndex = (currentIndex + 1) % periods.length;
      setExpandedPeriod(periods[nextIndex]);
    },
    onSwipedRight: () => {
      const prevIndex = (currentIndex - 1 + periods.length) % periods.length;
      setExpandedPeriod(periods[prevIndex]);
    },
    trackMouse: false,
    trackTouch: true,
  });

  return (
    <div {...handlers} className="hero-horoscope-card">
      {/* content */}
    </div>
  );
};
```

**Зависимости:**
```bash
npm install react-swipeable
```

---

### ФАЗА 3: ACCESSIBILITY (Priority: HIGH)

#### 3.1 Keyboard Navigation в Accordion

**Проблема:** Нет keyboard navigation

**Решение:**
```typescript
// В CompactHoroscopeBlock.tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  const currentIndex = periods.indexOf(expandedPeriod);

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % periods.length;
      setExpandedPeriod(periods[nextIndex]);
      break;

    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + periods.length) % periods.length;
      setExpandedPeriod(periods[prevIndex]);
      break;

    case 'Home':
      e.preventDefault();
      setExpandedPeriod('daily');
      break;

    case 'End':
      e.preventDefault();
      setExpandedPeriod('monthly');
      break;
  }
};

return (
  <div
    role="tablist"
    aria-label="Периоды гороскопа"
    onKeyDown={handleKeyDown}
  >
    {availableByDensity.map((period) => (
      <button
        key={period}
        role="tab"
        aria-selected={expandedPeriod === period}
        aria-controls={`horoscope-panel-${period}`}
        id={`horoscope-tab-${period}`}
        tabIndex={expandedPeriod === period ? 0 : -1}
        onClick={() => setExpandedPeriod(period)}
      >
        {label.name}
      </button>
    ))}

    {availableByDensity.map((period) => (
      <div
        key={period}
        role="tabpanel"
        id={`horoscope-panel-${period}`}
        aria-labelledby={`horoscope-tab-${period}`}
        hidden={expandedPeriod !== period}
      >
        {/* content */}
      </div>
    ))}
  </div>
);
```

**Файлы для изменения:**
- `apps/web/src/components/CompactHoroscopeBlock.tsx`

---

#### 3.2 Screen Reader Support (Минимальный)

**Решение:**
```css
/* sr-only класс - ДОБАВИТЬ в конец global.css */
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
// Использование для aria-live
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {loading ? 'Загрузка данных...' : ''}
</div>
```

---

### ФАЗА 4: LOADING STATES (Priority: MEDIUM)

#### 4.1 Skeleton Screens

**Решение:**
```typescript
// Создать apps/web/src/components/SkeletonCard.tsx
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`mira-card p-5 ${className}`}>
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

**Использование:**
```typescript
// В PersonalHeroSection.tsx
{loading ? (
  <SkeletonCard />
) : (
  <NatalChartBlock {...props} />
)}
```

---

### ФАЗА 5: ERROR FEEDBACK (Priority: MEDIUM)

#### 5.1 Toast Notifications (ТОЛЬКО на ошибки)

**Решение:**
```typescript
// Использовать react-hot-toast
import toast, { Toaster } from 'react-hot-toast';

// В PersonalHeroSection.tsx - ТОЛЬКО на ошибки
const loadData = async () => {
  try {
    await Promise.all(promises);
    // НЕТ toast.success - это шумно!
  } catch (error) {
    toast.error('Не удалось загрузить данные', {
      icon: '⚠️',
      style: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#fff',
      },
    });
  }
};
```

**Зависимости:**
```bash
npm install react-hot-toast
```

---

### ФАЗА 6: РЕФАКТОРИНГ (Priority: LOW)

#### 6.1 Вынести NatalChartBlock в отдельный файл

**Проблема:** NatalChartBlock объявлен внутри PersonalHeroSection.tsx (line 1634)

**Решение:**
1. Создать `apps/web/src/components/NatalChartBlock.tsx`
2. Перенести компонент из PersonalHeroSection.tsx
3. Добавить React.memo после переноса

```typescript
// apps/web/src/components/NatalChartBlock.tsx
import React from 'react';

interface NatalChartBlockProps {
  natalChart: NatalChart | null;
  user: User;
  loading: boolean;
  density: HeroDensity;
  onViewFull: () => void;
}

export const NatalChartBlock = React.memo<NatalChartBlockProps>(
  ({ natalChart, user, loading, density, onViewFull }) => {
    // Перенести код из PersonalHeroSection.tsx
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

---

## 📋 IMPLEMENTATION ROADMAP (РЕАЛИСТИЧНЫЙ)

### День 1: Микроинтерактивность + Мобильная оптимизация
- [ ] Enhanced hover states в global.css
- [ ] Focus states в global.css
- [ ] Touch targets для accordion
- [ ] Swipe gestures в CompactHoroscopeBlock

### День 2: Accessibility
- [ ] Keyboard navigation в CompactHoroscopeBlock
- [ ] ARIA attributes (role="tablist", role="tab", role="tabpanel")
- [ ] sr-only класс в global.css
- [ ] aria-live для loading состояний

### День 3: Loading + Error States
- [ ] Создать SkeletonCard компонент
- [ ] Добавить skeleton в PersonalHeroSection
- [ ] Добавить toast notifications (только ошибки)

### День 4: Рефакторинг (опционально)
- [ ] Вынести NatalChartBlock в отдельный файл
- [ ] Добавить React.memo

**Общее время:** 3-4 дня

---

## 📦 НОВЫЕ ЗАВИСИМОСТИ

```json
{
  "dependencies": {
    "react-hot-toast": "^2.4.1",
    "react-swipeable": "^7.0.1"
  }
}
```

**Установка:**
```bash
npm install react-hot-toast react-swipeable
```

---

## 🔧 ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

### Основные компоненты

1. **PersonalHeroSection.tsx**
   - Добавить SkeletonCard для loading
   - Добавить toast.error для ошибок
   - Добавить aria-live для loading

2. **CompactHoroscopeBlock.tsx**
   - Добавить keyboard navigation
   - Добавить swipe gestures
   - Добавить ARIA attributes (tablist/tab/tabpanel)

### Стили

3. **global.css**
   - Добавить enhanced hover states
   - Добавить focus states
   - Добавить touch target styles (только accordion)
   - Добавить sr-only класс

### Новые файлы

4. **SkeletonCard.tsx**
   - Создать компонент skeleton loading

5. **NatalChartBlock.tsx** (опционально)
   - Вынести из PersonalHeroSection.tsx

---

## ✅ ЧЕКЛИСТ РЕАЛИЗАЦИИ

### День 1
- [ ] Enhanced hover states (.mira-card-hover-enhanced)
- [ ] Focus states (focus-visible)
- [ ] Touch targets для accordion (min-height: 44px)
- [ ] Swipe gestures (react-swipeable)

### День 2
- [ ] Keyboard navigation (ArrowLeft/Right, Home/End)
- [ ] ARIA tablist/tab/tabpanel
- [ ] sr-only класс
- [ ] aria-live для loading

### День 3
- [ ] SkeletonCard компонент
- [ ] Skeleton в PersonalHeroSection
- [ ] Toast notifications (только ошибки)

### День 4 (опционально)
- [ ] Вынести NatalChartBlock
- [ ] React.memo для NatalChartBlock

---

## ⚠️ ЧТО НЕ ДЕЛАТЬ

### ❌ НЕ трогать:
1. **heroDensity.ts** - уже оптимален с debounce + hysteresis + visualViewport
2. **Parallax эффекты** - были убраны как проблемные (PersonalHeroSection.tsx line 1136)
3. **Глобальные button styles** - размеры управляются density токенами
4. **@apply skeleton-shimmer** - может не работать, использовать обычный класс
5. **Дублирование @keyframes shimmer** - уже есть в global.css
6. **Toast на успех** - шумно, только на ошибки
7. **Избыточные ARIA роли** - только tablist/tab/tabpanel для accordion
8. **Magnetic buttons** - риск деградации FPS
9. **Advanced animations** - риск деградации FPS

---

## 🧪 ТЕСТИРОВАНИЕ

### Manual Testing

1. **Keyboard Navigation:**
   - Tab через все интерактивные элементы
   - ArrowLeft/Right в accordion
   - Home/End в accordion
   - Видимый focus outline

2. **Touch Targets:**
   - Все кнопки >= 44x44px на мобильных
   - Swipe left/right в accordion

3. **Screen Reader:**
   - VoiceOver/NVDA читает табы
   - aria-live объявляет loading

4. **Loading States:**
   - Skeleton показывается при loading
   - Toast показывается при ошибке

---

## 📊 МЕТРИКИ УСПЕХА

### Accessibility
- Lighthouse Accessibility Score: 95+ (было ~85)
- Keyboard navigation: 100% в accordion
- Touch targets: 100% compliance (44x44px)

### UX
- Loading feedback: Skeleton вместо пустоты
- Error feedback: Toast вместо console.error
- Mobile gestures: Swipe в accordion

---

## 🎯 ЗАКЛЮЧЕНИЕ

Эта исправленная спецификация содержит **только практичные улучшения** без риска регрессий:

**Что добавляем:**
1. ✨ Hover/Focus states - минимальный CSS
2. 📱 Touch targets + Swipe - только для accordion
3. ♿ Keyboard navigation + ARIA - только tablist
4. ⏳ Skeleton screens - простой компонент
5. ⚠️ Toast notifications - только ошибки

**Что НЕ трогаем:**
- heroDensity.ts (уже оптимален)
- Parallax (был убран)
- Advanced animations (риск FPS)
- Глобальные button styles (density токены)

**Время:** 3-4 дня  
**Риск:** Минимальный  
**Результат:** Улучшенный UX без деградации производительности

---

**Дата создания:** 8 февраля 2026  
**Версия:** 2.0 (исправленная)  
**Автор:** Kiro AI
