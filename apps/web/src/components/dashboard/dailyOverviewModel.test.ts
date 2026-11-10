import { describe, expect, it } from 'vitest';
import { dayInZone, forecastCopy, illuminationOf, lunarRhythm, nextMoonEvent, resolveTimeZone, resolveZodiac } from './dailyOverviewModel';
import type { DailyMoon } from './dailyOverviewModel';

const moon: DailyMoon = { date: '2026-11-10', phase: 'waxing_crescent', phase_name: 'Растущий серп', next_full_moon: '2026-11-24', next_new_moon: '2026-11-12' };

describe('daily overview data', () => {
  it('uses the profile timezone across a calendar-day boundary', () => {
    const now = new Date('2026-11-10T22:30:00Z');
    expect(dayInZone(now, 'Europe/Moscow')).toBe('2026-11-11');
    expect(dayInZone(now, 'America/New_York')).toBe('2026-11-10');
    expect(() => dayInZone(now, resolveTimeZone('invalid-zone'))).not.toThrow();
  });
  it('normalizes stored Russian and English zodiac names without inventing a sign', () => {
    expect(resolveZodiac('Скорпион')?.[0]).toBe('scorpio');
    expect(resolveZodiac(' Aries ')?.[1].name).toBe('Овен');
    expect(resolveZodiac('unknown')).toBeUndefined();
    expect(resolveZodiac(undefined)).toBeUndefined();
  });
  it('keeps real zero illumination and rejects missing or invalid values', () => {
    expect(illuminationOf({ ...moon, illumination: 0 })).toBe(0);
    expect(illuminationOf(moon)).toBeNull();
    expect(illuminationOf(null)).toBeNull();
    expect(illuminationOf({ ...moon, illumination: 101 })).toBeNull();
    expect(illuminationOf({ ...moon, illumination: NaN })).toBeNull();
  });
  it('selects the nearest event instead of always preferring the full moon', () => {
    expect(nextMoonEvent(moon, '2026-11-10')?.title).toBe('Новолуние');
    expect(nextMoonEvent(moon, '2026-11-12')?.date).toBe('2026-11-12');
    expect(nextMoonEvent(moon, '2026-11-13')?.title).toBe('Полнолуние');
    expect(nextMoonEvent(moon, '2026-11-25')).toBeNull();
    expect(nextMoonEvent({ ...moon, next_new_moon: '2026-02-30', next_full_moon: 'invalid' }, '2026-01-01')).toBeNull();
  });
  it('separates the focus, forecast and advice rather than duplicating a paragraph', () => {
    const result = forecastCopy({ date: moon.date, prediction: '**Начните с главного.** Оставьте время для отдыха.', advice: 'Выберите одно дело.' });
    expect(result.focus).toBe('Начните с главного.');
    expect(result.forecast).toBe('Оставьте время для отдыха.');
    expect(result.advice).toBe('Выберите одно дело.');
    expect(forecastCopy({ date: moon.date, prediction: 'Один ориентир.', advice: 'Один ориентир.' }).advice).toBe('');
  });
  it('does not derive energy from a fabricated illumination value', () => {
    expect(lunarRhythm(null)).toBeNull();
    expect(lunarRhythm({ ...moon, phase: 'unknown' })).toBeNull();
    expect(lunarRhythm(moon)?.title).toBe('Первые шаги');
  });
});
