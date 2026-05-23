'use client';

import React from 'react';

interface LockedNatalChartBlockProps {
  hasData: boolean;
  tier: string;
  onFillData: () => void;
  onUpgrade: () => void;
}

export const LockedNatalChartBlock: React.FC<LockedNatalChartBlockProps> = ({
  hasData,
  tier,
  onFillData,
  onUpgrade,
}) => {
  if (!hasData) {
    return (
      <div className="mira-card mira-card-hover p-6 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
        <div className="relative z-10 flex flex-col">
          <h3 className="mira-card-title mb-4 opacity-80">
            🔒 Натальная карта
          </h3>
          <div className="mb-4 h-36 mira-subcard flex items-center justify-center blur-sm">
            <div className="text-6xl opacity-50">⭐</div>
          </div>
          <p className="text-silver/70 text-base mb-4 tracking-wide">
            Узнайте свою натальную карту
          </p>
          <ul className="text-silver/50 text-base space-y-2 mb-5 tracking-wide">
            <li>• Солнце, Луна, Асцендент</li>
            <li>• 12 домов и планеты</li>
            <li>• Аспекты и влияния</li>
            <li>• AI анализ личности</li>
          </ul>
          <button
            onClick={onFillData}
            className="mira-button text-base mt-auto"
          >
            Заполнить данные 🎯
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mira-card mira-card-hover p-6 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
      <div className="relative z-10 flex flex-col">
        <h3 className="mira-card-title mb-4 opacity-80">🔒 Натальная карта</h3>
        <div className="mb-4 h-36 mira-subcard flex items-center justify-center blur-sm">
          <div className="text-6xl opacity-50">⭐</div>
        </div>
        <p className="text-silver/70 text-base mb-4 tracking-wide">
          Доступно в Premium/Platinum
        </p>
        <button onClick={onUpgrade} className="mira-button text-base mt-auto">
          Обновить до Premium 💎
        </button>
      </div>
    </div>
  );
};
