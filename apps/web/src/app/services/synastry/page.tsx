'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

export default function SynastryPage() {
  const [formData, setFormData] = useState({
    person1Name: '',
    person1Date: '',
    person1Time: '',
    person2Name: '',
    person2Date: '',
    person2Time: '',
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await api.calculateSynastry({
        partner1BirthDate: formData.person1Date,
        partner1BirthTime: formData.person1Time,
        partner1Latitude: 0, // TODO: Add location input
        partner1Longitude: 0,
        partner2BirthDate: formData.person2Date,
        partner2BirthTime: formData.person2Time,
        partner2Latitude: 0,
        partner2Longitude: 0,
      });
      setAnalysis(result);
    } catch (err: any) {
      console.error('Error calculating synastry:', err);
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
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Синастрия</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Анализ совместимости по натальным картам</p>
        </div>

        {!analysis ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Данные партнеров</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-mirastros-gold mb-3">Первый партнер</h3>
                <input type="text" placeholder="Имя" value={formData.person1Name}
                  onChange={(e) => setFormData({ ...formData, person1Name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold transition" />
                <input type="date" value={formData.person1Date}
                  onChange={(e) => setFormData({ ...formData, person1Date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold transition" />
                <input type="time" value={formData.person1Time}
                  onChange={(e) => setFormData({ ...formData, person1Time: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold transition" />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-mirastros-gold mb-3">Второй партнер</h3>
                <input type="text" placeholder="Имя" value={formData.person2Name}
                  onChange={(e) => setFormData({ ...formData, person2Name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold transition" />
                <input type="date" value={formData.person2Date}
                  onChange={(e) => setFormData({ ...formData, person2Date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold transition" />
                <input type="time" value={formData.person2Time}
                  onChange={(e) => setFormData({ ...formData, person2Time: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold transition" />
              </div>
            </div>
            <button onClick={handleAnalyze} disabled={loading}
              className="w-full mt-6 py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 text-lg">
              {loading ? 'Анализ совместимости...' : 'Рассчитать синастрию'}
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-mirastros-gold/20 border-4 border-mirastros-gold mb-4">
                <span className="text-4xl font-bold text-mirastros-gold">{analysis.compatibilityScore}%</span>
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-white">Совместимость</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                <h3 className="font-cinzel text-lg font-bold text-white mb-3">Сильные стороны</h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-green-400">✓</span><span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                <h3 className="font-cinzel text-lg font-bold text-white mb-3">Вызовы</h3>
                <ul className="space-y-2">
                  {analysis.challenges.map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-yellow-400">⚠</span><span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-4">Ключевые аспекты</h3>
              <div className="space-y-3">
                {analysis.aspects.map((aspect: any, i: number) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-semibold">{aspect.type}</span>
                      <span className="text-mirastros-gold text-sm">{aspect.aspect}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{aspect.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6 mb-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">Рекомендации</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{analysis.advice}</p>
            </div>

            <button onClick={() => { setAnalysis(null); setFormData({ person1Name: '', person1Date: '', person1Time: '', person2Name: '', person2Date: '', person2Time: '' }); }}
              className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition">
              Новый анализ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
