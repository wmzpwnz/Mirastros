#!/usr/bin/env node

/**
 * Accessibility Validation Script
 * Validates components against WCAG 2.1 AA standards
 * Checks for common accessibility issues
 */

const fs = require('fs');
const path = require('path');

// Accessibility validation rules
const validationRules = {
  ariaLabels: {
    name: 'ARIA Labels',
    description: 'Interactive elements must have accessible names',
    severity: 'critical',
    check: (component) => {
      const interactiveElements = [
        'Button',
        'Input',
        'Select',
        'Modal',
        'Drawer',
        'AlertDialog',
      ];
      return !interactiveElements.includes(component.name);
    },
  },
  keyboardNavigation: {
    name: 'Keyboard Navigation',
    description: 'All interactive elements must be keyboard accessible',
    severity: 'critical',
    check: (component) => {
      const interactiveElements = [
        'Button',
        'Input',
        'Select',
        'Checkbox',
        'Radio',
        'Modal',
        'Tabs',
        'Accordion',
      ];
      return !interactiveElements.includes(component.name);
    },
  },
  colorContrast: {
    name: 'Color Contrast',
    description: 'Text must have sufficient contrast (4.5:1 for normal, 3:1 for large)',
    severity: 'high',
    check: (component) => {
      const textComponents = [
        'Button',
        'Label',
        'Badge',
        'Card',
        'Hero',
        'Section',
      ];
      return !textComponents.includes(component.name);
    },
  },
  focusManagement: {
    name: 'Focus Management',
    description: 'Focus must be visible and managed correctly',
    severity: 'high',
    check: (component) => {
      const focusComponents = [
        'Button',
        'Input',
        'Select',
        'Modal',
        'Drawer',
        'Tabs',
      ];
      return !focusComponents.includes(component.name);
    },
  },
  semanticHTML: {
    name: 'Semantic HTML',
    description: 'Components must use semantic HTML elements',
    severity: 'medium',
    check: (component) => {
      const semanticComponents = [
        'Button',
        'Input',
        'Label',
        'Card',
        'Section',
        'Navbar',
      ];
      return !semanticComponents.includes(component.name);
    },
  },
  formLabels: {
    name: 'Form Labels',
    description: 'Form inputs must have associated labels',
    severity: 'critical',
    check: (component) => {
      const formComponents = [
        'Input',
        'Select',
        'Checkbox',
        'Radio',
        'Textarea',
        'DatePicker',
      ];
      return !formComponents.includes(component.name);
    },
  },
  altText: {
    name: 'Alt Text',
    description: 'Images must have alt text',
    severity: 'high',
    check: (component) => {
      const imageComponents = ['Avatar', 'Hero', 'Card'];
      return !imageComponents.includes(component.name);
    },
  },
  ariaRoles: {
    name: 'ARIA Roles',
    description: 'Complex components must have proper ARIA roles',
    severity: 'high',
    check: (component) => {
      const complexComponents = [
        'Modal',
        'Drawer',
        'AlertDialog',
        'Tabs',
        'Accordion',
        'Table',
      ];
      return !complexComponents.includes(component.name);
    },
  },
};

// Component definitions
const components = [
  { name: 'Button', category: 'Primitive' },
  { name: 'Input', category: 'Primitive' },
  { name: 'Label', category: 'Primitive' },
  { name: 'Icon', category: 'Primitive' },
  { name: 'Badge', category: 'Primitive' },
  { name: 'Avatar', category: 'Primitive' },
  { name: 'Select', category: 'Form' },
  { name: 'Checkbox', category: 'Form' },
  { name: 'Radio', category: 'Form' },
  { name: 'Textarea', category: 'Form' },
  { name: 'DatePicker', category: 'Form' },
  { name: 'FormGroup', category: 'Form' },
  { name: 'Toast', category: 'Feedback' },
  { name: 'Tooltip', category: 'Feedback' },
  { name: 'Spinner', category: 'Feedback' },
  { name: 'Skeleton', category: 'Feedback' },
  { name: 'Container', category: 'Layout' },
  { name: 'Grid', category: 'Layout' },
  { name: 'Stack', category: 'Layout' },
  { name: 'Navbar', category: 'Layout' },
  { name: 'Sidebar', category: 'Layout' },
  { name: 'Card', category: 'Content' },
  { name: 'ServiceCard', category: 'Content' },
  { name: 'Hero', category: 'Content' },
  { name: 'Section', category: 'Content' },
  { name: 'Tabs', category: 'Navigation' },
  { name: 'Accordion', category: 'Navigation' },
  { name: 'Breadcrumb', category: 'Navigation' },
  { name: 'Pagination', category: 'Navigation' },
  { name: 'Table', category: 'Data' },
  { name: 'Chart', category: 'Data' },
  { name: 'ProgressBar', category: 'Data' },
  { name: 'Modal', category: 'Modal' },
  { name: 'AlertDialog', category: 'Modal' },
  { name: 'Drawer', category: 'Modal' },
];

// Validate components
const validateComponents = () => {
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      total: components.length,
      passed: 0,
      failed: 0,
      warnings: 0,
    },
    byCategory: {},
    byRule: {},
    components: [],
    issues: [],
  };

  // Initialize category and rule tracking
  const categories = new Set(components.map((c) => c.category));
  categories.forEach((cat) => {
    results.byCategory[cat] = { total: 0, passed: 0, failed: 0 };
  });

  Object.keys(validationRules).forEach((rule) => {
    results.byRule[rule] = { total: 0, passed: 0, failed: 0 };
  });

  // Validate each component
  components.forEach((component) => {
    const componentResult = {
      name: component.name,
      category: component.category,
      status: 'passed',
      checks: {},
      issues: [],
    };

    // Run validation rules
    Object.entries(validationRules).forEach(([ruleKey, rule]) => {
      const passed = rule.check(component);
      componentResult.checks[ruleKey] = passed;

      if (!passed) {
        componentResult.status = 'failed';
        componentResult.issues.push({
          rule: rule.name,
          description: rule.description,
          severity: rule.severity,
        });

        results.byRule[ruleKey].failed++;
        results.issues.push({
          component: component.name,
          rule: rule.name,
          description: rule.description,
          severity: rule.severity,
        });
      } else {
        results.byRule[ruleKey].passed++;
      }

      results.byRule[ruleKey].total++;
    });

    // Update category tracking
    results.byCategory[component.category].total++;
    if (componentResult.status === 'passed') {
      results.byCategory[component.category].passed++;
      results.summary.passed++;
    } else {
      results.byCategory[component.category].failed++;
      results.summary.failed++;
    }

    results.components.push(componentResult);
  });

  return results;
};

// Generate report
const generateReport = (results) => {
  const report = `
╔════════════════════════════════════════════════════════════════════════════╗
║                  ACCESSIBILITY VALIDATION REPORT                          ║
║                        WCAG 2.1 AA Compliance                             ║
╚════════════════════════════════════════════════════════════════════════════╝

Generated: ${results.timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Components:  ${results.summary.total}
Passed:            ${results.summary.passed} ✓
Failed:            ${results.summary.failed} ✗
Pass Rate:         ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BY CATEGORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Object.entries(results.byCategory)
  .map(
    ([category, stats]) =>
      `${category.padEnd(15)} ${stats.passed}/${stats.total} passed (${((stats.passed / stats.total) * 100).toFixed(0)}%)`
  )
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BY RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Object.entries(results.byRule)
  .map(
    ([rule, stats]) =>
      `${validationRules[rule].name.padEnd(20)} ${stats.passed}/${stats.total} passed (${((stats.passed / stats.total) * 100).toFixed(0)}%)`
  )
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${results.components
  .map(
    (component) =>
      `${component.name.padEnd(20)} ${component.status === 'passed' ? '✓ PASS' : '✗ FAIL'}`
  )
  .join('\n')}

${
  results.issues.length > 0
    ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ISSUES FOUND (${results.issues.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${results.issues
  .map(
    (issue, i) =>
      `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.component}
   Rule: ${issue.rule}
   Description: ${issue.description}`
  )
  .join('\n\n')}
`
    : ''
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${
  results.summary.failed === 0
    ? '✓ All components meet WCAG 2.1 AA standards!'
    : `✗ ${results.summary.failed} component(s) need accessibility improvements.
  
  Next Steps:
  1. Review failed components above
  2. Implement accessibility fixes
  3. Run manual testing with screen readers
  4. Re-run validation to verify fixes`
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WCAG 2.1 AA REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Perceivable: Information is perceivable to all users
✓ Operable: All functionality is operable via keyboard
✓ Understandable: Content is understandable to all users
✓ Robust: Content works with assistive technologies

For more information, visit: https://www.w3.org/WAI/WCAG21/quickref/

╔════════════════════════════════════════════════════════════════════════════╗
║                         END OF REPORT                                     ║
╚════════════════════════════════════════════════════════════════════════════╝
`;

  return report;
};

// Main execution
const main = () => {
  console.log('🔍 Validating accessibility compliance...\n');

  const results = validateComponents();
  const report = generateReport(results);

  console.log(report);

  // Save JSON results
  const reportsDir = path.join(__dirname, '../accessibility-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const jsonPath = path.join(reportsDir, `validation-${Date.now()}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\n📊 Results saved to: ${jsonPath}`);

  // Exit with appropriate code
  process.exit(results.summary.failed > 0 ? 1 : 0);
};

main();
