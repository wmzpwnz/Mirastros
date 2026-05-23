'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@mirastros-universal/design-system';
import type { ConsultationHistoryItem as Item } from '../../types';

const SERVICE_LABELS: Record<string, string> = {
  tarot: 'Таро',
  numerology: 'Нумерология',
  iching: 'И-Цзин',
  dreams: 'Сны',
  lenormand: 'Ленорман',
  synastry: 'Синастрия',
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

interface ConsultationCardProps {
  item: Item;
  onDelete?: (type: string, id: string) => void;
  isDeleting?: boolean;
}

export function ConsultationCard({ item, onDelete, isDeleting }: ConsultationCardProps) {
  const label = SERVICE_LABELS[item.type] || item.type;
  const detailHref = `/history/${item.type}/${item.id}`;

  return (
    <Card variant="outlined" className="p-4 hover:border-white/20 transition">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="info" size="sm">
            {label}
          </Badge>
          <span className="text-xs text-gray-400 shrink-0">
            {formatDate(item.created_at)}
          </span>
        </div>
        <h3 className="font-semibold text-white line-clamp-1">{item.title}</h3>
        {item.question && (
          <p className="text-sm text-gray-400 line-clamp-2">{item.question}</p>
        )}
        <p className="text-sm text-gray-300 line-clamp-2">{item.preview}</p>
        <div className="flex items-center gap-2 mt-auto pt-2">
          <Link href={detailHref} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              Подробнее
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              disabled={isDeleting}
              onClick={() => onDelete(item.type, item.id)}
              aria-label="Удалить консультацию"
            >
              {isDeleting ? '…' : 'Удалить'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
