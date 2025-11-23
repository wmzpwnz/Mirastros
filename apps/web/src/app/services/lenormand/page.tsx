'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

const spreadTypes = [
  { id: '3-card', name: '3 карты', description: 'Прошлое-Настоящее-Будущее', cards: 3 },
  { id: '5-card', name: '5 карт', description: 'Детальный анализ', cards: 5 },
  { id: '9-card', name: '9 карт', description: 'Большой расклад', cards: 9 },
];

export default function LenormandPage() {
  const [selectedSpread, setSelectedSpread] = useState('3-card');
  const [question, setQuestion] = useState('');
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGetReading = async () => {
    setLoading(true);
    try {
      const result = await api.getLenormandReading(selectedSpread, question);
      setReading(result);
    } catch (err: any) {
      console.error('Error getting Lenormand reading:', err);
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
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Ленорман</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Конкретные ответы на ваши вопросы</p>
        </div>

        {!reading ? (
          <>
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-4">Выберите расклад</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {spreadTypes.map((spread) => (
                  <button key={spread.id} onClick={() => setSelectedSpread(spread.id)}
                    className={`p-6 rounded-lg border-2 transition ${selectedSpread === spread.id ? 'bg-mirastros-gold/10 border-mirastros-gold' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                    <h3 className="font-cinzel text-xl font-bold text-white mb-2">{spread.name}</h3>
                    <p className="text-gray-400 text-sm">{spread.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
                placeholder="Задайте конкретный вопрос..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold transition resize-none" rows={4} />
            </div>
            <button onClick={handleGetReading} disabled={loading}
              className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 text-lg">
              {loading ? 'Карты раскладываются...' : 'Получить расклад'}
            </button>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Ваш расклад</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {reading.cards.map((card: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">🃏</div>
                  <p className="text-white font-semibold">{card.name}</p>
                  <p className="text-gray-400 text-sm">{card.meaning}</p>
                </div>
              ))}
            </div>
            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Толкование</h3>
              <p className="text-gray-300 leading-relaxed">{reading.interpretation}</p>
            </div>
            <button onClick={() => { setReading(null); setQuestion(''); }}
              className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition">
              Новый расклад
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
