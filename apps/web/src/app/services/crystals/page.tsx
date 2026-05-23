'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ClarifyButton } from '../../../components/ClarifyButton';
import { ResultCard } from '../../../components/ui/ResultCard';
import { ErrorDisplay } from '../../../components/ui/ErrorDisplay';
import { LoadingIndicator } from '../../../components/ui/LoadingIndicator';

export default function CrystalsPage() {
  const [crystals, setCrystals] = useState<any[]>([]);
  const [selectedCrystal, setSelectedCrystal] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCrystals();
  }, []);

  const loadCrystals = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await api.getCrystals();
      setCrystals(result.crystals || []);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке кристаллов');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await api.getCrystalRecommendations();
      setRecommendations(result);
    } catch (err: any) {
      setError(err.message || 'Ошибка при получении рекомендаций');
    } finally {
      setLoading(false);
    }
  };

  const filteredCrystals = crystals.filter((crystal) =>
    crystal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Кристаллы
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Исцеляющие свойства кристаллов и минералов
          </p>
        </div>

        {loading && !selectedCrystal && !recommendations ? (
          <LoadingIndicator serviceName="Кристаллы" />
        ) : error && !selectedCrystal && !recommendations ? (
          <ErrorDisplay error={error} onRetry={loadCrystals} />
        ) : selectedCrystal ? (
          <>
            {/* Crystal Details */}
            <div className="mb-8">
              <button
                onClick={() => setSelectedCrystal(null)}
                className="text-mirastros-gold hover:text-mirastros-gold/80 mb-6 transition"
              >
                ← Вернуться к списку
              </button>

              <h2 className="font-cinzel text-3xl font-bold text-white mb-6">
                {selectedCrystal.name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ResultCard
                  title="Основные свойства"
                  content={
                    <ul className="space-y-2">
                      {selectedCrystal.properties &&
                        selectedCrystal.properties.map((prop: string, i: number) => (
                          <li key={i} className="text-gray-300 text-sm flex gap-2">
                            <span className="text-mirastros-gold">•</span>
                            <span>{prop}</span>
                          </li>
                        ))}
                    </ul>
                  }
                />

                <ResultCard
                  title="Применение"
                  content={
                    <ul className="space-y-2">
                      {selectedCrystal.uses &&
                        selectedCrystal.uses.map((use: string, i: number) => (
                          <li key={i} className="text-gray-300 text-sm flex gap-2">
                            <span className="text-mirastros-gold">•</span>
                            <span>{use}</span>
                          </li>
                        ))}
                    </ul>
                  }
                />
              </div>

              {selectedCrystal.description && (
                <ResultCard
                  title="Описание"
                  content={<p className="text-gray-300 text-sm">{selectedCrystal.description}</p>}
                  className="mb-6"
                />
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedCrystal(null)}
                  className="py-3 px-6 rounded-lg transition bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold"
                >
                  Вернуться к списку
                </button>
              </div>
            </div>
          </>
        ) : recommendations ? (
          <>
            {/* Recommendations */}
            <div className="mb-8">
              <button
                onClick={() => setRecommendations(null)}
                className="text-mirastros-gold hover:text-mirastros-gold/80 mb-6 transition"
              >
                ← Вернуться к списку
              </button>

              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Рекомендованные кристаллы
              </h2>

              <div className="space-y-4 mb-6">
                {recommendations.recommendations &&
                  recommendations.recommendations.map((rec: any, i: number) => (
                    <ResultCard
                      key={i}
                      title={rec.name}
                      content={
                        <div>
                          <p className="text-gray-300 text-sm mb-2">{rec.reason}</p>
                          <p className="text-gray-400 text-xs">{rec.description}</p>
                        </div>
                      }
                    />
                  ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setRecommendations(null)}
                  className="py-3 px-6 rounded-lg transition bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold"
                >
                  Вернуться к списку
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Crystals List */}
            <div className="mb-8">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                <input
                  type="text"
                  placeholder="Поиск кристаллов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-mirastros-gold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {filteredCrystals.map((crystal: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCrystal(crystal)}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 hover:border-mirastros-gold/50 transition text-left"
                  >
                    <h3 className="font-semibold text-white mb-1">{crystal.name}</h3>
                    <p className="text-gray-400 text-sm">{crystal.shortDescription}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleGetRecommendations}
                className="w-full py-3 px-6 rounded-lg transition bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold"
              >
                Получить рекомендации
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
