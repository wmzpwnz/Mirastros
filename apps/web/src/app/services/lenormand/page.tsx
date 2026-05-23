'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ClarifyButton } from '../../../components/ClarifyButton';
import { QuestionForm } from '../../../components/ui/QuestionForm';
import { ResultCard } from '../../../components/ui/ResultCard';
import { ResultText } from '../../../components/ui/ResultText';
import { ResultActions } from '../../../components/ui/ResultActions';

export default function LenormandPage() {
  const [question, setQuestion] = useState<string>('');
  const [spreadType, setSpreadType] = useState<string>('three');
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const spreadTypes = [
    { value: 'one', label: 'Одна карта', description: 'Быстрый ответ' },
    { value: 'three', label: 'Три карты', description: 'Прошлое, настоящее, будущее' },
    { value: 'nine', label: 'Девять карт', description: 'Полный расклад' },
  ];

  const handleGetReading = async (): Promise<void> => {
    setError('');
    setLoading(true);

    try {
      const result = await api.getLenormandReading(spreadType, question);
      setReading({
        ...result,
        question,
        spreadType,
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка при получении расклада Ленормана');
    } finally {
      setLoading(false);
    }
  };

  const handleNewReading = () => {
    setReading(null);
    setQuestion('');
    setSpreadType('three');
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
            Карты Ленормана
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Прямые и практичные ответы на ваши вопросы
          </p>
        </div>

        {!reading ? (
          <>
            {/* Lenormand Reading Input */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Расклад Ленормана
              </h2>

              <div className="space-y-6">
                {/* Spread Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Тип расклада
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {spreadTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSpreadType(type.value)}
                        className={`p-4 rounded-lg transition text-left ${
                          spreadType === type.value
                            ? 'bg-mirastros-gold text-black'
                            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <div className="font-semibold">{type.label}</div>
                        <div className="text-xs opacity-75">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Input */}
                <QuestionForm
                  question={question}
                  onQuestionChange={setQuestion}
                  onSubmit={handleGetReading}
                  loading={loading}
                  error={error}
                  placeholder="Задайте конкретный вопрос о ситуации, которая вас интересует..."
                  submitButtonText="Получить расклад"
                  rows={4}
                />
              </div>
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                О картах Ленормана
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Карты Ленормана — это система гадания, известная своей точностью и прямотой.
                Каждая карта имеет четкое значение и легко интерпретируется.
                Расклад Ленормана помогает получить практичные и конкретные ответы на ваши вопросы.
                Выберите тип расклада и задайте вопрос, который вас волнует.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Reading Result */}
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ваш расклад Ленормана
              </h2>

              {/* Question */}
              <ResultCard
                title="Ваш вопрос"
                content={
                  <div>
                    <p className="italic mb-3">{reading.question}</p>
                    <p className="text-gray-400 text-sm">
                      Тип расклада: <span className="text-mirastros-gold">
                        {spreadTypes.find(t => t.value === reading.spreadType)?.label}
                      </span>
                    </p>
                  </div>
                }
                className="mb-6"
              />

              {/* Cards */}
              {reading.cards && reading.cards.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-4">
                    Выпавшие карты
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reading.cards.map((card: any, i: number) => (
                      <div
                        key={i}
                        className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-4"
                      >
                        <div className="text-3xl mb-2 text-center">🃏</div>
                        <h4 className="font-semibold text-white text-center mb-2">{card.name}</h4>
                        <p className="text-gray-300 text-sm text-center">{card.meaning}</p>
                        {card.position && (
                          <p className="text-mirastros-gold text-xs text-center mt-2">{card.position}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interpretation */}
              <ResultText
                title="Толкование"
                content={reading.interpretation}
                className="mb-6"
              />

              {/* Advice */}
              {reading.advice && (
                <ResultCard
                  title="💡 Совет"
                  content={reading.advice}
                  className="bg-mirastros-gold/10 border-mirastros-gold/30 mb-6"
                />
              )}

              {/* Actions */}
              <ResultActions
                onNewConsultation={handleNewReading}
                newConsultationLabel="Новый расклад"
                historyLink="/history"
              />
            </div>

            {/* Clarify with Mirastros */}
            <ClarifyButton
              onClarify={() => {
                console.log('Opening chat with lenormand context:', reading);
              }}
              contextType="lenormand"
              contextData={reading}
              available={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
