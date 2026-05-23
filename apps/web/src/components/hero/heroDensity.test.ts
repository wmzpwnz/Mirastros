import { describe, expect, it } from 'vitest';
import { resolveHeroDensity } from './heroDensity';

describe('resolveHeroDensity', () => {
  it('returns comfort for 1920x1080', () => {
    expect(resolveHeroDensity({ width: 1920, height: 1080 })).toBe('comfort');
  });

  it('returns compact for 1366x768', () => {
    expect(resolveHeroDensity({ width: 1366, height: 768 })).toBe('compact');
  });

  it('returns compact for 1280x720 on wide desktop', () => {
    expect(resolveHeroDensity({ width: 1280, height: 720 })).toBe('compact');
  });

  it('keeps wide desktop in compact even at low height', () => {
    expect(resolveHeroDensity({ width: 1366, height: 640 })).toBe('compact');
  });

  it('keeps comfort within hysteresis window', () => {
    expect(
      resolveHeroDensity({ width: 1270, height: 880 }, 'comfort')
    ).toBe('comfort');
  });

  it('downgrades comfort to compact when crossing hysteresis', () => {
    expect(
      resolveHeroDensity({ width: 1230, height: 850 }, 'comfort')
    ).toBe('compact');
  });

  it('forces compact on wide desktop instead of ultra hysteresis', () => {
    expect(resolveHeroDensity({ width: 1290, height: 780 }, 'ultra')).toBe(
      'compact'
    );
  });

  it('upgrades ultra to compact after leaving hysteresis', () => {
    expect(resolveHeroDensity({ width: 1366, height: 820 }, 'ultra')).toBe(
      'compact'
    );
  });

  it('upgrades compact to comfort after strong resize', () => {
    expect(resolveHeroDensity({ width: 1312, height: 932 }, 'compact')).toBe(
      'comfort'
    );
  });

  it('keeps compact on wide desktop after strong resize', () => {
    expect(resolveHeroDensity({ width: 1220, height: 790 }, 'compact')).toBe(
      'compact'
    );
  });
});
