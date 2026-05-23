'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { Horoscope } from '../types';
import type { HeroDensity } from './hero/heroDensity';

interface CompactHoroscopeBlockProps {
  horoscopes: {
    daily: Horoscope | null;
    weekly: Horoscope | null;
    monthly: Horoscope | null;
  };
  loading: boolean;
  density: HeroDensity;
  onViewFull: (period: 'daily' | 'weekly' | 'monthly') => void;
  tier: string;
  luckyNumbers?: number[];
  luckyColors?: string[];
}

const PERIOD_LABELS = {
  daily: { emoji: '📅', name: 'Сегодня', short: 'сегодня' },
  weekly: { emoji: '📆', name: 'Неделя', short: 'неделю' },
  monthly: { emoji: '📆', name: 'Месяц', short: 'месяц' },
};

const sanitizePrediction = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[*_~#[\]()]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

export const CompactHoroscopeBlock: React.FC<CompactHoroscopeBlockProps> = ({
  horoscopes,
  loading,
  density,
  onViewFull,
  tier,
  luckyNumbers,
  luckyColors
}) => {
  const availableByDensity: Array<'daily' | 'weekly' | 'monthly'> =
    density === 'comfort'
      ? ['daily', 'weekly', 'monthly']
      : density === 'compact'
      ? ['daily', 'weekly', 'monthly']
      : ['daily'];

  const isUltra = density === 'ultra';
  const predictionMaxLength =
    density === 'comfort' ? 180 : density === 'compact' ? 140 : 95;
  const predictionClampClass =
    density === 'comfort' ? 'line-clamp-4' : density === 'compact' ? 'line-clamp-3' : 'line-clamp-2';
  const [expandedPeriod, setExpandedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!availableByDensity.includes(expandedPeriod)) {
      setExpandedPeriod('daily');
    }
  }, [availableByDensity, expandedPeriod]);

  useEffect(() => {
    if (tier === 'freemium' && (horoscopes.weekly || horoscopes.monthly)) {
      console.info('[metrics] horoscope_paywall_shown', { source: 'compact_block' });
    }
  }, [tier, horoscopes.weekly, horoscopes.monthly]);

  // Animate content expansion/collapse
  useEffect(() => {
    Object.entries(contentRefs.current).forEach(([period, element]) => {
      if (!element) return;

      const isExpanded = expandedPeriod === period;
      gsap.to(element, {
        height: isExpanded ? 'auto' : 0,
        opacity: isExpanded ? 1 : 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });
    });
  }, [expandedPeriod]);

  const getShortText = (prediction: string, maxLength = 120): string => {
    if (prediction.length <= maxLength) return prediction;
    const truncated = prediction.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  if (loading) {
    return (
      <div className="mira-card p-7">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/2" />
          <div className="h-24 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="hero-card hero-panel-card hero-horoscope-card bg-white/5 p-4 sm:p-5 xl:p-6 2xl:p-8 rounded-xl border border-white/10 backdrop-blur-sm flex flex-col h-full min-w-0 overflow-x-hidden">
      <h3 className="text-lg sm:text-xl mb-3 text-white font-bold uppercase tracking-wider flex items-center gap-2">
        <span className="text-mirastros-gold">🌟</span> Гороскоп
      </h3>

      {/* Accordion for periods */}
      <div className="hero-panel-body">
        <div className={`hero-horoscope-list min-w-0 ${density === 'compact' ? 'space-y-1.5' : 'space-y-2'}`}>
        {availableByDensity.map((period) => {
          const horoscope = horoscopes[period];
          const label = PERIOD_LABELS[period];
          const isExpanded = expandedPeriod === period;
          const lockedByTier = period !== 'daily' && tier === 'freemium';
          const isAvailable = horoscope !== null && !lockedByTier;
          const periodLabel = horoscope?.periodRangeLabel || '';
          const predictionText = sanitizePrediction(horoscope?.plainText || horoscope?.prediction || '');

          return (
            <div
              key={period}
              data-period={period}
              className={`
                hero-horoscope-period hero-horoscope-period-${period}
                border rounded-lg overflow-hidden transition-all duration-300 min-w-0
                ${isExpanded ? 'border-mirastros-gold/50 bg-white/5 shadow-[0_0_18px_rgba(212,175,55,0.18)]' : 'border-white/10 bg-black/20'}
                ${!isAvailable ? 'opacity-50' : ''}
              `}
            >
              {/* Header */}
              <button
                onClick={() => {
                  if (lockedByTier) {
                    console.info('[metrics] horoscope_paywall_shown', { source: 'compact_block', period });
                    return;
                  }
                  if (isAvailable) {
                    console.info('[metrics] horoscope_period_opened', { period });
                    // Toggle: if already expanded and it's not daily, collapse to daily
                    // If already expanded and it's daily, do nothing (keep daily open)
                    // Otherwise expand the clicked period
                    if (isExpanded) {
                      if (period !== 'daily') {
                        setExpandedPeriod('daily');
                      }
                    } else {
                      setExpandedPeriod(period);
                    }
                  }
                }}
                disabled={!isAvailable && !lockedByTier}
                className={`
                  w-full px-4 py-3 flex items-center justify-between min-w-0
                  ${isAvailable || lockedByTier ? 'cursor-pointer hover:bg-white/5' : 'cursor-not-allowed'}
                  transition-colors
                `}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{label.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-white font-medium text-sm sm:text-base tracking-wide truncate block">{label.name}</span>
                    {periodLabel && (
                      <span className="text-[10px] sm:text-xs text-white opacity-70 tracking-wide truncate block">
                        {periodLabel}
                      </span>
                    )}
                  </div>
                  {!isAvailable && period !== 'daily' && (
                    <span className="text-xs sm:text-sm text-white opacity-60 ml-2 tracking-wide flex-shrink-0">(Premium)</span>
                  )}
                </div>
                {isAvailable && (
                  <span className={`text-mirastros-gold transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                )}
              </button>

              {isAvailable && horoscope && density === 'compact' && !isExpanded && (
                <div className="px-4 pb-2">
                  <p className="text-white text-xs line-clamp-1 tracking-wide opacity-80">
                    {getShortText(predictionText, 72)}
                  </p>
                </div>
              )}

              {/* Content */}
              {isAvailable && horoscope && (
                <div
                  ref={(el) => {
                    contentRefs.current[period] = el;
                  }}
                  className={`px-4 overflow-hidden min-w-0 ${
                    density === 'compact' ? 'pb-3' : 'pb-4'
                  }`}
                  style={{
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0,
                  }}
                >
                  <p className={`text-white text-sm sm:text-base mb-3 ${predictionClampClass} leading-relaxed tracking-wide break-words opacity-90`}>
                    {getShortText(predictionText, predictionMaxLength)}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewFull(period)}
                      className="mira-button text-sm sm:text-base flex-1"
                    >
                      Читать {label.short} →
                    </button>
                    <button
                      onClick={() => onViewFull(period)}
                      className="px-3 py-2 rounded-lg border border-white/20 text-silver/90 text-xs sm:text-sm hover:border-mirastros-gold/60 hover:text-white transition"
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Lucky Numbers & Colors */}
      {(luckyNumbers && luckyNumbers.length > 0) || (luckyColors && luckyColors.length > 0) ? (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex flex-row gap-4 sm:gap-6 flex-wrap">
            {luckyNumbers && luckyNumbers.length > 0 && (
              <div className="min-w-0 flex-1 sm:flex-initial">
                <p className="text-white text-[10px] sm:text-xs mb-1.5 sm:mb-2 font-medium flex items-center gap-1 sm:gap-1.5 tracking-wide">
                  <span className="text-xs sm:text-sm flex-shrink-0 text-mirastros-gold">🍀</span>
                  <span className="uppercase tracking-wider text-[10px] sm:text-xs">Числа</span>
                </p>
                <div className="flex gap-1 sm:gap-1.5 flex-wrap">
                  {luckyNumbers.slice(0, 5).map((num, i) => (
                    <span
                      key={i}
                      className="mira-chip-gold text-[9px] sm:text-[10px]"
                      style={{ minWidth: 'clamp(1.5rem, 4vw, 2rem)' }}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {luckyColors && luckyColors.length > 0 && (
              <div className="min-w-0 flex-1 sm:flex-initial">
                <p className="text-white text-[10px] sm:text-xs mb-1.5 sm:mb-2 font-medium flex items-center gap-1 sm:gap-1.5 tracking-wide">
                  <span className="text-xs sm:text-sm flex-shrink-0 text-mirastros-gold">🎨</span>
                  <span className="uppercase tracking-wider text-[10px] sm:text-xs">Цвета</span>
                </p>
                <div className="flex gap-1 sm:gap-1.5 flex-wrap overflow-x-auto overflow-y-hidden">
                  {luckyColors.slice(0, 5).map((color, i) => (
                    <span
                      key={i}
                      className="mira-chip-neutral flex-shrink-0 text-[9px] sm:text-[10px]"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
