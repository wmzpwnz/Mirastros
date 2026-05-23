'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ClarifyButton } from '../../../components/ClarifyButton';
import { QuestionForm } from '../../../components/ui/QuestionForm';
import { ResultCard } from '../../../components/ui/ResultCard';
import { ResultText } from '../../../components/ui/ResultText';
import { ResultActions } from '../../../components/ui/ResultActions';

export default function IChingPage() {
  const [question, setQuestion] = useState('');
  const [method, setMethod] = useState<'coin' | 'yarrow'>('coin');
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const methods = [
    { value: 'coin', label: 'Монеты', description: 'Быстрый метод' },
    { value: 'yarrow', label: 'Стебли тысячелистника', description: 'Традиционный метод' },
  ];

  const handleConsult = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await api.consultIChing(question, method);
      setConsultation({
        ...result,
        question,
        method,
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка при консультации И-Цзин');
    } finally {
      setLoading(false);
    }
  };

  const handleNewConsultation = () => {
    setConsultation(null);
    setQuestion('');
    setMethod('coin');
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
            И-Цзин
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Книга Перемен — древнейший китайский оракул
          </p>
        </div>

        {!consultation ? (
          <>
            {/* I Ching Consultation Input */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Консультация
              </h2>

              <div className="space-y-6">
                {/* Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Метод гадания
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {methods.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setMethod(m.value as 'coin' | 'yarrow')}
                        className={`p-4 rounded-lg transition text-left ${
                          method === m.value
                            ? 'bg-mirastros-gold text-black'
                            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <div className="font-semibold">{m.label}</div>
                        <div className="text-xs opacity-75">{m.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Input */}
                <QuestionForm
                  question={question}
                  onQuestionChange={setQuestion}
                  onSubmit={handleConsult}
                  loading={loading}
                  error={error}
                  placeholder="Задайте конкретный вопрос о ситуации, которая вас интересует..."
                  submitButtonText="Получить ответ"
                  rows={4}
                />
              </div>
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                О И-Цзин
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                И-Цзин (Книга Перемен) — древнейшая китайская система гадания, основанная на 64 гексаграммах.
                Каждая гексаграмма состоит из шести линий и описывает определенную жизненную ситуацию.
                Выберите метод гадания и задайте вопрос, который вас волнует.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Consultation Result */}
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ваша консультация
              </h2>

              {/* Question */}
              <ResultCard
                title="Ваш вопрос"
                content={
                  <div>
                    <p className="italic mb-3">{consultation.question}</p>
                    <p className="text-gray-400 text-sm">
                      Метод: <span className="text-mirastros-gold">
                        {methods.find(m => m.value === consultation.method)?.label}
                      </span>
                    </p>
                  </div>
                }
                className="mb-6"
              />

              {/* Hexagrams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6">
                  <h3 className="font-cinzel text-xl font-bold text-white mb-2">
                    Гексаграмма {consultation.hexagram}
                  </h3>
                  <p className="text-mirastros-gold font-semibold text-lg mb-4">
                    {consultation.hexagramName}
                  </p>
                  <div className="flex flex-col gap-1">
                    {[1, 1, 0, 0, 1, 1].map((line, i) => (
                      <div
                        key={i}
                        className="h-2 bg-white/20 rounded"
                        style={{ width: line ? '100%' : '45%' }}
                      />
                    ))}
                  </div>
                </div>

                {consultation.resultingHexagram && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 className="font-cinzel text-xl font-bold text-white mb-2">
                      Результирующая
                    </h3>
                    <p className="text-white font-semibold mb-2">
                      Гексаграмма {consultation.resultingHexagram}
                    </p>
                    {consultation.changingLines && consultation.changingLines.length > 0 && (
                      <p className="text-gray-400 text-sm">
                        Изменяющиеся линии: {consultation.changingLines.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Interpretation */}
              <ResultText
                title="Толкование"
                content={consultation.interpretation}
                className="mb-6"
              />

              {/* Advice */}
              {consultation.advice && (
                <ResultCard
                  title="💡 Совет"
                  content={consultation.advice}
                  className="bg-mirastros-gold/10 border-mirastros-gold/30 mb-6"
                />
              )}

              {/* Actions */}
              <ResultActions
                onNewConsultation={handleNewConsultation}
                newConsultationLabel="Новая консультация"
                historyLink="/history"
              />
            </div>

            {/* Clarify with Mirastros */}
            <ClarifyButton
              onClarify={() => {
                console.log('Opening chat with I Ching context:', consultation);
              }}
              contextType="iching"
              contextData={consultation}
              available={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
