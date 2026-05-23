#!/usr/bin/env node

/**
 * Component Performance Measurement Script
 * Measures render time and identifies performance bottlenecks
 */

const fs = require('fs');
const path = require('path');

console.log('\n⚡ Component Performance Analysis\n');
console.log('='.repeat(60));

// Analyze component complexity
const componentsDir = path.join(__dirname, '../src/components');
const files = fs.readdirSync(componentsDir);

const componentFiles = files.filter(
  (file) =>
    file.endsWith('.tsx') &&
    !file.startsWith('__') &&
    file !== 'index.ts'
);

const performanceMetrics = componentFiles
  .map((file) => {
    const filePath = path.join(componentsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Count complexity indicators
    const hasUseState = (content.match(/useState/g) || []).length;
    const hasUseEffect = (content.match(/useEffect/g) || []).length;
    const hasUseCallback = (content.match(/useCallback/g) || []).length;
    const hasUseMemo = (content.match(/useMemo/g) || []).length;
    const hasConditionalRender = (content.match(/\?.*:/g) || []).length;
    const hasMap = (content.match(/\.map\(/g) || []).length;
    const hasFilter = (content.match(/\.filter\(/g) || []).length;
    const lines = content.split('\n').length;

    // Calculate complexity score
    const complexityScore =
      hasUseState * 2 +
      hasUseEffect * 3 +
      hasUseCallback * 1 +
      hasUseMemo * 1 +
      hasConditionalRender * 1 +
      hasMap * 2 +
      hasFilter * 2;

    // Estimate render time (rough estimate)
    const estimatedRenderTime = Math.min(16, Math.ceil(complexityScore / 10));

    return {
      name: file.replace('.tsx', ''),
      lines,
      complexity: complexityScore,
      estimatedRenderTime,
      hooks: {
        useState: hasUseState,
        useEffect: hasUseEffect,
        useCallback: hasUseCallback,
        useMemo: hasUseMemo,
      },
      operations: {
        conditionalRender: hasConditionalRender,
        map: hasMap,
        filter: hasFilter,
      },
    };
  })
  .sort((a, b) => b.complexity - a.complexity);

// Print analysis
console.log('Component Complexity & Performance Metrics:\n');

performanceMetrics.forEach((metric, index) => {
  const status =
    metric.estimatedRenderTime > 10
      ? '🔴 SLOW'
      : metric.estimatedRenderTime > 5
        ? '🟡 MEDIUM'
        : '🟢 FAST';

  console.log(
    `${index + 1}. ${metric.name.padEnd(25)} ${status} (${metric.estimatedRenderTime}ms est.)`
  );
  console.log(
    `   Complexity: ${metric.complexity} | Lines: ${metric.lines} | Hooks: ${JSON.stringify(metric.hooks)}`
  );
});

// Identify slow components
const slowComponents = performanceMetrics.filter(
  (m) => m.estimatedRenderTime > 10
);

if (slowComponents.length > 0) {
  console.log('\n⚠️  Slow Components (>10ms estimated render time):\n');
  slowComponents.forEach((component) => {
    console.log(`   - ${component.name}: ${component.estimatedRenderTime}ms`);
    console.log(`     Hooks: ${JSON.stringify(component.hooks)}`);
    console.log(`     Operations: ${JSON.stringify(component.operations)}`);
  });
}

// Optimization recommendations
console.log('\n💡 Optimization Recommendations:\n');

performanceMetrics.slice(0, 5).forEach((component) => {
  console.log(`${component.name}:`);

  if (component.hooks.useEffect > 2) {
    console.log('   - Consolidate multiple useEffect hooks');
  }
  if (component.hooks.useState > 3) {
    console.log('   - Consider using useReducer for complex state');
  }
  if (component.operations.map > 2 || component.operations.filter > 2) {
    console.log('   - Memoize list operations with useMemo');
  }
  if (component.operations.conditionalRender > 5) {
    console.log('   - Extract conditional render logic to separate components');
  }
  console.log('');
});

console.log('='.repeat(60));
console.log('\n✅ Performance Analysis Complete\n');
