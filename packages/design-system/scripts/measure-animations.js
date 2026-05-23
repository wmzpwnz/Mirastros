#!/usr/bin/env node

/**
 * Animation Performance Measurement Script
 * Analyzes animation definitions for performance optimization
 */

const fs = require('fs');
const path = require('path');

console.log('\n🎬 Animation Performance Analysis\n');
console.log('='.repeat(60));

const animationsPath = path.join(__dirname, '../src/styles/animations.css');
const content = fs.readFileSync(animationsPath, 'utf-8');

// Extract all keyframe names
const keyframeNames = [];
const keyframeRegex = /@keyframes\s+(\w+)/g;
let match;
while ((match = keyframeRegex.exec(content)) !== null) {
  keyframeNames.push(match[1]);
}

console.log('Animation Definitions:\n');

const animations = [];

keyframeNames.forEach((name) => {
  // Find the keyframe block
  const keyframeStart = content.indexOf(`@keyframes ${name}`);
  const keyframeEnd = content.indexOf('}', keyframeStart) + 1;
  const keyframeBlock = content.substring(keyframeStart, keyframeEnd);

  // Check for GPU-accelerated properties
  const hasTransform = keyframeBlock.includes('transform');
  const hasOpacity = keyframeBlock.includes('opacity');
  const hasColor = keyframeBlock.includes('color') || keyframeBlock.includes('background');
  const hasSize = keyframeBlock.includes('width') || keyframeBlock.includes('height');

  const isOptimized = hasTransform || hasOpacity;
  const hasExpensiveProps = hasColor || hasSize;

  animations.push({
    name,
    isOptimized,
    hasExpensiveProps,
    properties: {
      transform: hasTransform,
      opacity: hasOpacity,
      color: hasColor,
      size: hasSize,
    },
  });

  const status = isOptimized ? '✅' : '⚠️';
  console.log(`${status} @keyframes ${name}`);
  console.log(`   GPU-accelerated: ${isOptimized ? 'Yes' : 'No'}`);
  if (hasExpensiveProps) {
    const expensiveProps = Object.entries(animations[animations.length - 1].properties)
      .filter(([k, v]) => v && (k === 'color' || k === 'size'))
      .map(([k]) => k)
      .join(', ');
    if (expensiveProps) {
      console.log(`   ⚠️  Expensive properties detected: ${expensiveProps}`);
    }
  }
  console.log('');
});

// Extract animation utilities
const utilityNames = [];
const utilityRegex = /\.animate-(\w+)/g;
while ((match = utilityRegex.exec(content)) !== null) {
  utilityNames.push(match[1]);
}

console.log('Animation Utilities:\n');

const utilities = [];

utilityNames.forEach((name) => {
  const utilityStart = content.indexOf(`.animate-${name}`);
  const utilityEnd = content.indexOf('}', utilityStart) + 1;
  const utilityBlock = content.substring(utilityStart, utilityEnd);

  const durationMatch = utilityBlock.match(/(\d+)m?s/);
  const duration = durationMatch ? durationMatch[1] : 'unknown';

  const easingMatch = utilityBlock.match(/(ease-in|ease-out|ease-in-out|linear|cubic-bezier[^)]*\))/);
  const easing = easingMatch ? easingMatch[1] : 'unknown';

  utilities.push({
    name,
    duration,
    easing,
  });

  console.log(`• .animate-${name}`);
  console.log(`  Duration: ${duration}ms | Easing: ${easing}`);
});

// Performance recommendations
console.log('\n' + '='.repeat(60));
console.log('\n💡 Performance Recommendations:\n');

const optimizedCount = animations.filter((a) => a.isOptimized).length;
const expensiveCount = animations.filter((a) => a.hasExpensiveProps).length;

console.log(`✅ GPU-accelerated animations: ${optimizedCount}/${animations.length}`);
console.log(`⚠️  Animations with expensive properties: ${expensiveCount}/${animations.length}`);

if (expensiveCount > 0) {
  console.log('\nAnimations to optimize:');
  animations
    .filter((a) => a.hasExpensiveProps)
    .forEach((a) => {
      console.log(`   - ${a.name}: Replace with transform/opacity`);
    });
}

// Check for prefers-reduced-motion
const hasReducedMotion = content.includes('prefers-reduced-motion');
console.log(`\n${hasReducedMotion ? '✅' : '⚠️'} Respects prefers-reduced-motion: ${hasReducedMotion ? 'Yes' : 'No'}`);

// Frame rate analysis
console.log('\n📊 Frame Rate Analysis:\n');

const animationDurations = utilities
  .map((u) => (u.duration !== 'unknown' ? parseInt(u.duration) : 0))
  .filter((d) => d > 0);

const avgDuration = animationDurations.length > 0 
  ? animationDurations.reduce((a, b) => a + b, 0) / animationDurations.length
  : 0;

console.log(`Total animations: ${utilities.length}`);
console.log(`Average animation duration: ${avgDuration.toFixed(0)}ms`);
console.log(`Expected frame rate: ${avgDuration > 0 ? (1000 / avgDuration).toFixed(1) : 'N/A'} fps`);
console.log(`Target frame rate: 60 fps (16.67ms per frame)`);

// Jank detection
const jankRisk = utilities.filter((u) => {
  const duration = u.duration !== 'unknown' ? parseInt(u.duration) : 0;
  return duration > 0 && duration < 150;
});

if (jankRisk.length > 0) {
  console.log(`\n⚠️  Animations that might cause jank (< 150ms):`);
  jankRisk.forEach((u) => {
    console.log(`   - .animate-${u.name} (${u.duration}ms)`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('\n✅ Animation Analysis Complete\n');
