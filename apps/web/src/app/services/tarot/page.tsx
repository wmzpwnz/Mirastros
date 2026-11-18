'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ClarifyButton } from '../../../components/ClarifyButton';
import { api } from '../../../services/api';

const spreadTypes = [
  { id: 'one-card', name: 'Одна карта', description: 'Быстрый ответ на вопрос', cards: 1 },
  { id: 'three-card', name: 'Три карты', description: 'Прошлое, настоящее, будущее', cards: 3 },
  { id: 'five-card', name: 'Пять карт', description: 'Детальный анализ ситуации', cards: 5 },
  { id: 'celtic-cross', name: 'Кельтский крест', description: 'Полный расклад', cards: 10 },
];

export default function TarotPage() {
  const [selectedSpread, setSelectedSpread] = useState('three-card');
  const [question, setQuestion] = useState('');
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetReading = async () => {
    if (loading) return;
    if (!question.trim()) {
      setError('Пожалуйста, задайте вопрос');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await api.getTarotReading(selectedSpread, question);
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
        {/* Header */}
        <div className="mb-12 text-center">
          <Link
            href="/dashboard"
            className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition"
          >
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">
            Таро
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Задайте вопрос и откройте символический смысл выпавших карт
          </p>
        </div>

        {!reading ? (
          <>
            {/* Spread Selection */}
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-4">
                Выберите расклад
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-cinzel text-xl font-bold text-white">
                        {spread.name}
                      </h3>
                      <span className="text-mirastros-gold text-sm">
                        {spread.cards} {spread.cards === 1 ? 'карта' : 'карты'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{spread.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Input */}
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-4">
                Задайте вопрос
              </h2>
              <textarea aria-label="Ваш вопрос картам" maxLength={1000}
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  setError('');
                }}
                placeholder="Например: Что мне нужно знать о моей карьере?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition resize-none"
                rows={4}
              />
              {error && (
                <p className="mt-2 text-red-400 text-sm">{error}</p>
              )}
            </div>

            {/* Get Reading Button */}
            <button
              onClick={handleGetReading}
              disabled={loading}
              className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🔮</span>
                  Карты раскладываются...
                </span>
              ) : (
                'Получить расклад'
              )}
            </button>
          </>
        ) : (
          <>
            {/* Reading Result */}
            <div className="mb-8">
              <div className="bg-white/5 border border-white/10 rounded-lg p-8">
                <div className="mb-6">
                  <h2 className="font-cinzel text-2xl font-bold text-white mb-2">
                    Ваш вопрос
                  </h2>
                  <p className="text-gray-300 italic">{reading.question}</p>
                </div>

                {/* Cards */}
                {reading.cards && reading.cards.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-cinzel text-xl font-bold text-white mb-4">
                      Выпавшие карты
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {reading.cards.map((card: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 text-center"
                        >
                          <div className="text-4xl mb-2">🃏</div>
                          <p className="text-white font-semibold text-sm mb-1">
                            {card.name}
                          </p>
                          {card.reversed && (
                            <p className="text-mirastros-gold text-xs">
                              (перевернутая)
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interpretation */}
                <div className="mb-6">
                  <h3 className="font-cinzel text-xl font-bold text-white mb-4">
                    Значения карт
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {reading.interpretation}
                    </p>
                  </div>
                </div>

                <ClarifyButton contextType="tarot" contextData={reading} />

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setReading(null);
                      setQuestion('');
                    }}
                    className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
                  >
                    Новый расклад
                  </button>
                  <Link
                    href="/history"
                    className="flex-1 py-3 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition text-center"
                  >
                    История раскладов
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Info */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="font-cinzel text-lg font-bold text-white mb-3">
            О Таро
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Таро — это древняя система гадания, использующая 78 карт для получения
            инсайтов о прошлом, настоящем и будущем. Базовые значения помогают рассмотреть символы карт.
            Отдельное пояснение Mirastros открывается кнопкой под результатом.
          </p>
        </div>
      </div>
    </div>
  );
}
