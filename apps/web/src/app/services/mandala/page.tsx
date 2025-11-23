'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

export default function MandalaPage() {
  const [birthDate, setBirthDate] = useState('');
  const [mandala, setMandala] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await api.generateMandala(birthDate);
      setMandala(result);
    } catch (err: any) {
      console.error('Error generating mandala:', err);
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
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Персональная мандала</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Создайте уникальную мандалу для медитации</p>
        </div>

        {!mandala ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Генерация мандалы</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Дата рождения *</label>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold transition" />
                  <p className="mt-1 text-xs text-gray-500">Мандала будет создана на основе вашей натальной карты</p>
                </div>
                <button onClick={handleGenerate} disabled={loading || !birthDate}
                  className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 text-lg">
                  {loading ? 'Создание мандалы...' : 'Создать мандалу'}
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">О мандалах</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Мандала — это священный геометрический символ, используемый для медитации и духовной практики. 
                Персональная мандала создается на основе вашей натальной карты и отражает уникальную энергию вашей души.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Ваша персональная мандала</h2>

            {/* Mandala Visualization */}
            <div className="mb-8 flex justify-center">
              <div className="w-80 h-80 rounded-full bg-gradient-to-br from-mirastros-gold via-purple-500 to-blue-500 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-4 rounded-full bg-black/20 backdrop-blur-sm" />
                <div className="absolute inset-8 rounded-full border-4 border-white/30" />
                <div className="absolute inset-16 rounded-full border-2 border-white/20" />
                <div className="absolute w-32 h-32 rounded-full bg-mirastros-gold/50" />
                <div className="absolute text-white text-6xl">✦</div>
              </div>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Цвета вашей мандалы</h3>
              <div className="flex gap-2">
                {mandala.colors.map((color: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-mirastros-gold/20 text-mirastros-gold rounded-lg text-sm font-semibold capitalize">
                    {color}
                  </span>
                ))}
              </div>
            </div>

            {/* Symbolism */}
            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Символизм</h3>
              <p className="text-gray-300 leading-relaxed">{mandala.symbolism}</p>
            </div>

            {/* Meditation Instructions */}
            <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6 mb-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">Инструкция для медитации</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{mandala.meditation}</p>
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Польза практики</h3>
              <ul className="grid grid-cols-2 gap-3">
                {mandala.benefits.map((benefit: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <span className="text-mirastros-gold">✓</span><span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={() => { setMandala(null); setBirthDate(''); }}
                className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition">
                Создать новую
              </button>
              <button className="flex-1 py-3 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition">
                Скачать изображение
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
