'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

const ritualTypes = ['денежный', 'любовный', 'защитный', 'исцеляющий', 'лунный'];

export default function RitualsPage() {
  const [selectedType, setSelectedType] = useState('');
  const [ritual, setRitual] = useState<any>(null);

  const handleGetRitual = async () => {
    try {
      const result = await api.generateRitual(selectedType);
      setRitual(result);
    } catch (err: any) {
      console.error('Error generating ritual:', err);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <Link href="/dashboard" className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition">
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Ритуалы</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Персонализированные практики для достижения целей</p>
        </div>

        {!ritual ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Выберите тип ритуала</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {ritualTypes.map((type) => (
                  <button key={type} onClick={() => setSelectedType(type)}
                    className={`p-4 rounded-lg border-2 transition capitalize ${selectedType === type ? 'bg-mirastros-gold/10 border-mirastros-gold' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                    <span className="text-white font-semibold">{type}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleGetRitual} disabled={!selectedType}
                className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 text-lg">
                Получить ритуал
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">О ритуалах</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ритуалы — это священные практики, которые помогают сфокусировать намерение и направить энергию 
                на достижение цели. Каждый ритуал персонализирован с учетом вашей натальной карты и текущих транзитов.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-2">{ritual.name}</h2>
            <p className="text-gray-400 mb-6 capitalize">Тип: {ritual.type}</p>

            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Необходимые предметы</h3>
              <div className="flex flex-wrap gap-2">
                {ritual.items.map((item: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-mirastros-gold/20 text-mirastros-gold rounded-lg text-sm font-semibold">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-4">Шаги выполнения</h3>
              <ol className="space-y-3">
                {ritual.steps.map((step: string, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-mirastros-gold text-black rounded-full font-bold text-sm">
                      {i + 1}
                    </span>
                    <span className="text-gray-300 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-4">
                <h4 className="font-semibold text-mirastros-gold mb-2">⏰ Время проведения</h4>
                <p className="text-gray-300 text-sm">{ritual.timing}</p>
              </div>
              <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-4">
                <h4 className="font-semibold text-mirastros-gold mb-2">💡 Совет</h4>
                <p className="text-gray-300 text-sm">{ritual.advice}</p>
              </div>
            </div>

            <button onClick={() => { setRitual(null); setSelectedType(''); }}
              className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition">
              Выбрать другой ритуал
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
