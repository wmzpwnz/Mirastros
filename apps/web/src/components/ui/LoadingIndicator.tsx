'use client';

import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
  serviceName?: string;
  icon?: string;
}

export function LoadingIndicator({
  message,
  serviceName,
  icon = '🔮',
}: LoadingIndicatorProps) {
  const displayMessage = message || (serviceName ? `Загрузка ${serviceName}...` : 'Обработка...');

  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <span className="animate-spin text-2xl">{icon}</span>
      <span className="text-gray-300">{displayMessage}</span>
    </div>
  );
}
