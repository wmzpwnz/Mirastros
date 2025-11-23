'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

export default function HoraryPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    try {
      const result = await api.askHoraryQuestion(question);
      setAnswer(result);
    } catch (err: any) {
      console.error('Error asking horary question:', err);
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
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Хорарная астрология</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Ответы на конкретные вопросы с указанием времени</p>
          <div className="mt-4 inline-block px-4 py-2 bg-mirastros-gold/20 text-mirastros-gold rounded-lg text-sm">
            ⭐ Доступно для Platinum подписки
          </div>
        </div>

        {!answer ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Задайте вопрос</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ваш вопрос (должен требовать ответа да/нет) *
                  </label>
                  <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Например: Получу ли я эту работу? Стоит ли мне переезжать?"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold transition resize-none"
                    rows={4} />
                </div>
                <button onClick={handleAsk} disabled={loading || !question.trim()}
                  className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 text-lg">
                  {loading ? 'Построение хорарной карты...' : 'Получить ответ'}
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">О хорарной астрологии</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Хорарная астрология отвечает на конкретные вопросы, строя карту на момент задания вопроса. 
                Она дает точные ответы да/нет и указывает время событий.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${answer.answer === 'Да' ? 'bg-green-500/20 border-4 border-green-500' : 'bg-red-500/20 border-4 border-red-500'}`}>
                <span className={`text-4xl font-bold ${answer.answer === 'Да' ? 'text-green-400' : 'text-red-400'}`}>{answer.answer}</span>
              </div>
              <p className="text-gray-400 italic">{answer.question}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Уверенность</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-mirastros-gold" style={{ width: `${answer.confidence}%` }} />
                  </div>
                  <span className="text-mirastros-gold font-bold">{answer.confidence}%</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Время события</h4>
                <p className="text-mirastros-gold">{answer.timing}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Объяснение</h3>
              <p className="text-gray-300 leading-relaxed">{answer.explanation}</p>
            </div>

            <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6 mb-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">Рекомендации</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{answer.advice}</p>
            </div>

            <button onClick={() => { setAnswer(null); setQuestion(''); }}
              className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition">
              Задать новый вопрос
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
