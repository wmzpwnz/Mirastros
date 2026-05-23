/**
 * Natal Chart Utilities
 * Helper functions for natal chart calculations and analysis
 */

import type { NatalChart } from '../types';
import { ZODIAC_KEYS, ZODIAC_SIGNS } from '../constants/zodiac';

/**
 * Convert zodiac sign name to index (0-11)
 * Supports full names and abbreviations
 */
export const signToNum = (sign: string): number => {
  const raw = (sign || '').trim().toLowerCase();
  if (!raw) return 0;

  const full = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];
  const idxFull = full.indexOf(raw);
  if (idxFull >= 0) return idxFull;

  const three = raw.slice(0, 3);
  const abbr: Record<string, number> = {
    ari: 0,
    tau: 1,
    gem: 2,
    can: 3,
    leo: 4,
    vir: 5,
    lib: 6,
    sco: 7,
    sag: 8,
    cap: 9,
    aqu: 10,
    pis: 11,
  };
  return abbr[three] ?? 0;
};

/**
 * Get element from zodiac sign
 */
const getElementFromSign = (sign: string): string => {
  const idx = signToNum(sign);
  if ([0, 4, 8].includes(idx)) return 'fire';
  if ([1, 5, 9].includes(idx)) return 'earth';
  if ([2, 6, 10].includes(idx)) return 'air';
  if ([3, 7, 11].includes(idx)) return 'water';
  return 'unknown';
};

/**
 * Calculate element distribution in natal chart
 * Returns percentages for fire, earth, air, water
 */
export const calculateElements = (planets: NatalChart['planets']) => {
  const elements = { fire: 0, earth: 0, air: 0, water: 0 };
  Object.values(planets).forEach((planet) => {
    const element = getElementFromSign(planet.sign);
    if (element !== 'unknown') {
      elements[element as keyof typeof elements]++;
    }
  });
  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  return {
    fire: total > 0 ? Math.round((elements.fire / total) * 100) : 0,
    earth: total > 0 ? Math.round((elements.earth / total) * 100) : 0,
    air: total > 0 ? Math.round((elements.air / total) * 100) : 0,
    water: total > 0 ? Math.round((elements.water / total) * 100) : 0,
  };
};

/**
 * Calculate modality distribution (Cardinal, Fixed, Mutable)
 */
export const calculateModalities = (planets: NatalChart['planets']) => {
  const modalities = { cardinal: 0, fixed: 0, mutable: 0 };
  Object.values(planets).forEach((planet) => {
    const idx = signToNum(planet.sign);
    // Cardinal: Aries (0), Cancer (3), Libra (6), Capricorn (9)
    if ([0, 3, 6, 9].includes(idx)) modalities.cardinal++;
    // Fixed: Taurus (1), Leo (4), Scorpio (7), Aquarius (10)
    else if ([1, 4, 7, 10].includes(idx)) modalities.fixed++;
    // Mutable: Gemini (2), Virgo (5), Sagittarius (8), Pisces (11)
    else if ([2, 5, 8, 11].includes(idx)) modalities.mutable++;
  });
  const total = Object.values(modalities).reduce((a, b) => a + b, 0);
  return {
    cardinal: total > 0 ? Math.round((modalities.cardinal / total) * 100) : 0,
    fixed: total > 0 ? Math.round((modalities.fixed / total) * 100) : 0,
    mutable: total > 0 ? Math.round((modalities.mutable / total) * 100) : 0,
  };
};

/**
 * Get ascendant ruler planet
 * Returns planet name and Russian label
 */
export const getAscendantRuler = (
  ascendantSign: string,
  planets: NatalChart['planets']
): { planet: string; label: string } | null => {
  const signIdx = signToNum(ascendantSign);
  // Rulership: Aries→Mars, Taurus→Venus, Gemini→Mercury, Cancer→Moon, Leo→Sun, Virgo→Mercury
  // Libra→Venus, Scorpio→Mars/Pluto, Sagittarius→Jupiter, Capricorn→Saturn, Aquarius→Uranus/Saturn, Pisces→Neptune/Jupiter
  const rulers: Record<number, string[]> = {
    0: ['mars'], // Aries
    1: ['venus'], // Taurus
    2: ['mercury'], // Gemini
    3: ['moon'], // Cancer
    4: ['sun'], // Leo
    5: ['mercury'], // Virgo
    6: ['venus'], // Libra
    7: ['mars', 'pluto'], // Scorpio
    8: ['jupiter'], // Sagittarius
    9: ['saturn'], // Capricorn
    10: ['uranus', 'saturn'], // Aquarius
    11: ['neptune', 'jupiter'], // Pisces
  };
  const planetNames = rulers[signIdx] || [];
  const ruNames: Record<string, string> = {
    sun: 'Солнце',
    moon: 'Луна',
    mercury: 'Меркурий',
    venus: 'Венера',
    mars: 'Марс',
    jupiter: 'Юпитер',
    saturn: 'Сатурн',
    uranus: 'Уран',
    neptune: 'Нептун',
    pluto: 'Плутон',
  };
  for (const p of planetNames) {
    if (planets[p]) {
      return { planet: p, label: ruNames[p] || p };
    }
  }
  return null;
};

/**
 * Get list of retrograde planets
 */
export const getRetrogradePlanets = (planets: NatalChart['planets']): string[] => {
  const retrograde: string[] = [];
  Object.entries(planets).forEach(([name, planet]) => {
    if (planet.retrograde) {
      retrograde.push(name);
    }
  });
  return retrograde;
};

/**
 * Get dominant planet (most planets in same sign)
 */
export const getDominantPlanet = (
  planets: NatalChart['planets']
): { planet: string; signIndex: number } | null => {
  const signCounts: Record<number, { count: number; planets: string[] }> = {};
  Object.entries(planets).forEach(([name, planet]) => {
    const idx = signToNum(planet.sign);
    if (!signCounts[idx]) {
      signCounts[idx] = { count: 0, planets: [] };
    }
    signCounts[idx].count++;
    signCounts[idx].planets.push(name);
  });

  let maxCount = 0;
  let dominant: { planet: string; signIndex: number } | null = null;
  Object.entries(signCounts).forEach(([idxStr, data]) => {
    if (data.count > maxCount) {
      maxCount = data.count;
      dominant = {
        planet: data.planets[0],
        signIndex: Number(idxStr),
      };
    }
  });

  return dominant;
};

/**
 * Convert sign + degree to absolute degree (0–360), then to SVG x,y coordinates
 * 0° Aries = 9 o'clock position
 */
export const degreeInSignToXY = (
  sign: string,
  degree: number,
  cx: number,
  cy: number,
  r: number
): { x: number; y: number } => {
  const absoluteDegree = signToNum(sign) * 30 + (degree ?? 0);
  const angleRad = ((180 - absoluteDegree) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
};
