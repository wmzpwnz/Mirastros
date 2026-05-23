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

export default function HoraryPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetAnswer = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await api.getHoraryAnswer(question);
      setAnswer({
        ...result,
        question,
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка при получении ответа');
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuestion = () => {
    setAnswer(null);
    setQuestion('');
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
            Хорарная астрология
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Получите прямые ответы на конкретные вопросы
          </p>
        </div>

        {!answer ? (
          <>
            {/* Horary Question Input */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Задайте вопрос
              </h2>

              <QuestionForm
                question={question}
                onQuestionChange={setQuestion}
                onSubmit={handleGetAnswer}
                loading={loading}
                error={error}
                placeholder="Задайте конкретный вопрос, на который нужен ясный ответ (да/нет)..."
                submitButtonText="Получить ответ"
                rows={4}
              />
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                О хорарной астрологии
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Хорарная астрология — это древний метод получения ответов на конкретные вопросы
                через анализ астрологической карты момента вопроса.
                Она дает четкие и прямые ответы на вопросы, требующие решения.
                Задайте вопрос, который вас волнует, и получите ясный ответ.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Answer Result */}
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ответ на ваш вопрос
              </h2>

              {/* Question */}
              <ResultCard
                title="Ваш вопрос"
                content={<p className="italic text-gray-300">{answer.question}</p>}
                className="mb-6"
              />

              {/* Answer */}
              <ResultCard
                title="Ответ"
                content={
                  <div className="text-center">
                    <div className="text-5xl font-bold text-mirastros-gold mb-4">
                      {answer.answer === 'yes' ? '✓ ДА' : answer.answer === 'no' ? '✗ НЕТ' : '?'}
                    </div>
                    <p className="text-gray-300 text-sm">{answer.answerExplanation}</p>
                  </div>
                }
                className="bg-mirastros-gold/10 border-mirastros-gold/30 mb-6"
              />

              {/* Horary Chart */}
              {answer.chart && (
                <ResultCard
                  title="Хорарная карта"
                  content={
                    <div>
                      <p className="text-gray-300 text-sm mb-2">{answer.chart.description}</p>
                      {answer.chart.significators && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-gray-400 text-xs mb-2">Сигнификаторы:</p>
                          <p className="text-gray-300 text-sm">{answer.chart.significators}</p>
                        </div>
                      )}
                    </div>
                  }
                  className="mb-6"
                />
              )}

              {/* Interpretation */}
              {answer.interpretation && (
                <ResultCard
                  title="Толкование"
                  content={<p className="text-gray-300 text-sm">{answer.interpretation}</p>}
                  className="mb-6"
                />
              )}

              {/* Advice */}
              {answer.advice && (
                <ResultCard
                  title="💡 Совет"
                  content={<p className="text-gray-300 text-sm">{answer.advice}</p>}
                  className="bg-mirastros-gold/10 border-mirastros-gold/30 mb-6"
                />
              )}

              {/* Actions */}
              <ResultActions
                onNewConsultation={handleNewQuestion}
                newConsultationLabel="Новый вопрос"
                historyLink="/history"
              />
            </div>

            {/* Clarify with Mirastros */}
            <ClarifyButton
              onClarify={() => {
                console.log('Opening chat with horary context:', answer);
              }}
              contextType="horary"
              contextData={answer}
              available={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
