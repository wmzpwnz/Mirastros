'use client';

import React from 'react';

interface LockedHoroscopeBlockProps {
  onFillData: () => void;
}

export const LockedHoroscopeBlock: React.FC<LockedHoroscopeBlockProps> = ({
  onFillData,
}) => {
  return (
    <div className="mira-card mira-card-hover p-6 relative overflow-hidden h-full flex flex-col">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
      <div className="relative z-10 flex flex-col h-full justify-center">
        <h3 className="mira-card-title mb-4 opacity-80">🔒 Гороскоп</h3>
        <p className="text-silver/70 text-base mb-4 tracking-wide">
          Выберите знак зодиака для гороскопа
        </p>
        <button onClick={onFillData} className="mira-button text-base">
          Заполнить данные для расчета
        </button>
      </div>
    </div>
  );
};
