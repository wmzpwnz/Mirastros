'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

const spreadTypes = [
  { id: 'one-rune', name: 'Одна руна', description: 'Быстрый ответ', runes: 1 },
  { id: 'three-rune', name: 'Три руны', description: 'Прошлое, настоящее, будущее', runes: 3 },
  { id: 'cross', name: 'Крест', description: 'Детальный анализ', runes: 5 },
];

export default function RunesPage() {
  const [selectedSpread, setSelectedSpread] = useState('three-rune');
  const [question, setQuestion] = useState('');
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetReading = async () => {
    if (!question.trim()) {
      setError('Пожалуйста, задайте вопрос');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await api.getRuneReading(selectedSpread, question);
      setReading(result);
    } catch (err: any) {
      setError(err.message || 'Ошибка при получении расклада');
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
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Руны</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Древняя скандинавская мудрость для ответов на ваши вопросы
          </p>
        </div>

        {!reading ? (
          <>
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-4">Выберите расклад</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {spreadTypes.map((spread) => (
                  <button
                    key={spread.id}
                    onClick={() => setSelectedSpread(spread.id)}
                    className={`text-left p-6 rounded-lg border-2 transition ${
                      selectedSpread === spread.id
                        ? 'bg-mirastros-gold/10 border-mirastros-gold'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <h3 className="font-cinzel text-xl font-bold text-white mb-2">{spread.name}</h3>
                    <p className="text-gray-400 text-sm">{spread.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-4">Задайте вопрос</h2>
              <textarea
                value={question}
                onChange={(e) => { setQuestion(e.target.value); setError(''); }}
                placeholder="Например: Что мне нужно знать о предстоящих переменах?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition resize-none"
                rows={4}
              />
              {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
            </div>

            <button
              onClick={handleGetReading}
              disabled={loading}
              className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 text-lg"
            >
              {loading ? 'Руны бросаются...' : 'Получить расклад'}
            </button>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-4">Ваш расклад</h2>
            <p className="text-gray-300 italic mb-6">{reading.question}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {reading.runes.map((rune: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">ᚠ</div>
                  <p className="text-white font-semibold">{rune.name}</p>
                  <p className="text-gray-400 text-sm">{rune.meaning}</p>
                  {rune.reversed && <p className="text-mirastros-gold text-xs mt-1">(перевернутая)</p>}
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Толкование</h3>
              <p className="text-gray-300 leading-relaxed">{reading.interpretation}</p>
            </div>

            <button
              onClick={() => { setReading(null); setQuestion(''); }}
              className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
            >
              Новый расклад
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
