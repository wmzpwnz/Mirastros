'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

export default function SolarReturnPage() {
  const [birthDate, setBirthDate] = useState('');
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const year = new Date(birthDate).getFullYear() + 1;
      const result = await api.calculateSolarReturn(year);
      setForecast(result);
    } catch (err: any) {
      console.error('Error calculating solar return:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <Link href="/dashboard" className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition">
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Соляр</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Годовой прогноз на основе солнечного возвращения</p>
          <div className="mt-4 inline-block px-4 py-2 bg-mirastros-gold/20 text-mirastros-gold rounded-lg text-sm">
            ⭐ Доступно для Platinum подписки
          </div>
        </div>

        {!forecast ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Расчет соляра</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Дата рождения *</label>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold transition" />
                </div>
                <button onClick={handleCalculate} disabled={loading || !birthDate}
                  className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 text-lg">
                  {loading ? 'Расчет соляра...' : 'Получить годовой прогноз'}
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">О соляре</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Соляр (солнечное возвращение) — это карта, построенная на момент, когда Солнце возвращается 
                в точную позицию вашего рождения. Она показывает темы и события предстоящего года.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="font-cinzel text-3xl font-bold text-white mb-2">Прогноз на {forecast.year} год</h2>
              <p className="text-mirastros-gold text-lg">{forecast.theme}</p>
            </div>

            <div className="mb-8">
              <h3 className="font-cinzel text-xl font-bold text-white mb-4">Ключевые сферы</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {forecast.keyAreas.map((area: any, i: number) => (
                  <div key={i} className={`p-4 rounded-lg border ${area.impact === 'positive' ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                    <h4 className="font-semibold text-white mb-2">{area.area}</h4>
                    <p className="text-gray-300 text-sm">{area.prediction}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-cinzel text-xl font-bold text-white mb-4">Помесячный прогноз</h3>
              <div className="space-y-3">
                {forecast.monthlyHighlights.map((highlight: any, i: number) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-mirastros-gold font-semibold">{highlight.month}</span>
                    <span className="text-gray-300 text-sm">{highlight.event}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6 mb-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">Рекомендации на год</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{forecast.advice}</p>
            </div>

            <button onClick={() => { setForecast(null); setBirthDate(''); }}
              className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition">
              Новый расчет
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
