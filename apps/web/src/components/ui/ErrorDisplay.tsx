'use client';

import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  retryLabel = 'Повторить',
  icon = '⚠️',
}: ErrorDisplayProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="py-2 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-semibold rounded-lg transition text-sm"
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
