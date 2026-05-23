'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface LifeAreaRatingsProps {
  ratings: {
    finance: number;
    love: number;
    career: number;
    health: number;
  } | null;
  explanations?: {
    financeReason?: string;
    loveReason?: string;
    careerReason?: string;
    healthReason?: string;
  } | null;
  loading?: boolean;
}

const RATING_COLORS = {
  finance: { from: '#FFD700', to: '#FFA500' }, // Gold to Orange
  love: { from: '#FF69B4', to: '#FF1493' }, // Pink to Deep Pink
  career: { from: '#4169E1', to: '#1E90FF' }, // Blue to Dodger Blue
  health: { from: '#32CD32', to: '#00FF00' }, // Green to Lime
};

const RATING_LABELS = {
  finance: { emoji: '💰', name: 'Финансы' },
  love: { emoji: '❤️', name: 'Любовь' },
  career: { emoji: '💼', name: 'Карьера' },
  health: { emoji: '🏥', name: 'Здоровье' },
};

export const LifeAreaRatings: React.FC<LifeAreaRatingsProps> = ({
  ratings,
  explanations = null,
  loading = false
}) => {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (ratings && barsRef.current.length > 0) {
      // Reset and animate progress bars
      barsRef.current.forEach((bar, index) => {
        if (bar) {
          const rating = Object.values(ratings)[index];
          const percentage = (rating / 5) * 100;
          
          // Reset width first
          gsap.set(bar, { width: '0%' });
          
          // Then animate
          gsap.to(bar, {
            width: `${percentage}%`,
            duration: 1.5,
            delay: index * 0.2,
            ease: 'power2.out'
          });
        }
      });
    }
  }, [ratings]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-3 bg-white/10 rounded w-1/2 mb-0.5" />
            <div className="h-2 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!ratings) {
    return (
      <div className="text-gray-400 text-xs sm:text-sm text-center py-4">
        {loading ? (
          <span>Загрузка рейтингов...</span>
        ) : (
          <span>Рейтинги будут доступны после загрузки гороскопа</span>
        )}
      </div>
    );
  }

  const getGradientColor = (rating: number, type: keyof typeof RATING_COLORS) => {
    const colors = RATING_COLORS[type];
    if (type === 'health') {
      if (rating <= 2) return `linear-gradient(to right, #ef4444, #dc2626)`;
      if (rating <= 3) return `linear-gradient(to right, #f59e0b, #fbbf24)`;
      return `linear-gradient(to right, #22c55e, #16a34a)`;
    }
    if (rating <= 2) {
      return `linear-gradient(to right, #dc2626, #ef4444)`;
    } else if (rating <= 3) {
      return `linear-gradient(to right, #f59e0b, #fbbf24)`;
    } else {
      return `linear-gradient(to right, ${colors.from}, ${colors.to})`;
    }
  };

  return (
    <div className="space-y-2.5">
      {(Object.entries(ratings) as [keyof typeof ratings, number][]).map(([key, rating], index) => {
        const label = RATING_LABELS[key];
        const explanationText = key === 'finance'
          ? explanations?.financeReason
          : key === 'love'
          ? explanations?.loveReason
          : key === 'career'
          ? explanations?.careerReason
          : explanations?.healthReason;
        
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
              <span className="text-white font-medium tracking-wide">
                {label.emoji} {label.name}:
              </span>
              <span className="text-mirastros-gold font-bold text-sm sm:text-base tracking-wide">
                {rating}/5
              </span>
            </div>
            <div className="relative h-2.5 bg-black/35 rounded-full overflow-hidden shadow-inner border border-white/10">
              <div
                ref={(el) => {
                  barsRef.current[index] = el;
                }}
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                style={{
                  background: getGradientColor(rating, key),
                  boxShadow: `0 0 8px ${RATING_COLORS[key].from}60`,
                  width: loading ? '0%' : `${(rating / 5) * 100}%`
                }}
              />
            </div>
            {explanationText && (
              <p className="text-[11px] sm:text-xs text-white opacity-80 leading-relaxed">
                {explanationText}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
