'use client';

import React from 'react';
import { Card, Stack } from '@mirastros-universal/design-system';
import type { HistoryStatsResponse } from '../../types';

const SERVICE_LABELS: Record<string, string> = {
  tarot: 'Таро',
  numerology: 'Нумерология',
  iching: 'И-Цзин',
  dreams: 'Сны',
  lenormand: 'Ленорман',
  synastry: 'Синастрия',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

interface HistoryStatsProps {
  stats: HistoryStatsResponse | null;
  loading: boolean;
}

export function HistoryStats({ stats, loading }: HistoryStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="outlined" className="p-4 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-2/3 mb-2" />
            <div className="h-8 bg-white/10 rounded w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card variant="outlined" className="p-4">
        <p className="text-sm text-gray-400 mb-1">Всего консультаций</p>
        <p className="text-2xl font-bold text-white">{stats.total_consultations}</p>
      </Card>
      <Card variant="outlined" className="p-4">
        <p className="text-sm text-gray-400 mb-1">Чаще всего</p>
        <p className="text-lg font-semibold text-white">
          {SERVICE_LABELS[stats.most_used_service] || stats.most_used_service}
        </p>
      </Card>
      <Card variant="outlined" className="p-4">
        <p className="text-sm text-gray-400 mb-1">Первая</p>
        <p className="text-sm text-white">{formatDate(stats.first_consultation_at)}</p>
      </Card>
      <Card variant="outlined" className="p-4">
        <p className="text-sm text-gray-400 mb-1">Последняя</p>
        <p className="text-sm text-white">{formatDate(stats.last_consultation_at)}</p>
      </Card>
    </div>
  );
}
