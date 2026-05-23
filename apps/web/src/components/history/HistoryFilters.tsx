'use client';

import React from 'react';
import { Stack } from '@mirastros-universal/design-system';

const SERVICE_OPTIONS = [
  { value: '', label: 'Все сервисы' },
  { value: 'tarot', label: 'Таро' },
  { value: 'numerology', label: 'Нумерология' },
  { value: 'iching', label: 'И-Цзин' },
  { value: 'dreams', label: 'Сны' },
  { value: 'lenormand', label: 'Ленорман' },
  { value: 'synastry', label: 'Синастрия' },
];

interface HistoryFiltersProps {
  serviceType: string;
  onServiceTypeChange: (value: string) => void;
}

export function HistoryFilters({ serviceType, onServiceTypeChange }: HistoryFiltersProps) {
  return (
    <Stack direction="row" gap="md" align="center" wrap className="flex-wrap">
      <label className="text-sm text-gray-400 shrink-0">Тип:</label>
      <select
        value={serviceType}
        onChange={(e) => onServiceTypeChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm min-w-[180px] focus:outline-none focus:ring-2 focus:ring-mirastros-gold/50"
        aria-label="Фильтр по типу сервиса"
      >
        {SERVICE_OPTIONS.map((opt) => (
          <option key={opt.value || 'all'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Stack>
  );
}
