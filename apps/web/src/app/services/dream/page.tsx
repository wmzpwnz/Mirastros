'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ClarifyButton } from '../../../components/ClarifyButton';
import { QuestionForm } from '../../../components/ui/QuestionForm';
import { ResultCard } from '../../../components/ui/ResultCard';
import { ResultText } from '../../../components/ui/ResultText';
import { ResultActions } from '../../../components/ui/ResultActions';
import { ErrorDisplay } from '../../../components/ui/ErrorDisplay';

export default function DreamPage() {
  const [dreamText, setDreamText] = useState('');
  const [mood, setMood] = useState('');
  const [interpretation, setInterpretation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const moods = ['спокойный', 'тревожный', 'радостный', 'странный', 'пугающий'];

  const handleInterpret = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleNewDream = () => {
    setInterpretation(null);
    setDreamText('');
    setMood('');
    setError('');
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
                {/* Dream Text Input */}
                <QuestionForm
                  question={dreamText}
                  onQuestionChange={setDreamText}
                  onSubmit={handleInterpret}
                  loading={loading}
                  error={error}
                  placeholder="Опишите ваш сон как можно подробнее: что вы видели, чувствовали, кто присутствовал..."
                  submitButtonText="Получить толкование"
                  rows={8}
                />

                {/* Mood Selection */}
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
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Толкование вашего сна
              </h2>

              {/* Dream Text */}
              <ResultCard
                title="Ваш сон"
                content={
                  <div>
                    <p className="italic mb-3">{interpretation.dream}</p>
                    {interpretation.mood && (
                      <p className="text-gray-400 text-sm">
                        Настроение: <span className="text-mirastros-gold">{interpretation.mood}</span>
                      </p>
                    )}
                  </div>
                }
                className="mb-6"
              />

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
              <ResultText
                title="Толкование"
                content={interpretation.interpretation}
                className="mb-6"
              />

              {/* Advice */}
              {interpretation.advice && (
                <ResultCard
                  title="💡 Совет"
                  content={interpretation.advice}
                  className="bg-mirastros-gold/10 border-mirastros-gold/30 mb-6"
                />
              )}

              {/* Actions */}
              <ResultActions
                onNewConsultation={handleNewDream}
                newConsultationLabel="Новый сон"
                historyLink="/journal"
              />
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
