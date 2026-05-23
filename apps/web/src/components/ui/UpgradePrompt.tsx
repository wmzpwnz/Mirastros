'use client';

import React from 'react';
import Link from 'next/link';

interface UpgradePromptProps {
  currentTier?: string;
  requiredTier?: string;
  message?: string;
  features?: string[];
  icon?: string;
}

export function UpgradePrompt({
  currentTier = 'freemium',
  requiredTier = 'premium',
  message,
  features,
  icon = '✨',
}: UpgradePromptProps) {
  const defaultMessage = `Эта услуга доступна только для подписчиков ${requiredTier}. Ваш текущий уровень: ${currentTier}`;
  const displayMessage = message || defaultMessage;

  return (
    <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-8">
      <div className="text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="font-cinzel text-2xl font-bold text-white mb-3">
          Обновите подписку
        </h3>
        <p className="text-gray-300 mb-6">{displayMessage}</p>

        {features && features.length > 0 && (
          <div className="mb-6 text-left max-w-md mx-auto">
            <p className="text-sm text-gray-400 mb-3">Получите доступ к:</p>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-mirastros-gold">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/subscription"
          className="inline-block py-3 px-8 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition"
        >
          Выбрать подписку
        </Link>
      </div>
    </div>
  );
}
