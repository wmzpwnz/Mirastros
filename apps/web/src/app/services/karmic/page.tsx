'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

export default function KarmicPage() {
  const [birthDate, setBirthDate] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await api.analyzeKarmicTasks();
      setAnalysis(result);
    } catch (err: any) {
      console.error('Error analyzing karmic tasks:', err);
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
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Кармические задачи</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Анализ лунных узлов и предназначения души</p>
        </div>

        {!analysis ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Данные для анализа</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Дата рождения *</label>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold transition" />
                </div>
                <button onClick={handleAnalyze} disabled={loading || !birthDate}
                  className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 text-lg">
                  {loading ? 'Анализ кармы...' : 'Узнать кармические задачи'}
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">О кармических задачах</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Лунные узлы в натальной карте показывают кармический путь души. Южный узел — это опыт прошлых жизней, 
                Северный узел — направление развития в этой жизни. Понимание кармических задач помогает реализовать предназначение.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Ваш кармический путь</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">☊</span>
                  <h3 className="font-cinzel text-xl font-bold text-white">Северный узел</h3>
                </div>
                <p className="text-mirastros-gold font-semibold mb-2">{analysis.northNode.sign} в {analysis.northNode.house} доме</p>
                <p className="text-gray-300 text-sm">{analysis.northNode.meaning}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">☋</span>
                  <h3 className="font-cinzel text-xl font-bold text-white">Южный узел</h3>
                </div>
                <p className="text-white font-semibold mb-2">{analysis.southNode.sign} в {analysis.southNode.house} доме</p>
                <p className="text-gray-300 text-sm">{analysis.southNode.meaning}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-4">Кармические уроки</h3>
              <ul className="space-y-2">
                {analysis.karmicLessons.map((lesson: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className="text-mirastros-gold">•</span><span>{lesson}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6 mb-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">Предназначение души</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{analysis.soulPurpose}</p>
              <h4 className="font-semibold text-white mb-3">Рекомендации для развития</h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-mirastros-gold">•</span><span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={() => { setAnalysis(null); setBirthDate(''); }}
              className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition">
              Новый анализ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
