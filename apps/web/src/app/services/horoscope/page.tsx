'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

const zodiacSigns = [
  { id: 'aries', name: 'Овен', symbol: '♈', dates: '21 марта - 19 апреля' },
  { id: 'taurus', name: 'Телец', symbol: '♉', dates: '20 апреля - 20 мая' },
  { id: 'gemini', name: 'Близнецы', symbol: '♊', dates: '21 мая - 20 июня' },
  { id: 'cancer', name: 'Рак', symbol: '♋', dates: '21 июня - 22 июля' },
  { id: 'leo', name: 'Лев', symbol: '♌', dates: '23 июля - 22 августа' },
  { id: 'virgo', name: 'Дева', symbol: '♍', dates: '23 августа - 22 сентября' },
  { id: 'libra', name: 'Весы', symbol: '♎', dates: '23 сентября - 22 октября' },
  { id: 'scorpio', name: 'Скорпион', symbol: '♏', dates: '23 октября - 21 ноября' },
  { id: 'sagittarius', name: 'Стрелец', symbol: '♐', dates: '22 ноября - 21 декабря' },
  { id: 'capricorn', name: 'Козерог', symbol: '♑', dates: '22 декабря - 19 января' },
  { id: 'aquarius', name: 'Водолей', symbol: '♒', dates: '20 января - 18 февраля' },
  { id: 'pisces', name: 'Рыбы', symbol: '♓', dates: '19 февраля - 20 марта' },
];

export default function HoroscopePage() {
  const [selectedSign, setSelectedSign] = useState('aries');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [horoscope, setHoroscope] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHoroscope();
  }, [selectedSign, period]);

  const loadHoroscope = async () => {
    setLoading(true);
    try {
      const result = await api.getHoroscope(selectedSign, period);
      setHoroscope(result);
    } catch (error) {
      console.error('Failed to load horoscope:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedZodiac = zodiacSigns.find((z) => z.id === selectedSign);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link
            href="/dashboard"
            className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition"
          >
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">
            Гороскоп
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Узнайте, что говорят звезды о вашем знаке зодиака
          </p>
        </div>

        {/* Period Selection */}
        <div className="mb-8 flex justify-center gap-4">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                period === p
                  ? 'bg-mirastros-gold text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {p === 'daily' ? 'Сегодня' : p === 'weekly' ? 'Неделя' : 'Месяц'}
            </button>
          ))}
        </div>

        {/* Zodiac Sign Selection */}
        <div className="mb-12">
          <h2 className="font-cinzel text-2xl font-bold text-white mb-6 text-center">
            Выберите знак зодиака
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {zodiacSigns.map((sign) => (
              <button
                key={sign.id}
                onClick={() => setSelectedSign(sign.id)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedSign === sign.id
                    ? 'bg-mirastros-gold/10 border-mirastros-gold'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-4xl mb-2">{sign.symbol}</div>
                <p className="text-white font-semibold text-sm">{sign.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Horoscope Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mirastros-gold mx-auto mb-4"></div>
            <p className="text-gray-400">Загрузка гороскопа...</p>
          </div>
        ) : horoscope ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="text-6xl">{selectedZodiac?.symbol}</div>
              <div>
                <h2 className="font-cinzel text-3xl font-bold text-white mb-1">
                  {selectedZodiac?.name}
                </h2>
                <p className="text-gray-400 text-sm">{selectedZodiac?.dates}</p>
              </div>
            </div>

            {/* Prediction */}
            <div className="mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white mb-4">
                Прогноз
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {horoscope.prediction}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Lucky Numbers */}
              {horoscope.luckyNumbers && horoscope.luckyNumbers.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Счастливые числа
                  </h4>
                  <div className="flex gap-2">
                    {horoscope.luckyNumbers.map((num: number, i: number) => (
                      <span
                        key={i}
                        className="w-10 h-10 flex items-center justify-center bg-mirastros-gold/20 text-mirastros-gold rounded-full font-bold"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lucky Colors */}
              {horoscope.luckyColors && horoscope.luckyColors.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Счастливые цвета
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {horoscope.luckyColors.map((color: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-mirastros-gold/20 text-mirastros-gold rounded-full text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Compatibility */}
              {horoscope.compatibility && horoscope.compatibility.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Совместимость
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {horoscope.compatibility.map((sign: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/10 text-white rounded-full text-sm"
                      >
                        {sign}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Advice */}
              {horoscope.advice && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Совет дня</h4>
                  <p className="text-gray-300 text-sm">{horoscope.advice}</p>
                </div>
              )}
            </div>

            {/* Share Button */}
            <div className="flex gap-4">
              <button className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition">
                Поделиться
              </button>
              <Link
                href="/services/natal"
                className="flex-1 py-3 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition text-center"
              >
                Персональный прогноз
              </Link>
            </div>
          </div>
        ) : null}

        {/* Info */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="font-cinzel text-lg font-bold text-white mb-3">
            О гороскопах
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Гороскопы основаны на положении планет и их влиянии на каждый знак
            зодиака. Наш AI-астролог анализирует текущие транзиты и создает
            персонализированные прогнозы для вашего знака.
          </p>
        </div>
      </div>
    </div>
  );
}
