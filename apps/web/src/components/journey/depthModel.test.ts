import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { journeyModules } from './catalog';
import { activePortal, endingOpacity, portalFrame, projectedScale, sceneMetrics } from './depthModel';

describe('continuous depth gallery', () => {
  it.each([390, 1024, 1440])('moves separate planes together at width %i', width => {
    const { spacing, perspective } = sceneMetrics(width);
    const front = portalFrame(0, 1.9, width);
    const next = portalFrame(1, 1.9, width);
    expect(front.z - next.z).toBeCloseTo(spacing);
    expect(front.visible && next.visible).toBe(true);
    expect(front.opacity).toBe(1);
    expect(next.opacity).toBe(1);
    expect(projectedScale(front.z, perspective)).toBeGreaterThan(projectedScale(next.z, perspective));
    expect(portalFrame(0, 2, width).z - front.z).toBeCloseTo(portalFrame(1, 2, width).z - next.z);
    expect(portalFrame(0, 2.1, width).visible).toBe(false);
    expect(portalFrame(1, 2.1, width).visible).toBe(true);
  });
  it('has no empty gaps in the module journey', () => {
    for (let screens = .8; screens < journeyModules.length + .95; screens += .05) {
      expect(journeyModules.some((_, index) => portalFrame(index, screens, 390).visible)).toBe(true);
    }
  });
  it('keeps a focused phone portal inside the viewport', () => {
    const width = 390, cardWidth = width * .58;
    const { offset } = sceneMetrics(width);
    expect(width / 2 - offset - cardWidth / 2).toBeGreaterThan(0);
    expect(width / 2 + offset + cardWidth / 2).toBeLessThan(width);
  });
  it('bounds navigation and reveals the ending after the last portal', () => {
    expect(activePortal(-1, journeyModules.length)).toBe(0);
    expect(activePortal(100, journeyModules.length)).toBe(journeyModules.length - 1);
    expect(endingOpacity(journeyModules.length, journeyModules.length)).toBe(0);
    expect(endingOpacity(journeyModules.length + 1.8, journeyModules.length)).toBe(1);
  });
  it('only links existing routes and project-owned poster assets', () => {
    expect(new Set(journeyModules.map(item => item.id)).size).toBe(journeyModules.length);
    const directory = dirname(fileURLToPath(import.meta.url));
    for (const item of journeyModules) {
      const route = resolve(directory, `../../app${item.href}/page.tsx`);
      expect(existsSync(route), route).toBe(true);
      expect(existsSync(resolve(directory, `../../../public/images/portals/${item.id}.webp`))).toBe(true);
    }
  });
});
