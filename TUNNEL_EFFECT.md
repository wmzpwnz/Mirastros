# 🌀 Эффект Тунеля (Z-Scroll Gallery Walk)

## 📋 Оглавление
1. [Обзор Эффекта](#обзор-эффекта)
2. [Архитектура](#архитектура)
3. [Файлы Реализации](#файлы-реализации)
4. [GSAP Анимация](#gsap-анимация)
5. [CSS Стили](#css-стили)
6. [Компоненты Секций](#компоненты-секций)
7. [Параметры и Настройки](#параметры-и-настройки)
8. [Как Работает Эффект](#как-работает-эффект)
9. [Зависимости](#зависимости)

---

## 🎯 Обзор Эффекта

### Что это?
**Z-Scroll Gallery Walk** - это эффект прокрутки, вдохновленный сайтом [Sage East](https://sageeast.com), который создает иллюзию движения через туннель секций.

### Визуальные характеристики:
- ✨ **Zoom-эффект**: Секции увеличиваются при входе и выходе
- 🌫️ **Blur-эффект**: Размытие при появлении и исчезновении
- 🎭 **Fade-эффект**: Плавное изменение прозрачности
- 📐 **Zig-Zag позиционирование**: Секции появляются слева и справа поочередно
- 🎬 **Smooth scrub**: Анимация привязана к скроллу (0-100%)

### Технологии:
- **GSAP 3.12.2** - Библиотека анимаций
- **ScrollTrigger** - Плагин GSAP для scroll-анимаций
- **React 18.3** - UI фреймворк
- **Next.js 14.2** - React фреймворк
- **TypeScript** - Типизация

---

## 🏗️ Архитектура

### Структура файлов:
```
apps/web/src/
├── app/
│   ├── page.tsx              # 🎯 Главная страница с логикой Z-Scroll
│   └── global.css            # 🎨 CSS стили для эффекта
├── components/
│   ├── SageEastScroll.tsx    # 📦 Компонент-обертка (альтернативная реализация)
│   ├── Background3D.tsx      # 🌌 3D фон с звездами
│   └── sections/
│       ├── HeroSection.tsx   # 🏠 Главная секция
│       ├── TarotSection.tsx  # 🔮 Секция Таро
│       ├── HoroscopeSection.tsx # ♈ Секция Гороскопа
│       └── NatalSection.tsx  # ⭐ Секция Натальной карты
```

---

## 📁 Файлы Реализации

### 1. 🎯 Главный файл: `apps/web/src/app/page.tsx`

**Размер**: 176 строк  
**Назначение**: Основная логика Z-Scroll эффекта

#### Ключевые функции:

##### A. Загрузка GSAP из CDN
```typescript
const loadScripts = async () => {
  // Загрузка GSAP
  const gsapScript = document.createElement('script');
  gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
  document.body.appendChild(gsapScript);
  await new Promise(resolve => gsapScript.onload = resolve);

  // Загрузка ScrollTrigger
  const stScript = document.createElement('script');
  stScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
  document.body.appendChild(stScript);
  await new Promise(resolve => stScript.onload = resolve);

  initSageEastScroll();
};
```

##### B. Инициализация Z-Scroll
```typescript
function initSageEastScroll() {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  // Получаем все секции
  const slides = gsap.utils.toArray('.mira-section');
  const totalSlides = slides.length;
  const vh = window.innerHeight;
  const scrollPerSlide = vh;
  const totalHeight = totalSlides * scrollPerSlide;

  // Устанавливаем высоту body для скролла
  document.body.style.height = `${totalHeight}px`;
}
```

##### C. Начальная настройка секций
```typescript
slides.forEach((slide: any, i: number) => {
  let startX = 0;
  if (i > 0) {
    // Zig-zag позиционирование: нечетные слева, четные справа
    startX = (i % 2 !== 0) ? -25 : 25; // vw units
  }

  if (i === 0) {
    // Первая секция видима
    gsap.set(slide, {
      opacity: 1,
      scale: 1,
      x: 0,
      zIndex: 100,
      filter: 'blur(0px)'
    });
  } else {
    // Остальные секции начинаются маленькими, размытыми, смещенными
    gsap.set(slide, {
      opacity: 0,
      scale: 0.4,
      x: `${startX}vw`,
      zIndex: 100 - i,
      filter: 'blur(20px)'
    });
  }
});
```

##### D. Анимационный цикл
```typescript
slides.forEach((slide: any, i: number) => {
  const startScroll = i * scrollPerSlide;
  const endScroll = (i + 1) * scrollPerSlide;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: `${startScroll}px top`,
      end: `${endScroll}px top`,
      scrub: 0.5,  // Плавность привязки к скроллу
    }
  });

  // ФАЗА 1: ВХОД (для секций после первой)
  if (i > 0) {
    tl.fromTo(slide,
      {
        opacity: 0,
        scale: 0.4,
        filter: 'blur(20px)'
      },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        ease: 'power1.out',
        duration: 0.5
      },
      0
    );
  }

  // ФАЗА 2: ВЫХОД (все секции увеличиваются и размываются)
  tl.to(slide, {
    scale: 2.5,
    opacity: 0,
    filter: 'blur(10px)',
    ease: 'power1.in',
    duration: 0.5
  }, i === 0 ? 0 : 0.5);
});
```

##### E. Индикатор прогресса скролла
```typescript
const scrollPercent = document.getElementById('scrollPercent');
if (scrollPercent) {
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self: any) => {
      const percentage = Math.round(self.progress * 100);
      scrollPercent.textContent = `${percentage}%`;
    }
  });
}
```

##### F. JSX Разметка
```tsx
return (
  <>
    {/* Fixed Viewport for Z-Scroll */}
    <main className="viewport">
      <HeroSection id="hero" />
      <TarotSection id="tarot" />
      <HoroscopeSection id="horoscope" />
      <NatalSection id="natal" />
    </main>

    {/* Scroll Indicator */}
    <div className="scroll-indicator-bottom">
      <span>SCROLL</span>
      <span className="scroll-percent" id="scrollPercent">0%</span>
    </div>
  </>
);
```

---

### 2. 🎨 Стили: `apps/web/src/app/global.css`

**Размер**: 240 строк  
**Назначение**: CSS для Z-Scroll эффекта

#### Ключевые стили:

##### A. CSS Variables
```css
:root {
    --bg-color: #050505;
    --text-color: #e0e0e0;
    --accent-gold: #BE8F44;
}
```

##### B. Fixed Viewport (контейнер для Z-Scroll)
```css
.viewport {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    perspective: 1000px;  /* 3D перспектива */
    display: flex;
    align-items: center;
    justify-content: center;
}
```

##### C. Z-Scroll Секции
```css
.mira-section {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    will-change: transform, opacity, filter;  /* Оптимизация производительности */
    pointer-events: none;  /* Отключаем клики на невидимых секциях */
}

.mira-section.active {
    pointer-events: auto;
}
```

##### D. Hero Section
```css
.hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 8vw;
    line-height: 0.9;
    text-align: center;
    font-weight: 400;
    text-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.title-line-1 {
    display: block;
    color: #fff;
}

.title-line-2 {
    display: block;
    color: var(--accent-gold);
    font-style: italic;
}
```

##### E. Work Sections (Tarot, Horoscope, Natal)
```css
.section-category {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--accent-gold);
}

.section-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    font-weight: 400;
    font-style: italic;
    margin: 0.5rem 0;
    color: #fff;
}

.section-description {
    font-size: 0.9rem;
    color: #aaa;
    max-width: 500px;
    line-height: 1.6;
}
```

##### F. Scroll Indicator
```css
.scroll-indicator-bottom {
    position: fixed;
    bottom: 2rem;
    right: 3rem;
    z-index: 1000;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #666;
    display: flex;
    gap: 1rem;
}

.scroll-percent {
    color: #999;
}
```

---

### 3. 📦 Альтернативная реализация: `SageEastScroll.tsx`

**Размер**: 59 строк  
**Назначение**: Компонент-обертка для Z-Scroll (не используется в текущей версии)

```typescript
'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const SageEastScroll: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const sections = gsap.utils.toArray<HTMLElement>('.scroll-section');

        sections.forEach((section, index) => {
            // Pin каждую секцию при скролле
            ScrollTrigger.create({
                trigger: section,
                start: 'top top',
                end: '+=100%',
                pin: true,
                pinSpacing: true,
                scrub: true,
            });

            // Fade out и scale down при переходе к следующей секции
            if (index < sections.length - 1) {
                gsap.to(section, {
                    opacity: 0,
                    scale: 0.9,
                    filter: 'blur(10px)',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: '+=100%',
                        scrub: 1,
                    },
                });
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    return <div ref={containerRef}>{children}</div>;
};
```

---

## 🎬 GSAP Анимация

### Параметры ScrollTrigger

#### 1. **scrub** (плавность)
```typescript
scrub: 0.5  // Задержка 0.5 сек для плавности
```
- `0` = мгновенная привязка к скроллу
- `1` = задержка 1 секунда
- `true` = автоматическая плавность

#### 2. **trigger** (триггер)
```typescript
trigger: document.body  // Весь документ как триггер
```

#### 3. **start/end** (начало/конец)
```typescript
start: `${startScroll}px top`  // Начало анимации
end: `${endScroll}px top`      // Конец анимации
```

### Параметры анимации

#### 1. **opacity** (прозрачность)
```typescript
opacity: 0  // Невидимо
opacity: 1  // Полностью видимо
```

#### 2. **scale** (масштаб)
```typescript
scale: 0.4  // 40% от оригинального размера
scale: 1    // 100% (оригинальный размер)
scale: 2.5  // 250% (увеличено в 2.5 раза)
```

#### 3. **filter: blur** (размытие)
```typescript
filter: 'blur(0px)'   // Четкое изображение
filter: 'blur(10px)'  // Среднее размытие
filter: 'blur(20px)'  // Сильное размытие
```

#### 4. **x** (горизонтальное смещение)
```typescript
x: 0           // Центр
x: '-25vw'     // 25% viewport влево
x: '25vw'      // 25% viewport вправо
```

#### 5. **ease** (функция плавности)
```typescript
ease: 'power1.out'  // Замедление в конце
ease: 'power1.in'   // Ускорение в конце
```

---

## 🧩 Компоненты Секций

### 1. 🏠 HeroSection.tsx
```typescript
export const HeroSection: React.FC<{id?: string}> = ({ id }) => {
    return (
        <section className="mira-section mira-hero" id={id}>
            <div className="section-content">
                <h1 className="hero-title">
                    <span className="title-line-1">МИСТИЧЕСКИЙ</span>
                    <span className="title-line-2">ПРОВОДНИК</span>
                </h1>
                <p className="hero-tagline">АСТРОЛОГ И ТАРОЛОГ</p>
                <p className="hero-quote">
                    Я не предсказываю будущее, я раскрываю то, что уже знает ваша душа.
                </p>
            </div>
        </section>
    );
};
```

### 2. 🔮 TarotSection.tsx
```typescript
export const TarotSection: React.FC<{id?: string}> = ({ id }) => {
    return (
        <section className="mira-section mira-tarot" id={id}>
            <div className="section-content">
                <div className="section-layout">
                    <span className="section-category">Таро</span>
                    <h2 className="section-title">AI-гадания</h2>
                    <p className="section-description">
                        Персонализированные расклады с искусственным интеллектом
                    </p>
                    <div className="section-icon-placeholder">🔮</div>
                </div>
            </div>
        </section>
    );
};
```

### 3. ♈ HoroscopeSection.tsx
```typescript
export const HoroscopeSection: React.FC<{id?: string}> = ({ id }) => {
    const [horoscope, setHoroscope] = useState<string>('Загрузка предсказания...');

    useEffect(() => {
        const fetchHoroscope = async () => {
            const data = await api.getHoroscope('Aries');
            setHoroscope(data.response);
        };
        fetchHoroscope();
    }, []);

    return (
        <section className="mira-section mira-horoscope" id={id}>
            <div className="section-content">
                <div className="section-layout">
                    <span className="section-category">Гороскоп</span>
                    <h2 className="section-title">Ежедневные прогнозы</h2>
                    <p className="section-description">{horoscope}</p>
                    <div className="section-icon-placeholder">♈</div>
                </div>
            </div>
        </section>
    );
};
```

### 4. ⭐ NatalSection.tsx
```typescript
export const NatalSection: React.FC<{id?: string}> = ({ id }) => {
    return (
        <section className="mira-section mira-natal" id={id}>
            <div className="section-content">
                <div className="section-layout">
                    <span className="section-category">Натальная карта</span>
                    <h2 className="section-title">Астрологический анализ</h2>
                    <p className="section-description">
                        Детальный анализ вашей натальной карты
                    </p>
                    <div className="section-icon-placeholder">⭐</div>
                </div>
            </div>
        </section>
    );
};
```

---

## ⚙️ Параметры и Настройки

### Настройки Z-Scroll

#### 1. Высота скролла
```typescript
const vh = window.innerHeight;           // Высота viewport
const scrollPerSlide = vh;                // Скролл на одну секцию = 1 viewport
const totalHeight = totalSlides * scrollPerSlide;  // Общая высота
```

#### 2. Zig-Zag позиционирование
```typescript
const startX = (i % 2 !== 0) ? -25 : 25;  // vw units
// i=1: -25vw (слева)
// i=2: 25vw (справа)
// i=3: -25vw (слева)
// и т.д.
```

#### 3. Z-Index (глубина)
```typescript
zIndex: 100 - i
// Первая секция: z-index: 100
// Вторая секция: z-index: 99
// Третья секция: z-index: 98
// и т.д.
```

#### 4. Timing (тайминг анимаций)
```typescript
duration: 0.5  // Длительность фазы анимации
scrub: 0.5     // Плавность привязки к скроллу
```

---

## 🔄 Как Работает Эффект

### Последовательность анимации:

#### 1. **Начальное состояние** (Initial Setup)
```
Секция 1 (Hero):
  ✅ opacity: 1, scale: 1, x: 0, blur: 0px
  
Секция 2 (Tarot):
  ❌ opacity: 0, scale: 0.4, x: -25vw, blur: 20px
  
Секция 3 (Horoscope):
  ❌ opacity: 0, scale: 0.4, x: 25vw, blur: 20px
  
Секция 4 (Natal):
  ❌ opacity: 0, scale: 0.4, x: -25vw, blur: 20px
```

#### 2. **Скролл 0% → 25%** (Секция 1 выходит)
```
Секция 1:
  opacity: 1 → 0
  scale: 1 → 2.5
  blur: 0px → 10px
```

#### 3. **Скролл 25% → 50%** (Секция 2 входит и выходит)
```
Секция 2 ВХОД (25% → 37.5%):
  opacity: 0 → 1
  scale: 0.4 → 1
  x: -25vw → 0
  blur: 20px → 0px

Секция 2 ВЫХОД (37.5% → 50%):
  opacity: 1 → 0
  scale: 1 → 2.5
  blur: 0px → 10px
```

#### 4. **Скролл 50% → 75%** (Секция 3)
```
Аналогично секции 2, но x: 25vw → 0
```

#### 5. **Скролл 75% → 100%** (Секция 4)
```
Аналогично секции 2, но x: -25vw → 0
```

### Визуализация фаз:
```
[ФАЗА 1: ВХОД]     [ФАЗА 2: ВЫХОД]
    0.5s                0.5s
    
    ↓                    ↓
    
Маленькая         Нормальная        Огромная
Размытая    →     Четкая      →     Размытая
Невидимая         Видимая           Невидимая
Смещенная         Центр             Центр
```

---

## 📦 Зависимости

### package.json
```json
{
  "dependencies": {
    "gsap": "^3.13.0",
    "@react-three/drei": "^9.105.6",
    "@react-three/fiber": "^8.16.6",
    "three": "^0.164.1",
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

### CDN (используется в page.tsx)
```
GSAP: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js
ScrollTrigger: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js
```

---

## 🎨 3D Фон (Background3D.tsx)

### Компоненты:
```typescript
<Background3D />
  ├── <Canvas>
  │   ├── <Fog />           // Туман (#050505, 5-20 units)
  │   ├── <ambientLight />  // Освещение (intensity: 0.5)
  │   ├── <MovingStars />   // Вращающиеся звезды (5000 шт)
  │   ├── <Cloud />         // Облако 1 (фиолетовое, z: -5)
  │   └── <Cloud />         // Облако 2 (темно-фиолетовое, z: -10)
```

### Анимация звезд:
```typescript
useFrame((state, delta) => {
    if (ref.current) {
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;
    }
});
```

---

## 🐛 Отладка и Мониторинг

### Console Logs:
```typescript
console.log(`Z-Scroll: ${totalSlides} slides, ${totalHeight}px total height`);
```

### Scroll Progress Indicator:
```typescript
<div className="scroll-indicator-bottom">
  <span>SCROLL</span>
  <span className="scroll-percent" id="scrollPercent">0%</span>
</div>
```

---

## 🔧 Оптимизация Производительности

### CSS will-change:
```css
.mira-section {
    will-change: transform, opacity, filter;
}
```

### GSAP Performance:
- ✅ Использование `scrub` для плавной анимации
- ✅ `will-change` для GPU acceleration
- ✅ Минимальное количество DOM манипуляций
- ✅ Cleanup при unmount компонента

---

## 📱 Responsive Design

### Mobile (< 768px):
```css
@media (max-width: 768px) {
    .hero-title {
        font-size: 12vw;  /* Увеличенный размер */
    }

    .section-title {
        font-size: 1.8rem;  /* Уменьшенный размер */
    }

    .scroll-indicator-bottom {
        right: 1.5rem;
        bottom: 1.5rem;
    }
}
```

---

## 🚀 Как Запустить

### 1. Установка зависимостей:
```bash
npm install
```

### 2. Запуск dev сервера:
```bash
npm run dev
# или
nx serve web
```

### 3. Открыть в браузере:
```
http://localhost:3000
```

---

## 📊 Структура Анимации (Timeline)

```
Scroll Position:  0%        25%       50%       75%      100%
                  |---------|---------|---------|---------|
Section 1 (Hero): [========EXIT========]
Section 2 (Tarot):          [ENTER===EXIT===]
Section 3 (Horoscope):                [ENTER===EXIT===]
Section 4 (Natal):                              [ENTER===EXIT===]

Legend:
[ENTER] = Появление (opacity 0→1, scale 0.4→1, blur 20→0)
[EXIT]  = Исчезновение (opacity 1→0, scale 1→2.5, blur 0→10)
```

---

## 🎯 Ключевые Особенности

### 1. **Fixed Viewport**
- Все секции находятся в фиксированном контейнере
- `position: fixed` для viewport
- `position: absolute` для секций

### 2. **Scroll-driven Animation**
- Анимация полностью привязана к скроллу
- Нет автоматического воспроизведения
- Пользователь контролирует скорость

### 3. **Zig-Zag Pattern**
- Нечетные секции появляются слева (-25vw)
- Четные секции появляются справа (+25vw)
- Создает динамичный эффект

### 4. **Layered Z-Index**
- Каждая секция имеет свой z-index
- Первая секция на переднем плане (z: 100)
- Последующие секции позади (z: 99, 98, 97...)

---

## 📝 Следующие Шаги

### Возможные улучшения:

1. **Добавить параллакс эффект** для фона
2. **Интерактивные элементы** внутри секций
3. **Звуковые эффекты** при переходах
4. **Частицы** вокруг активной секции
5. **Мобильная оптимизация** (touch gestures)
6. **Preloader** для плавной загрузки
7. **Lazy loading** для изображений
8. **Accessibility** улучшения (keyboard navigation)

---

**Дата создания**: 2025-11-21  
**Версия**: 1.0.0  
**Автор**: Mirastros Team
