import { describe, it, expect } from 'vitest';
import { colors } from './colors';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { breakpointValues } from './breakpoints';
import { fonts, fontSizes, fontWeights, lineHeights } from './typography';
import { easings } from './animations';

describe('Design Tokens', () => {
  describe('Color Tokens', () => {
    it('should have cosmic color defined', () => {
      expect(colors.cosmic).toBe('#050505');
    });

    it('should have all background colors', () => {
      expect(colors.background.primary).toBe('#050505');
      expect(colors.background.secondary).toBe('#0a0a0a');
      expect(colors.background.tertiary).toBe('#1a103c');
    });

    it('should have all text colors', () => {
      expect(colors.text.primary).toBe('#FFFFFF');
      expect(colors.text.secondary).toBe('#C0C0C0');
      expect(colors.text.accent).toBe('#FFD700');
    });

    it('should have all status colors', () => {
      expect(colors.status.success).toBe('#10B981');
      expect(colors.status.warning).toBe('#F59E0B');
      expect(colors.status.error).toBe('#EF4444');
      expect(colors.status.info).toBe('#3B82F6');
    });
  });

  describe('Spacing Tokens', () => {
    it('should have 8px base unit system', () => {
      expect(spacing['0']).toBe('0');
      expect(spacing['2']).toBe('0.5rem'); // 8px
      expect(spacing['4']).toBe('1rem'); // 16px
      expect(spacing['8']).toBe('2rem'); // 32px
    });

    it('should have all spacing values', () => {
      const spacingKeys = Object.keys(spacing);
      expect(spacingKeys.length).toBeGreaterThan(0);
      expect(spacingKeys).toContain('0');
      expect(spacingKeys).toContain('4');
      expect(spacingKeys).toContain('24');
    });
  });

  describe('Shadow Tokens', () => {
    it('should have elevation system', () => {
      expect(shadows.sm).toBeDefined();
      expect(shadows.md).toBeDefined();
      expect(shadows.lg).toBeDefined();
      expect(shadows.xl).toBeDefined();
      expect(shadows['2xl']).toBeDefined();
    });

    it('should have valid shadow values', () => {
      expect(shadows.sm).toContain('rgba(0, 0, 0');
      expect(shadows.md).toContain('rgba(0, 0, 0');
    });
  });

  describe('Breakpoint Tokens', () => {
    it('should have all breakpoints', () => {
      expect(breakpointValues.mobile).toBe(320);
      expect(breakpointValues.tablet).toBe(768);
      expect(breakpointValues.desktop).toBe(1024);
      expect(breakpointValues.wide).toBe(1280);
      expect(breakpointValues.ultrawide).toBe(1536);
    });
  });

  describe('Typography Tokens', () => {
    it('should have font families', () => {
      expect(fonts.heading).toContain('Cinzel');
      expect(fonts.body).toContain('Inter');
    });

    it('should have all font sizes', () => {
      expect(fontSizes.xs).toBe('0.75rem');
      expect(fontSizes.base).toBe('1rem');
      expect(fontSizes['7xl']).toBe('4.5rem');
    });

    it('should have all font weights', () => {
      expect(fontWeights.light).toBe(300);
      expect(fontWeights.normal).toBe(400);
      expect(fontWeights.bold).toBe(700);
    });

    it('should have all line heights', () => {
      expect(lineHeights.none).toBe(1);
      expect(lineHeights.normal).toBe(1.5);
      expect(lineHeights.loose).toBe(2);
    });
  });

  describe('Animation Tokens', () => {
    it('should have easing functions', () => {
      expect(easings.easeIn).toBeDefined();
      expect(easings.easeOut).toBeDefined();
      expect(easings.easeInOut).toBeDefined();
      expect(easings.linear).toBe('linear');
    });
  });

  describe('Tailwind Configuration Integration', () => {
    it('should load tailwind preset without errors', () => {
      const config = require('../../tailwind.preset.js');
      expect(config).toBeDefined();
      expect(config.theme).toBeDefined();
    });

    it('should have colors in tailwind config', () => {
      const config = require('../../tailwind.preset.js');
      expect(config.theme.colors).toBeDefined();
      expect(config.theme.colors.cosmic).toBe('#050505');
      expect(config.theme.colors.gold).toBe('#FFD700');
    });

    it('should have spacing in tailwind config', () => {
      const config = require('../../tailwind.preset.js');
      expect(config.theme.spacing).toBeDefined();
      expect(config.theme.spacing['4']).toBe('1rem');
    });

    it('should have breakpoints in tailwind config', () => {
      const config = require('../../tailwind.preset.js');
      expect(config.theme.screens).toBeDefined();
      expect(config.theme.screens.mobile).toBe('320px');
      expect(config.theme.screens.tablet).toBe('768px');
    });

    it('should have shadows in tailwind config', () => {
      const config = require('../../tailwind.preset.js');
      expect(config.theme.boxShadow).toBeDefined();
      expect(config.theme.boxShadow.md).toBeDefined();
    });

    it('should have typography in tailwind config', () => {
      const config = require('../../tailwind.preset.js');
      expect(config.theme.fontFamily).toBeDefined();
      expect(config.theme.fontSize).toBeDefined();
      expect(config.theme.fontWeight).toBeDefined();
      expect(config.theme.lineHeight).toBeDefined();
    });
  });
});
