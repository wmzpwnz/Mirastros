# Animation Guide

## Overview

This guide documents animation timing, easing functions, performance best practices, and prefers-reduced-motion support for the Mirastros design system.

## Table of Contents

1. [Animation Timing](#animation-timing)
2. [Easing Functions](#easing-functions)
3. [Animation Presets](#animation-presets)
4. [Performance Best Practices](#performance-best-practices)
5. [Prefers-Reduced-Motion Support](#prefers-reduced-motion-support)
6. [Animation Examples](#animation-examples)
7. [Testing Animations](#testing-animations)

---

## Animation Timing

### Duration Standards

The design system defines three standard animation durations:

#### Fast (150ms)
- **Use**: Micro-interactions, hover states, quick feedback
- **Examples**: Button hover, icon change, tooltip appear
- **Characteristics**: Immediate, snappy, responsive

```css
.fast-animation {
  transition: all 150ms ease-out;
}
```

#### Base (300ms)
- **Use**: Standard transitions, state changes, modal open/close
- **Examples**: Form validation, tab switch, menu open
- **Characteristics**: Noticeable but not slow, balanced

```css
.base-animation {
  transition: all 300ms ease-in-out;
}
```

#### Slow (500ms)
- **Use**: Entrance animations, complex transitions, page changes
- **Examples**: Page load, hero animation, complex state change
- **Characteristics**: Smooth, deliberate, elegant

```css
.slow-animation {
  transition: all 500ms ease-in-out;
}
```

### Duration Selection Guide

| Duration | Use Case | Examples |
|----------|----------|----------|
| 150ms | Micro-interactions | Hover, focus, icon change |
| 300ms | Standard transitions | Tab switch, modal open, form validation |
| 500ms | Entrance animations | Page load, hero animation, complex transitions |
| 1000ms+ | Long animations | Looping animations, extended sequences |

### Timing Implementation

#### CSS Transitions
```css
/* Fast transition */
button {
  transition: background-color 150ms ease-out;
}

/* Base transition */
.modal {
  transition: opacity 300ms ease-in-out;
}

/* Slow transition */
.hero {
  transition: transform 500ms ease-in-out;
}
```

#### Tailwind Classes
```tsx
// Fast (150ms)
<div className="transition-colors duration-150">
  Hover me
</div>

// Base (300ms)
<div className="transition-all duration-300">
  Hover me
</div>

// Slow (500ms)
<div className="transition-all duration-500">
  Hover me
</div>
```

#### React Framer Motion
```tsx
import { motion } from 'framer-motion';

// Fast animation
<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: 0.15 }}
>
  Content
</motion.div>

// Base animation
<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Slow animation
<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

---

## Easing Functions

### Easing Types

The design system uses four standard easing functions:

#### ease-in
- **Curve**: cubic-bezier(0.4, 0, 1, 1)
- **Behavior**: Starts slow, accelerates
- **Use**: Exiting animations, elements leaving screen
- **Feel**: Accelerating, energetic

```css
.ease-in {
  transition: all 300ms cubic-bezier(0.4, 0, 1, 1);
}
```

#### ease-out
- **Curve**: cubic-bezier(0, 0, 0.2, 1)
- **Behavior**: Starts fast, decelerates
- **Use**: Entering animations, elements appearing
- **Feel**: Decelerating, settling

```css
.ease-out {
  transition: all 300ms cubic-bezier(0, 0, 0.2, 1);
}
```

#### ease-in-out
- **Curve**: cubic-bezier(0.4, 0, 0.2, 1)
- **Behavior**: Starts slow, accelerates, decelerates
- **Use**: Continuous animations, state changes
- **Feel**: Smooth, balanced, natural

```css
.ease-in-out {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### linear
- **Curve**: linear
- **Behavior**: Constant speed throughout
- **Use**: Rotating elements, progress bars, continuous motion
- **Feel**: Mechanical, steady, predictable

```css
.linear {
  transition: all 300ms linear;
}
```

### Easing Selection Guide

| Easing | Use Case | Examples |
|--------|----------|----------|
| ease-in | Exiting animations | Modal close, element fade out |
| ease-out | Entering animations | Modal open, element fade in |
| ease-in-out | Continuous animations | Tab switch, state change |
| linear | Rotating/continuous | Loading spinner, progress bar |

### Easing Implementation

#### CSS Transitions
```css
/* Entering animation */
.fade-in {
  transition: opacity 300ms ease-out;
}

/* Exiting animation */
.fade-out {
  transition: opacity 300ms ease-in;
}

/* Continuous animation */
.slide {
  transition: transform 300ms ease-in-out;
}

/* Rotating animation */
.spin {
  animation: spin 2s linear infinite;
}
```

#### Tailwind Classes
```tsx
// ease-in
<div className="transition-all duration-300 ease-in">
  Exiting
</div>

// ease-out
<div className="transition-all duration-300 ease-out">
  Entering
</div>

// ease-in-out
<div className="transition-all duration-300 ease-in-out">
  Continuous
</div>

// linear
<div className="transition-all duration-300 ease-linear">
  Rotating
</div>
```

#### React Framer Motion
```tsx
import { motion } from 'framer-motion';

// ease-out (entering)
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ ease: 'easeOut', duration: 0.3 }}
>
  Entering
</motion.div>

// ease-in (exiting)
<motion.div
  exit={{ opacity: 0 }}
  transition={{ ease: 'easeIn', duration: 0.3 }}
>
  Exiting
</motion.div>

// ease-in-out (continuous)
<motion.div
  animate={{ x: 100 }}
  transition={{ ease: 'easeInOut', duration: 0.3 }}
>
  Continuous
</motion.div>

// linear (rotating)
<motion.div
  animate={{ rotate: 360 }}
  transition={{ ease: 'linear', duration: 2, repeat: Infinity }}
>
  Rotating
</motion.div>
```

---

## Animation Presets

### Preset Animations

The design system includes several preset animations:

#### Fade In
- **Duration**: 300ms
- **Easing**: ease-out
- **Use**: Elements appearing on page

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 300ms ease-out;
}
```

#### Fade Out
- **Duration**: 300ms
- **Easing**: ease-in
- **Use**: Elements disappearing from page

```css
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.fade-out {
  animation: fadeOut 300ms ease-in;
}
```

#### Slide In
- **Duration**: 300ms
- **Easing**: ease-out
- **Use**: Elements sliding into view

```css
@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in-up {
  animation: slideInUp 300ms ease-out;
}
```

#### Slide Out
- **Duration**: 300ms
- **Easing**: ease-in
- **Use**: Elements sliding out of view

```css
@keyframes slideOutDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(20px);
    opacity: 0;
  }
}

.slide-out-down {
  animation: slideOutDown 300ms ease-in;
}
```

#### Pulse Slow
- **Duration**: 4s
- **Easing**: ease-in-out
- **Use**: Loading states, attention-grabbing

```css
@keyframes pulseSlow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse-slow {
  animation: pulseSlow 4s ease-in-out infinite;
}
```

#### Float
- **Duration**: 6s
- **Easing**: ease-in-out
- **Use**: Floating elements, subtle movement

```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.float {
  animation: float 6s ease-in-out infinite;
}
```

#### Bounce Slow
- **Duration**: 3s
- **Easing**: ease-in-out
- **Use**: Playful interactions, CTAs

```css
@keyframes bounceSlow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.bounce-slow {
  animation: bounceSlow 3s ease-in-out infinite;
}
```

#### Spin
- **Duration**: 2s
- **Easing**: linear
- **Use**: Loading spinners, rotating elements

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 2s linear infinite;
}
```

### Using Presets

#### CSS Classes
```tsx
// Fade in
<div className="fade-in">
  Content
</div>

// Slide in
<div className="slide-in-up">
  Content
</div>

// Pulse
<div className="pulse-slow">
  Loading...
</div>

// Float
<div className="float">
  Floating element
</div>
```

#### Tailwind Animations
```tsx
// Fade in/out
<div className="animate-fadeIn">
  Content
</div>

// Pulse
<div className="animate-pulse">
  Loading...
</div>

// Spin
<div className="animate-spin">
  <Spinner />
</div>

// Bounce
<div className="animate-bounce">
  Bouncing element
</div>
```

---

## Performance Best Practices

### GPU-Accelerated Properties

#### Use These Properties
- **transform**: Translate, rotate, scale
- **opacity**: Fade in/out
- **filter**: Blur, brightness, contrast

```css
/* Good: GPU-accelerated */
.good-animation {
  transition: transform 300ms ease-out;
}

.good-animation:hover {
  transform: translateY(-5px);
}
```

#### Avoid These Properties
- **width**: Causes layout recalculation
- **height**: Causes layout recalculation
- **left/top**: Causes layout recalculation
- **margin/padding**: Causes layout recalculation
- **background-color**: Not GPU-accelerated

```css
/* Bad: Not GPU-accelerated */
.bad-animation {
  transition: width 300ms ease-out;
}

.bad-animation:hover {
  width: 200px;
}
```

### Performance Optimization

#### 1. Use will-change
- Hint browser to optimize animation
- Use sparingly, only for animated elements
- Remove after animation completes

```css
.animated-element {
  will-change: transform;
  transition: transform 300ms ease-out;
}

.animated-element:hover {
  transform: translateY(-5px);
}
```

#### 2. Reduce Animation Complexity
- Animate fewer properties
- Use simpler easing functions
- Avoid animating many elements simultaneously

```css
/* Good: Simple animation */
.simple {
  transition: opacity 300ms ease-out;
}

/* Bad: Complex animation */
.complex {
  transition: all 300ms cubic-bezier(0.4, 0.2, 0.1, 0.8);
}
```

#### 3. Debounce Animations
- Prevent animation spam
- Use requestAnimationFrame
- Throttle animation triggers

```tsx
import { useCallback, useRef } from 'react';

function AnimatedComponent() {
  const animationRef = useRef(null);

  const handleHover = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    animationRef.current = setTimeout(() => {
      // Trigger animation
    }, 100);
  }, []);

  return (
    <div onMouseEnter={handleHover}>
      Content
    </div>
  );
}
```

#### 4. Use CSS Animations for Continuous Motion
- CSS animations are more performant
- Use JavaScript for interactive animations
- Combine both for best results

```css
/* CSS animation: Performant for continuous motion */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 2s linear infinite;
}
```

### Performance Monitoring

#### Measure Animation Performance
```tsx
// Measure frame rate
function measureFrameRate() {
  let frameCount = 0;
  let lastTime = performance.now();

  function countFrame() {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime - lastTime >= 1000) {
      console.log(`FPS: ${frameCount}`);
      frameCount = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(countFrame);
  }

  requestAnimationFrame(countFrame);
}
```

#### Chrome DevTools Performance
1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Perform animation
5. Click Stop
6. Analyze frame rate and performance

---

## Prefers-Reduced-Motion Support

### Understanding prefers-reduced-motion

The `prefers-reduced-motion` media query respects user preferences for reduced motion:

- **Accessibility**: Users with vestibular disorders, epilepsy, or motion sensitivity
- **User Preference**: System setting to reduce motion
- **Browser Support**: All modern browsers

### Detecting Preference

#### CSS Media Query
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### JavaScript Detection
```tsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // Disable animations
} else {
  // Enable animations
}
```

### Implementation

#### Disable All Animations
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Reduce Animation Duration
```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation-duration: 100ms !important;
    transition-duration: 100ms !important;
  }
}
```

#### Disable Specific Animations
```css
@media (prefers-reduced-motion: reduce) {
  .fade-in {
    animation: none;
  }

  .slide-in {
    animation: none;
  }

  .pulse {
    animation: none;
  }
}
```

### React Implementation

#### Custom Hook
```tsx
import { useEffect, useState } from 'react';

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

// Usage
function AnimatedComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={prefersReducedMotion ? '' : 'animate-fadeIn'}
    >
      Content
    </div>
  );
}
```

#### Conditional Animation
```tsx
function AnimatedButton() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <button
      className={
        prefersReducedMotion
          ? 'transition-none'
          : 'transition-all duration-300 ease-out hover:scale-105'
      }
    >
      Click me
    </button>
  );
}
```

---

## Animation Examples

### Button Hover Animation
```tsx
// CSS
.button {
  transition: all 150ms ease-out;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

// Tailwind
<button className="transition-all duration-150 ease-out hover:scale-105 hover:shadow-lg">
  Click me
</button>
```

### Modal Open Animation
```tsx
// CSS
.modal {
  animation: slideInUp 300ms ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// React
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  Modal content
</motion.div>
```

### Loading Spinner
```tsx
// CSS
.spinner {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Tailwind
<div className="animate-spin">
  <Spinner />
</div>
```

### Fade In on Scroll
```tsx
// React with Intersection Observer
import { useEffect, useRef } from 'react';

function FadeInOnScroll({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="opacity-0">
      {children}
    </div>
  );
}
```

---

## Testing Animations

### Animation Testing Checklist

#### Visual Testing
- [ ] Animation plays smoothly
- [ ] Animation duration is correct
- [ ] Animation easing is appropriate
- [ ] Animation completes properly
- [ ] No jank or stuttering

#### Performance Testing
- [ ] Animation runs at 60fps
- [ ] No layout thrashing
- [ ] GPU acceleration working
- [ ] No memory leaks
- [ ] Smooth on low-end devices

#### Accessibility Testing
- [ ] prefers-reduced-motion respected
- [ ] Animation doesn't distract
- [ ] No flashing content
- [ ] No seizure risk
- [ ] Alternative provided

#### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### Performance Profiling

#### Chrome DevTools
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Perform animation
5. Click Stop
6. Analyze:
   - Frame rate (should be 60fps)
   - Main thread activity
   - GPU activity
   - Memory usage

#### Lighthouse
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Click Generate report
4. Check Performance score
5. Review recommendations

---

## Best Practices

### Do's
- ✅ Use animations purposefully
- ✅ Keep animations subtle
- ✅ Use GPU-accelerated properties
- ✅ Respect prefers-reduced-motion
- ✅ Test on real devices
- ✅ Measure performance
- ✅ Use standard durations
- ✅ Provide alternatives

### Don'ts
- ❌ Animate for decoration
- ❌ Use animations that distract
- ❌ Animate non-GPU properties
- ❌ Ignore accessibility
- ❌ Create jank or stuttering
- ❌ Use excessive animations
- ❌ Forget about performance
- ❌ Ignore user preferences

---

## Resources

### External References
- [MDN - CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [MDN - CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions)
- [Web.dev - Animations](https://web.dev/animations/)
- [Framer Motion](https://www.framer.com/motion/)

### Tools
- [Cubic Bezier](https://cubic-bezier.com/)
- [Easing Functions](https://easings.net/)
- [Animation Inspector](https://developer.mozilla.org/en-US/docs/Tools/Inspector/Animations)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## Questions & Support

For animation questions:

1. Check this guide
2. Review animation examples
3. Test with Chrome DevTools
4. Ask in the design system team channel
5. Create an issue in the repository
