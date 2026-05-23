'use client';

import React from 'react';
import { Stack, Spinner, Pagination } from '@mirastros-universal/design-system';
import { ConsultationCard } from './ConsultationCard';
import type { ConsultationHistoryItem } from '../../types';

interface HistoryListProps {
  items: ConsultationHistoryItem[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete?: (type: string, id: string) => void;
  deletingId?: string | null;
}

export function HistoryList({
  items,
  loading,
  error,
  page,
  totalPages,
  onPageChange,
  onDelete,
  deletingId,
}: HistoryListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-200 text-center">
        <p>{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg bg-white/5 border border-white/10 p-12 text-center text-gray-400">
        <p className="text-lg mb-2">Консультаций пока нет</p>
        <p className="text-sm">Ваша история появится здесь после первых сеансов</p>
      </div>
    );
  }

  return (
    <Stack direction="column" gap="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ConsultationCard
            key={`${item.type}-${item.id}`}
            item={item}
            onDelete={onDelete}
            isDeleting={deletingId === `${item.type}:${item.id}`}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onChange={onPageChange}
          />
        </div>
      )}
    </Stack>
  );
}
