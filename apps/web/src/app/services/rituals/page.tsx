'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ClarifyButton } from '../../../components/ClarifyButton';
import { ResultCard } from '../../../components/ui/ResultCard';
import { ResultText } from '../../../components/ui/ResultText';
import { ErrorDisplay } from '../../../components/ui/ErrorDisplay';
import { LoadingIndicator } from '../../../components/ui/LoadingIndicator';

export default function RitualsPage() {
  const [rituals, setRituals] = useState<any[]>([]);
  const [selectedRitual, setSelectedRitual] = useState<any>(null);
  const [personalizedRitual, setPersonalizedRitual] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRituals();
  }, []);

  const loadRituals = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await api.getRituals();
      setRituals(result.rituals || []);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке ритуалов');
    } finally {
      setLoading(false);
    }
  };

  const handleGetPersonalizedRitual = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await api.getPersonalizedRitual();
      setPersonalizedRitual(result);
    } catch (err: any) {
      setError(err.message || 'Ошибка при получении персонализированного ритуала');
    } finally {
      setLoading(false);
    }
  };

  const filteredRituals = rituals.filter((ritual) =>
    ritual.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            Ритуалы
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Духовные практики для трансформации и исцеления
          </p>
        </div>

        {loading && !selectedRitual && !personalizedRitual ? (
          <LoadingIndicator serviceName="Ритуалы" />
        ) : error && !selectedRitual && !personalizedRitual ? (
          <ErrorDisplay error={error} onRetry={loadRituals} />
        ) : selectedRitual ? (
          <>
            {/* Ritual Details */}
            <div className="mb-8">
              <button
                onClick={() => setSelectedRitual(null)}
                className="text-mirastros-gold hover:text-mirastros-gold/80 mb-6 transition"
              >
                ← Вернуться к списку
              </button>

              <h2 className="font-cinzel text-3xl font-bold text-white mb-6">
                {selectedRitual.name}
              </h2>

              {selectedRitual.description && (
                <ResultCard
                  title="Описание"
                  content={<p className="text-gray-300 text-sm">{selectedRitual.description}</p>}
                  className="mb-6"
                />
              )}

              {selectedRitual.materials && selectedRitual.materials.length > 0 && (
                <ResultCard
                  title="Необходимые материалы"
                  content={
                    <ul className="space-y-2">
                      {selectedRitual.materials.map((material: string, i: number) => (
                        <li key={i} className="text-gray-300 text-sm flex gap-2">
                          <span className="text-mirastros-gold">•</span>
                          <span>{material}</span>
                        </li>
                      ))}
                    </ul>
                  }
                  className="mb-6"
                />
              )}

              {selectedRitual.steps && selectedRitual.steps.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-4">
                    Пошаговые инструкции
                  </h3>
                  <div className="space-y-3">
                    {selectedRitual.steps.map((step: string, i: number) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <p className="text-gray-300 text-sm">
                          <span className="text-mirastros-gold font-semibold">Шаг {i + 1}:</span>{' '}
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedRitual(null)}
                  className="py-3 px-6 rounded-lg transition bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold"
                >
                  Вернуться к списку
                </button>
              </div>
            </div>
          </>
        ) : personalizedRitual ? (
          <>
            {/* Personalized Ritual */}
            <div className="mb-8">
              <button
                onClick={() => setPersonalizedRitual(null)}
                className="text-mirastros-gold hover:text-mirastros-gold/80 mb-6 transition"
              >
                ← Вернуться к списку
              </button>

              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ваш персонализированный ритуал
              </h2>

              {personalizedRitual.name && (
                <ResultCard
                  title="Название"
                  content={<p className="text-white font-semibold">{personalizedRitual.name}</p>}
                  className="mb-6"
                />
              )}

              {personalizedRitual.description && (
                <ResultCard
                  title="Описание"
                  content={<p className="text-gray-300 text-sm">{personalizedRitual.description}</p>}
                  className="mb-6"
                />
              )}

              {personalizedRitual.steps && personalizedRitual.steps.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-4">
                    Инструкции
                  </h3>
                  <div className="space-y-3">
                    {personalizedRitual.steps.map((step: string, i: number) => (
                      <div key={i} className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-4">
                        <p className="text-gray-300 text-sm">
                          <span className="text-mirastros-gold font-semibold">Шаг {i + 1}:</span>{' '}
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setPersonalizedRitual(null)}
                  className="py-3 px-6 rounded-lg transition bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold"
                >
                  Вернуться к списку
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Rituals List */}
            <div className="mb-8">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                <input
                  type="text"
                  placeholder="Поиск ритуалов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-mirastros-gold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {filteredRituals.map((ritual: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedRitual(ritual)}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 hover:border-mirastros-gold/50 transition text-left"
                  >
                    <h3 className="font-semibold text-white mb-1">{ritual.name}</h3>
                    <p className="text-gray-400 text-sm">{ritual.shortDescription}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleGetPersonalizedRitual}
                className="w-full py-3 px-6 rounded-lg transition bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold"
              >
                Получить персонализированный ритуал
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
