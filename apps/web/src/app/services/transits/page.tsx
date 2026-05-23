'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ClarifyButton } from '../../../components/ClarifyButton';
import { ResultCard } from '../../../components/ui/ResultCard';
import { ResultText } from '../../../components/ui/ResultText';
import { ResultActions } from '../../../components/ui/ResultActions';
import { ErrorDisplay } from '../../../components/ui/ErrorDisplay';
import { LoadingIndicator } from '../../../components/ui/LoadingIndicator';

export default function TransitsPage() {
  const [transits, setTransits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransits();
  }, []);

  const loadTransits = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await api.getPersonalTransits();
      setTransits(result);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке транзитов');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadTransits();
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link
            href="/dashboard"
            className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition"
          >
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">
            Планетарные Транзиты
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Влияние текущих движений планет на вашу жизнь
          </p>
        </div>

        {loading ? (
          <LoadingIndicator serviceName="Транзиты" />
        ) : error ? (
          <div className="space-y-4">
            <ErrorDisplay error={error} onRetry={handleRefresh} />
          </div>
        ) : transits ? (
          <>
            {/* Transits Result */}
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ваши текущие транзиты
              </h2>

              {/* Current Date */}
              <ResultCard
                title="Дата расчета"
                content={
                  <p className="text-gray-300">
                    {new Date().toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                }
                className="mb-6"
              />

              {/* Transits List */}
              {transits.transits && transits.transits.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-4">
                    Активные транзиты
                  </h3>
                  <div className="space-y-4">
                    {transits.transits.map((transit: any, i: number) => (
                      <div
                        key={i}
                        className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-4"
                      >
                        <h4 className="font-semibold text-white mb-2">
                          {transit.planet} {transit.aspect} {transit.natalPlanet}
                        </h4>
                        <p className="text-gray-300 text-sm mb-2">{transit.interpretation}</p>
                        {transit.dates && (
                          <p className="text-gray-400 text-xs">
                            Период: {transit.dates}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Interpretation */}
              {transits.interpretation && (
                <ResultText
                  title="Общее толкование"
                  content={transits.interpretation}
                  className="mb-6"
                />
              )}

              {/* Recommendations */}
              {transits.recommendations && transits.recommendations.length > 0 && (
                <ResultCard
                  title="💡 Рекомендации"
                  content={
                    <ul className="space-y-2">
                      {transits.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-gray-300 text-sm flex gap-2">
                          <span className="text-mirastros-gold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  }
                  className="bg-mirastros-gold/10 border-mirastros-gold/30 mb-6"
                />
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleRefresh}
                  className="py-3 px-6 rounded-lg transition bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold"
                >
                  Обновить
                </button>
                <Link
                  href="/dashboard"
                  className="py-3 px-6 rounded-lg transition bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold"
                >
                  Вернуться на панель
                </Link>
              </div>
            </div>

            {/* Clarify with Mirastros */}
            <ClarifyButton
              onClarify={() => {
                console.log('Opening chat with transits context:', transits);
              }}
              contextType="transits"
              contextData={transits}
              available={true}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
