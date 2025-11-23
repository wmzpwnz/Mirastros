'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ClarifyButton } from '../../../components/ClarifyButton';

export default function DreamPage() {
  const [dreamText, setDreamText] = useState('');
  const [mood, setMood] = useState('');
  const [interpretation, setInterpretation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const moods = ['спокойный', 'тревожный', 'радостный', 'странный', 'пугающий'];

  const handleInterpret = async () => {
    if (!dreamText.trim()) {
      setError('Пожалуйста, опишите ваш сон');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await api.interpretDream(dreamText);
      setInterpretation({
        ...result,
        dream: dreamText,
        mood,
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка при толковании сна');
      setLoading(false);
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
            Толкование снов
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Раскройте тайные послания вашего подсознания
          </p>
        </div>

        {!interpretation ? (
          <>
            {/* Dream Input */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Опишите ваш сон
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Описание сна *
                  </label>
                  <textarea
                    value={dreamText}
                    onChange={(e) => {
                      setDreamText(e.target.value);
                      setError('');
                    }}
                    placeholder="Опишите ваш сон как можно подробнее: что вы видели, чувствовали, кто присутствовал..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition resize-none"
                    rows={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Настроение сна
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMood(m)}
                        className={`px-4 py-2 rounded-lg transition ${
                          mood === m
                            ? 'bg-mirastros-gold text-black'
                            : 'bg-white/5 text-white hover:bg-white/10'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleInterpret}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">🌙</span>
                      Анализ сна...
                    </span>
                  ) : (
                    'Получить толкование'
                  )}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                О толковании снов
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Сны — это язык подсознания. Они содержат важные послания о вашем
                внутреннем состоянии, скрытых желаниях и предчувствиях. Наш AI
                анализирует символы и контекст вашего сна, чтобы раскрыть его значение.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Interpretation Result */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Толкование вашего сна
              </h2>

              {/* Dream Text */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <h3 className="font-cinzel text-lg font-bold text-white mb-2">
                  Ваш сон
                </h3>
                <p className="text-gray-300 italic">{interpretation.dream}</p>
                {interpretation.mood && (
                  <p className="text-gray-400 text-sm mt-2">
                    Настроение: <span className="text-mirastros-gold">{interpretation.mood}</span>
                  </p>
                )}
              </div>

              {/* Symbols */}
              {interpretation.symbols && interpretation.symbols.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                    Ключевые символы
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {interpretation.symbols.map((symbol: string, i: number) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-mirastros-gold/20 text-mirastros-gold rounded-lg text-sm font-semibold"
                      >
                        {symbol}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interpretation */}
              <div className="mb-6">
                <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                  Толкование
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {interpretation.interpretation}
                  </p>
                </div>
              </div>

              {/* Advice */}
              {interpretation.advice && (
                <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-mirastros-gold mb-2">
                    💡 Совет
                  </h4>
                  <p className="text-gray-300 text-sm">{interpretation.advice}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setInterpretation(null);
                    setDreamText('');
                    setMood('');
                  }}
                  className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
                >
                  Новый сон
                </button>
                <Link
                  href="/journal"
                  className="flex-1 py-3 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition text-center"
                >
                  Дневник снов
                </Link>
              </div>
            </div>

            {/* Clarify with Mirastros */}
            <ClarifyButton
              onClarify={() => {
                console.log('Opening chat with dream context:', interpretation);
              }}
              contextType="dream"
              contextData={interpretation}
              available={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
