'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

export default function IChingPage() {
  const [question, setQuestion] = useState('');
  const [method, setMethod] = useState<'coin' | 'yarrow'>('coin');
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConsult = async () => {
    if (!question.trim()) {
      setError('Пожалуйста, задайте вопрос');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await api.consultIChing(question, method);
      setConsultation(result);
    } catch (err: any) {
      setError(err.message || 'Ошибка при консультации');
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
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">И-Цзин</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Книга Перемен — древнейший китайский оракул
          </p>
        </div>

        {!consultation ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Консультация</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Метод гадания</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setMethod('coin')}
                      className={`flex-1 py-3 px-4 rounded-lg transition ${
                        method === 'coin' ? 'bg-mirastros-gold text-black' : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      Монеты
                    </button>
                    <button
                      onClick={() => setMethod('yarrow')}
                      className={`flex-1 py-3 px-4 rounded-lg transition ${
                        method === 'yarrow' ? 'bg-mirastros-gold text-black' : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      Стебли тысячелистника
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ваш вопрос *</label>
                  <textarea
                    value={question}
                    onChange={(e) => { setQuestion(e.target.value); setError(''); }}
                    placeholder="Задайте конкретный вопрос о ситуации..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition resize-none"
                    rows={4}
                  />
                  {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
                </div>

                <button
                  onClick={handleConsult}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 text-lg"
                >
                  {loading ? 'Построение гексаграммы...' : 'Получить ответ'}
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">О И-Цзин</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                И-Цзин (Книга Перемен) — древнейшая китайская система гадания, основанная на 64 гексаграммах. 
                Каждая гексаграмма состоит из шести линий и описывает определенную жизненную ситуацию.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-4">Ваша консультация</h2>
            <p className="text-gray-300 italic mb-6">{consultation.question}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6">
                <h3 className="font-cinzel text-xl font-bold text-white mb-2">Гексаграмма {consultation.hexagram}</h3>
                <p className="text-mirastros-gold font-semibold text-lg">{consultation.hexagramName}</p>
                <div className="mt-4 flex flex-col gap-1">
                  {[1, 1, 0, 0, 1, 1].map((line, i) => (
                    <div key={i} className="h-2 bg-white/20 rounded" style={{ width: line ? '100%' : '45%' }} />
                  ))}
                </div>
              </div>

              {consultation.resultingHexagram && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="font-cinzel text-xl font-bold text-white mb-2">Результирующая</h3>
                  <p className="text-white font-semibold">Гексаграмма {consultation.resultingHexagram}</p>
                  <p className="text-gray-400 text-sm mt-2">Изменяющиеся линии: {consultation.changingLines.join(', ')}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Толкование</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{consultation.interpretation}</p>
            </div>

            {consultation.advice && (
              <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-mirastros-gold mb-2">💡 Совет</h4>
                <p className="text-gray-300 text-sm">{consultation.advice}</p>
              </div>
            )}

            <button
              onClick={() => { setConsultation(null); setQuestion(''); }}
              className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
            >
              Новая консультация
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
