'use client';

import React, { useState, useEffect } from 'react';
import type { Horoscope } from '../../types';
import { generateLifeAreaRatings } from '../../utils/horoscope';

interface HoroscopeBlockProps {
  horoscope: Horoscope | null;
  tier: string;
  loading: boolean;
  onViewFull: () => void;
  onUpgrade: () => void;
}

export const HoroscopeBlock: React.FC<HoroscopeBlockProps> = ({
  horoscope,
  tier,
  loading,
  onViewFull,
  onUpgrade,
}) => {
  const [ratings, setRatings] = useState<{
    finance: number;
    love: number;
    career: number;
    health: number;
  } | null>(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  useEffect(() => {
    if (horoscope && tier !== 'freemium' && !ratings) {
      setRatingsLoading(true);
      generateLifeAreaRatings(horoscope.prediction, horoscope.sign, tier)
        .then((r) => {
          setRatings(r);
          setRatingsLoading(false);
        })
        .catch(() => setRatingsLoading(false));
    }
  }, [horoscope, tier, ratings]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/2" />
          <div className="h-24 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (tier === 'freemium') {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-cinzel font-bold text-white mb-4">
          🌟 Гороскоп на сегодня
        </h3>
        {horoscope ? (
          <>
            <p className="text-silver/70 text-sm mb-4 line-clamp-3">
              {horoscope.prediction}
            </p>
            <div className="bg-black/30 rounded-lg p-4 mb-4 blur-sm relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-silver/50 text-xs">🔒 PREMIUM контент</p>
              </div>
              <p className="text-transparent text-xs">💰 Финансы: ⭐⭐⭐⭐</p>
              <p className="text-transparent text-xs">❤️ Любовь: ⭐⭐⭐⭐⭐</p>
              <p className="text-transparent text-xs">💼 Карьера: ⭐⭐⭐</p>
            </div>
            <button
              onClick={onUpgrade}
              className="w-full py-2 px-4 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black rounded-lg transition text-sm font-semibold"
            >
              Обновить Premium 💎
            </button>
          </>
        ) : (
          <p className="text-silver/70 text-sm">Загрузка гороскопа...</p>
        )}
      </div>
    );
  }

  if (!horoscope) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-cinzel font-bold text-white mb-4">
          🌟 Гороскоп на сегодня
        </h3>
        <p className="text-silver/70 text-sm">Загрузка гороскопа...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
      <h3 className="text-xl font-cinzel font-bold text-white mb-4">
        {tier === 'platinum'
          ? '🌟 Персональный гороскоп'
          : '🌟 Гороскоп на сегодня'}
      </h3>
      <p className="text-silver/80 text-sm mb-4 line-clamp-4">
        {horoscope.prediction}
      </p>

      {/* Ratings/lucky data intentionally removed here to avoid duplication with top ratings block */}

      <button
        onClick={onViewFull}
        className="w-full py-2 px-4 bg-mirastros-gold/20 hover:bg-mirastros-gold/30 border border-mirastros-gold/50 text-mirastros-gold rounded-lg transition text-sm font-semibold"
      >
        Читать детально →
      </button>
    </div>
  );
};
