'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

export default function NatalChartPage() {
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    latitude: 0,
    longitude: 0,
  });
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleCalculate = async () => {
    if (!formData.birthDate || !formData.birthTime) {
      setError('Пожалуйста, укажите дату и время рождения');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await api.calculateNatalChart({
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        latitude: formData.latitude || 55.7558, // Moscow default
        longitude: formData.longitude || 37.6173,
      });
      setChart(result);
    } catch (err: any) {
      setError(err.message || 'Ошибка при расчете натальной карты');
    } finally {
      setLoading(false);
    }
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
            Натальная карта
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Узнайте свой астрологический портрет на основе даты, времени и места
            рождения
          </p>
        </div>

        {!chart ? (
          <>
            {/* Birth Data Form */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Данные рождения
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Дата рождения *
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Время рождения *
                  </label>
                  <input
                    type="time"
                    name="birthTime"
                    value={formData.birthTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Точное время важно для расчета домов
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Место рождения
                  </label>
                  <input
                    type="text"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleChange}
                    placeholder="Москва, Россия"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Для точного расчета укажите город
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⭐</span>
                      Расчет карты...
                    </span>
                  ) : (
                    'Рассчитать натальную карту'
                  )}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                Что такое натальная карта?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Натальная карта — это снимок неба в момент вашего рождения. Она
                показывает положение планет, знаков зодиака и астрологических домов,
                которые влияют на вашу личность, таланты и жизненный путь.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-mirastros-gold">•</span>
                  <span>Планеты показывают различные аспекты личности</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mirastros-gold">•</span>
                  <span>Знаки зодиака определяют стиль выражения</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mirastros-gold">•</span>
                  <span>Дома указывают на сферы жизни</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mirastros-gold">•</span>
                  <span>Аспекты раскрывают взаимодействие планет</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* Chart Result */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ваша натальная карта
              </h2>

              {/* Birth Info */}
              <div className="mb-8 pb-6 border-b border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Дата рождения</p>
                    <p className="text-white font-semibold">{formData.birthDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Время рождения</p>
                    <p className="text-white font-semibold">{formData.birthTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Место рождения</p>
                    <p className="text-white font-semibold">
                      {formData.birthPlace || 'Москва, Россия'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Planets */}
              {chart.planets && (
                <div className="mb-8">
                  <h3 className="font-cinzel text-xl font-bold text-white mb-4">
                    Планеты в знаках
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(chart.planets).map(([planet, data]: [string, any]) => (
                      <div
                        key={planet}
                        className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white font-semibold capitalize">
                            {planet}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {data.sign} {data.degree}°
                            {data.retrograde && ' ℞'}
                          </p>
                        </div>
                        <div className="text-2xl">{getPlaneSymbol(planet)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interpretation */}
              {chart.interpretation && (
                <div className="mb-6">
                  <h3 className="font-cinzel text-xl font-bold text-white mb-4">
                    Интерпретация
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {chart.interpretation}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setChart(null);
                    setFormData({
                      birthDate: '',
                      birthTime: '',
                      birthPlace: '',
                      latitude: 0,
                      longitude: 0,
                    });
                  }}
                  className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
                >
                  Новый расчет
                </button>
                <button className="flex-1 py-3 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition">
                  Скачать PDF
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function getPlanetSymbol(planet: string): string {
  const symbols: Record<string, string> = {
    sun: '☉',
    moon: '☽',
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇',
  };
  return symbols[planet.toLowerCase()] || '⭐';
}
