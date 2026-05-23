'use client';

import React from 'react';
import type { DestinyMatrix } from '../types';
import type { HeroDensity } from './hero/heroDensity';
import { DestinyMatrixView, type DestinyMatrixMode } from './destiny/DestinyMatrixView';

interface DestinyMatrixBlockProps {
  matrix: DestinyMatrix | null;
  loading?: boolean;
  onViewDetails?: () => void;
  fullWidth?: boolean;
  density?: HeroDensity;
  mode?: DestinyMatrixMode;
}

export const DestinyMatrixBlock: React.FC<DestinyMatrixBlockProps> = ({
  matrix,
  loading = false,
  onViewDetails,
  fullWidth = false,
  density = 'comfort',
  mode = 'hero',
}) => {
  const isFull = mode === 'full';

  if (loading) {
    return (
      <div className={`mira-card p-6 ${isFull ? 'w-full' : 'h-full'}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-48" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!matrix) {
    return (
      <div className="mira-card p-7 flex flex-col items-center justify-center text-center">
        <div className="text-5xl mb-4 opacity-50">💫</div>
        <h3 className="hero-title-main mira-card-title text-2xl mb-3">Матрица судьбы</h3>
        <p className="hero-body text-silver/70 text-base">
          Матрица судьбы будет рассчитана после заполнения данных рождения
        </p>
      </div>
    );
  }

  return (
    <DestinyMatrixView
      matrix={matrix}
      density={density}
      mode={mode}
      fullWidth={fullWidth}
      onViewDetails={onViewDetails}
    />
  );
};

