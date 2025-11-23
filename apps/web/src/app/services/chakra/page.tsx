'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

const chakras = [
  { name: 'Муладхара', color: 'red', location: 'Основание позвоночника', element: 'Земля' },
  { name: 'Свадхистана', color: 'orange', location: 'Низ живота', element: 'Вода' },
  { name: 'Манипура', color: 'yellow', location: 'Солнечное сплетение', element: 'Огонь' },
  { name: 'Анахата', color: 'green', location: 'Сердце', element: 'Воздух' },
  { name: 'Вишудха', color: 'blue', location: 'Горло', element: 'Эфир' },
  { name: 'Аджна', color: 'indigo', location: 'Третий глаз', element: 'Свет' },
  { name: 'Сахасрара', color: 'violet', location: 'Макушка', element: 'Мысль' },
];

export default function ChakraPage() {
  const [birthDate, setBirthDate] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await api.analyzeChakras(birthDate);
      setAnalysis(result);
    } catch (err: any) {
      console.error('Error analyzing chakras:', err);
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
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Анализ чакр</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Диагностика энергетических центров</p>
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
                  {loading ? 'Анализ чакр...' : 'Провести анализ'}
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">О чакрах</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Чакры — это энергетические центры в теле человека. Их баланс влияет на физическое, 
                эмоциональное и духовное здоровье. Анализ чакр помогает выявить блокировки и восстановить гармонию.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Состояние ваших чакр</h2>

            <div className="space-y-4 mb-8">
              {analysis.chakras.map((chakra: any, i: number) => (
                <div key={i} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full bg-${chakra.color}-500`} />
                      <div>
                        <h3 className="font-semibold text-white">{chakra.name}</h3>
                        <p className="text-gray-400 text-xs">{chakra.location}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${chakra.status === 'balanced' ? 'text-green-400' : chakra.status === 'blocked' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {chakra.status === 'balanced' ? '✓ Сбалансирована' : chakra.status === 'blocked' ? '✗ Заблокирована' : '⚠ Гиперактивна'}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${chakra.status === 'balanced' ? 'bg-green-500' : chakra.status === 'blocked' ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{ width: `${chakra.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6 mb-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">Основная проблема</h3>
              <p className="text-gray-300 mb-4">{analysis.mainIssue}</p>
              <h4 className="font-semibold text-white mb-3">Практики для балансировки</h4>
              <ul className="space-y-2">
                {analysis.practices.map((practice: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-mirastros-gold">•</span><span>{practice}</span>
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
