#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * Analyzes the design system bundle size and identifies large components
 */

const fs = require('fs');
const path = require('path');

// Get all component files
const componentsDir = path.join(__dirname, '../src/components');
const files = fs.readdirSync(componentsDir);

// Filter for component files (exclude __tests__ and index.ts)
const componentFiles = files.filter(
  (file) =>
    file.endsWith('.tsx') &&
    !file.startsWith('__') &&
    file !== 'index.ts'
);

// Calculate file sizes
const componentSizes = componentFiles
  .map((file) => {
    const filePath = path.join(componentsDir, file);
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;

    return {
      name: file.replace('.tsx', ''),
      size: stats.size,
      lines,
      path: filePath,
    };
  })
  .sort((a, b) => b.size - a.size);

// Calculate totals
const totalSize = componentSizes.reduce((sum, c) => sum + c.size, 0);
const totalLines = componentSizes.reduce((sum, c) => sum + c.lines, 0);

// Print analysis
console.log('\n📊 Design System Bundle Analysis\n');
console.log('='.repeat(60));
console.log('Component Size Breakdown (sorted by size):\n');

componentSizes.forEach((component, index) => {
  const percentage = ((component.size / totalSize) * 100).toFixed(1);
  const sizeKb = (component.size / 1024).toFixed(2);
  console.log(
    `${index + 1}. ${component.name.padEnd(25)} ${sizeKb.padStart(8)} KB (${percentage.padStart(5)}%) - ${component.lines} lines`
  );
});

console.log('\n' + '='.repeat(60));
console.log(`\nTotal Components: ${componentSizes.length}`);
console.log(`Total Size: ${(totalSize / 1024).toFixed(2)} KB`);
console.log(`Total Lines: ${totalLines}`);
console.log(`Average Component Size: ${(totalSize / componentSizes.length / 1024).toFixed(2)} KB`);

// Identify large components (> 5KB)
const largeComponents = componentSizes.filter((c) => c.size > 5120);
if (largeComponents.length > 0) {
  console.log('\n⚠️  Large Components (> 5KB):');
  largeComponents.forEach((component) => {
    console.log(`   - ${component.name}: ${(component.size / 1024).toFixed(2)} KB`);
  });
}

// Check for unused exports
console.log('\n📋 Checking for Unused Code Patterns...\n');

const indexPath = path.join(componentsDir, 'index.ts');
const indexContent = fs.readFileSync(indexPath, 'utf-8');

// Find all exported components
const exportedComponents = new Set();
const exportMatches = indexContent.match(/export\s*{[^}]+}/g) || [];
exportMatches.forEach((match) => {
  const names = match.match(/\b[A-Z][a-zA-Z]+\b/g) || [];
  names.forEach((name) => exportedComponents.add(name));
});

console.log(`Total Exported Components: ${exportedComponents.size}`);
console.log(`Total Component Files: ${componentFiles.length}`);

// Check for potential code splitting opportunities
console.log('\n💡 Code Splitting Opportunities:\n');
console.log('Consider lazy-loading these large components:');
largeComponents.slice(0, 5).forEach((component) => {
  console.log(`   - ${component.name}`);
});

console.log('\n✅ Analysis Complete\n');
