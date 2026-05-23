'use client';

import React from 'react';
import type { User, NatalChart } from '../../types';
import type { HeroDensity } from '../hero/heroDensity';
import { NatalChartWheel } from '../natal/NatalChartWheel';
import {
  calculateElements,
  calculateModalities,
  getRetrogradePlanets,
  getDominantPlanet,
} from '../../utils/natalChart';
import { ZODIAC_SIGNS, ZODIAC_KEYS } from '../../constants/zodiac';

interface NatalChartBlockProps {
  natalChart: NatalChart | null;
  user: User;
  loading: boolean;
  density: HeroDensity;
  onViewFull: () => void;
}

export const NatalChartBlock: React.FC<NatalChartBlockProps> = ({
  natalChart,
  user,
  loading,
  density,
  onViewFull,
}) => {
  const isCompact = density === 'compact';
  const isUltra = density === 'ultra';

  if (loading) {
    return (
      <div className="hero-card mira-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/2" />
          <div className="h-32 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (!natalChart) {
    const missingBirthData = !user.birthTime || !user.birthLocation;
    return (
      <div className="hero-card mira-card mira-card-hover p-5 h-full flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-3 opacity-50">⭐</div>
        <h3 className="hero-title-main mira-card-title mb-2">Натальная карта</h3>
        <p className="hero-body text-silver/70 text-sm mb-3 tracking-wide">
          {missingBirthData
            ? 'Заполните время и место рождения, чтобы построить круг.'
            : 'Карта ещё не рассчитана'}
        </p>
        <button
          onClick={onViewFull}
          className="mira-button max-w-[260px] text-sm"
        >
          {missingBirthData
            ? 'Заполнить данные →'
            : 'Рассчитать натальную карту →'}
        </button>
      </div>
    );
  }

  const elements = calculateElements(natalChart.planets);
  const modalities = calculateModalities(natalChart.planets);
  const retrogradePlanets = getRetrogradePlanets(natalChart.planets);
  const dominant = getDominantPlanet(natalChart.planets);

  // Russian planet names
  const PLANET_NAMES_RU: Record<string, string> = {
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

  return (
    <div className="hero-card hero-panel-card hero-natal-card hero-natal-layout mira-card mira-card-hover p-4 sm:p-5 h-full flex flex-col">
      <h3 className="hero-title-main mira-card-title text-lg sm:text-xl mb-3">
        ⭐ Натальная карта
      </h3>

      <div className="hero-panel-body hero-natal-body flex-1 flex flex-col">
        {/* Круг натальной карты */}
        <div className="hero-wheel hero-natal-wheel hero-natal-wheel-frame mb-3 mira-subcard flex items-center justify-center relative overflow-hidden max-w-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-white/5">
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <NatalChartWheel
              chart={natalChart as any}
              variant="mini"
              className="w-full h-full max-w-full max-h-full opacity-95"
            />
          </div>

          {/* Элементы - компактно в углах */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 backdrop-blur-md bg-black/60 rounded-lg p-1.5 border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-red-400">🔥</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-10 sm:w-12">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${elements.fire}%` }} />
              </div>
              <span className="text-white/90 font-medium text-[9px] sm:text-[10px] min-w-[28px]">{elements.fire}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-yellow-500">🌍</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-10 sm:w-12">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${elements.earth}%` }} />
              </div>
              <span className="text-white/90 font-medium text-[9px] sm:text-[10px] min-w-[28px]">{elements.earth}%</span>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col gap-1 backdrop-blur-md bg-black/60 rounded-lg p-1.5 border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-blue-400">💨</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-10 sm:w-12">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${elements.air}%` }} />
              </div>
              <span className="text-white/90 font-medium text-[9px] sm:text-[10px] min-w-[28px]">{elements.air}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-cyan-400">💧</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-10 sm:w-12">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${elements.water}%` }} />
              </div>
              <span className="text-white/90 font-medium text-[9px] sm:text-[10px] min-w-[28px]">{elements.water}%</span>
            </div>
          </div>
        </div>

        {/* Новые блоки: модальности / доминанта / ретроградные */}
        {!isUltra && (
          <div className="hero-natal-insights mb-2">
            {/* Ретроградные планеты */}
            {retrogradePlanets.length > 0 && (
              <div className="hero-natal-insight hero-natal-retro bg-purple-900/20 p-2 rounded border border-purple-500/20">
                <div className="text-[10px] text-purple-300/80 mb-1 uppercase tracking-wider">Ретроградные</div>
                <div className="hero-natal-retro-text text-xs text-white/90">
                  {retrogradePlanets
                    .map((p) => PLANET_NAMES_RU[p] || p)
                    .join(', ')}
                </div>
              </div>
            )}

            {/* Доминанта */}
            {dominant && (
              <div className="hero-natal-insight hero-natal-dominant bg-mirastros-gold/10 p-2 rounded border border-mirastros-gold/20">
                <div className="text-[10px] text-mirastros-gold/80 mb-1 uppercase tracking-wider">Доминанта</div>
                <div className="text-xs text-white font-medium">
                  {(() => {
                    const planetName = PLANET_NAMES_RU[dominant.planet.toLowerCase()] || dominant.planet;
                    const signName = ZODIAC_SIGNS[ZODIAC_KEYS[dominant.signIndex] || 'aries']?.name || '—';
                    return `${planetName} в ${signName}`;
                  })()}
                </div>
              </div>
            )}

            {/* Модальности */}
            <div className="hero-natal-insight bg-white/3 p-2 rounded border border-white/5">
              <div className="text-[10px] text-silver/60 mb-1 uppercase tracking-wider">Модальности</div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-center">
                  <div className="text-[9px] text-silver/70 mb-0.5">Кард.</div>
                  <div className="text-xs font-semibold text-white">{modalities.cardinal}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-silver/70 mb-0.5">Фикс.</div>
                  <div className="text-xs font-semibold text-white">{modalities.fixed}%</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-silver/70 mb-0.5">Мутаб.</div>
                  <div className="text-xs font-semibold text-white">{modalities.mutable}%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onViewFull}
        className="hero-panel-footer mira-button text-xs sm:text-sm mt-auto"
      >
        Полный анализ →
      </button>
    </div>
  );
};
