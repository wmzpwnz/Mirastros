'use client';

import { useEffect, useRef, useState } from 'react';

export type HeroDensity = 'comfort' | 'compact' | 'ultra';

export interface HeroViewport {
  width: number;
  height: number;
}

export const HERO_DENSITY_DEBOUNCE_MS = 120;
export const HERO_DENSITY_HYSTERESIS_PX = 32;

const COMFORT_MIN_HEIGHT = 900;
const COMFORT_MIN_WIDTH = 1280;
const COMPACT_MIN_HEIGHT = 700;
const ULTRA_SECONDARY_HEIGHT = 840;
const WIDE_DESKTOP_MIN_WIDTH = 1200;

const clampToViewport = (value: number) =>
  Number.isFinite(value) && value > 0 ? value : 0;

export const getHeroViewport = (): HeroViewport => {
  if (typeof window === 'undefined') {
    return { width: COMFORT_MIN_WIDTH, height: COMFORT_MIN_HEIGHT };
  }

  const vv = window.visualViewport;
  const width = clampToViewport(vv?.width ?? window.innerWidth);
  const height = clampToViewport(vv?.height ?? window.innerHeight);

  return { width, height };
};

const classifyWithoutHysteresis = ({
  width,
  height,
}: HeroViewport): HeroDensity => {
  // On wide desktop layouts, keep hero in compact/comfort only.
  // Ultra mode is too aggressive there and hides too much UI.
  if (width >= WIDE_DESKTOP_MIN_WIDTH) {
    return height >= COMFORT_MIN_HEIGHT ? 'comfort' : 'compact';
  }

  if (
    height < COMPACT_MIN_HEIGHT ||
    (height < ULTRA_SECONDARY_HEIGHT && width < COMFORT_MIN_WIDTH)
  ) {
    return 'ultra';
  }

  if (
    (height >= COMPACT_MIN_HEIGHT && height <= COMFORT_MIN_HEIGHT - 1) ||
    (width >= 1024 && width <= COMFORT_MIN_WIDTH - 1)
  ) {
    return 'compact';
  }

  if (height >= COMFORT_MIN_HEIGHT && width >= COMFORT_MIN_WIDTH) {
    return 'comfort';
  }

  return 'compact';
};

export const resolveHeroDensity = (
  viewport: HeroViewport,
  prevDensity?: HeroDensity | null
): HeroDensity => {
  if (!prevDensity) {
    return classifyWithoutHysteresis(viewport);
  }

  const { width, height } = viewport;
  const h = HERO_DENSITY_HYSTERESIS_PX;

  if (width >= WIDE_DESKTOP_MIN_WIDTH) {
    if (prevDensity === 'comfort') {
      return height >= COMFORT_MIN_HEIGHT - h ? 'comfort' : 'compact';
    }
    return height >= COMFORT_MIN_HEIGHT + h ? 'comfort' : 'compact';
  }

  if (prevDensity === 'comfort') {
    if (height >= COMFORT_MIN_HEIGHT - h && width >= COMFORT_MIN_WIDTH - h) {
      return 'comfort';
    }
    return classifyWithoutHysteresis(viewport);
  }

  if (prevDensity === 'ultra') {
    const stayUltra =
      height < COMPACT_MIN_HEIGHT + h ||
      (height < ULTRA_SECONDARY_HEIGHT + h && width < COMFORT_MIN_WIDTH + h);
    if (stayUltra) return 'ultra';
    return classifyWithoutHysteresis(viewport);
  }

  const canUpgradeToComfort =
    height >= COMFORT_MIN_HEIGHT + h && width >= COMFORT_MIN_WIDTH + h;
  if (canUpgradeToComfort) return 'comfort';

  const canDowngradeToUltra =
    height < COMPACT_MIN_HEIGHT - h ||
    (height < ULTRA_SECONDARY_HEIGHT - h && width < COMFORT_MIN_WIDTH - h);
  if (canDowngradeToUltra) return 'ultra';

  return 'compact';
};

export const useHeroDensity = (): HeroDensity => {
  const [density, setDensity] = useState<HeroDensity>(() =>
    resolveHeroDensity(getHeroViewport())
  );
  const densityRef = useRef<HeroDensity>(density);

  useEffect(() => {
    densityRef.current = density;
  }, [density]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const updateDensity = () => {
      const next = resolveHeroDensity(getHeroViewport(), densityRef.current);
      if (next !== densityRef.current) {
        densityRef.current = next;
        setDensity(next);
      }
    };

    const scheduleUpdate = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(updateDensity, HERO_DENSITY_DEBOUNCE_MS);
    };

    updateDensity();

    window.addEventListener('resize', scheduleUpdate);
    window.visualViewport?.addEventListener('resize', scheduleUpdate);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', scheduleUpdate);
      window.visualViewport?.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  return density;
};
