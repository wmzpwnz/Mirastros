import { describe, it, expect } from 'vitest';
import { contexts, energies, getReading } from './matrixReading';

describe('Matrix reading catalogue', () => {
  it('covers every supported position for all 22 energies without empty readings', () => {
    expect(Object.keys(contexts)).toHaveLength(19);
    expect(energies).toHaveLength(22);
    for (const key of Object.keys(contexts)) for (let value = 1; value <= 22; value++) {
      const reading = getReading(key, value)!;
      for (const text of Object.values(reading)) expect(text.length).toBeGreaterThan(3);
    }
  });
  it('gives the same energy a different context in each position', () => {
    const readings = Object.keys(contexts).map(key => getReading(key, 9)!);
    expect(new Set(readings.map(r => r.opportunity)).size).toBe(19);
    expect(new Set(readings.map(r => r.question)).size).toBe(19);
  });
  it('does not invent interpretations for unsupported data', () => {
    expect(getReading('money', 9)).toBeNull();
    expect(getReading('core', 0)).toBeNull();
    expect(getReading('core', 23)).toBeNull();
  });
});
