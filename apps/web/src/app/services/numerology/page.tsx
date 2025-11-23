'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ClarifyButton } from '../../../components/ClarifyButton';

const numberMeanings: Record<number, { title: string; description: string }> = {
  1: { title: 'Лидер', description: 'Независимость, инициатива, новые начинания' },
  2: { title: 'Дипломат', description: 'Сотрудничество, гармония, партнерство' },
  3: { title: 'Творец', description: 'Самовыражение, креативность, общение' },
  4: { title: 'Строитель', description: 'Стабильность, порядок, практичность' },
  5: { title: 'Искатель', description: 'Свобода, перемены, приключения' },
  6: { title: 'Воспитатель', description: 'Ответственность, забота, служение' },
  7: { title: 'Мыслитель', description: 'Духовность, анализ, мудрость' },
  8: { title: 'Магнат', description: 'Власть, материальный успех, амбиции' },
  9: { title: 'Гуманист', description: 'Сострадание, завершение, универсальность' },
  11: { title: 'Мастер-учитель', description: 'Интуиция, вдохновение, просветление' },
  22: { title: 'Мастер-строитель', description: 'Масштабные достижения, практическая мудрость' },
  33: { title: 'Мастер-целитель', description: 'Безусловная любовь, духовное служение' },
};

export default function NumerologyPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateLifePath = (dateStr: string): number => {
    const digits = dateStr.replace(/\D/g, '');
    let sum = 0;
    for (const digit of digits) {
      sum += parseInt(digit);
    }
    
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      const temp = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
      sum = temp;
    }
    
    return sum;
  };

  const calculateDestiny = (name: string): number => {
    const values: Record<string, number> = {
      'а': 1, 'б': 2, 'в': 3, 'г': 4, 'д': 5, 'е': 6, 'ё': 7, 'ж': 8, 'з': 9,
      'и': 1, 'й': 2, 'к': 3, 'л': 4, 'м': 5, 'н': 6, 'о': 7, 'п': 8, 'р': 9,
      'с': 1, 'т': 2, 'у': 3, 'ф': 4, 'х': 5, 'ц': 6, 'ч': 7, 'ш': 8, 'щ': 9,
      'ъ': 1, 'ы': 2, 'ь': 3, 'э': 4, 'ю': 5, 'я': 6,
      'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
      'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
      's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8,
    };

    let sum = 0;
    for (const char of name.toLowerCase().replace(/\s/g, '')) {
      sum += values[char] || 0;
    }

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      const temp = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
      sum = temp;
    }

    return sum;
  };

  const handleCalculate = async () => {
    if (!formData.fullName || !formData.birthDate) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await api.calculateNumerology({
        fullName: formData.fullName,
        birthDate: formData.birthDate,
      });
      setResult(result);
    } catch (err: any) {
      setError(err.message || 'Ошибка при расчете нумерологии');
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
            Нумерология
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Откройте тайны чисел вашего имени и даты рождения
          </p>
        </div>

        {!result ? (
          <>
            {/* Input Form */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ваши данные
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Полное имя *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Иван Иванович Иванов"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Дата рождения *
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? 'Расчет...' : 'Рассчитать нумерологию'}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                О нумерологии
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Нумерология — древняя наука о числах, которая раскрывает скрытые
                значения в вашем имени и дате рождения. Каждое число несет особую
                вибрацию и влияет на вашу судьбу.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ваши числа
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Life Path */}
                <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-cinzel text-xl font-bold text-white">
                      Число Жизненного Пути
                    </h3>
                    <div className="w-16 h-16 flex items-center justify-center bg-mirastros-gold text-black rounded-full text-2xl font-bold">
                      {result.lifePath}
                    </div>
                  </div>
                  <p className="text-mirastros-gold font-semibold mb-2">
                    {numberMeanings[result.lifePath]?.title}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {numberMeanings[result.lifePath]?.description}
                  </p>
                </div>

                {/* Destiny */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-cinzel text-xl font-bold text-white">
                      Число Судьбы
                    </h3>
                    <div className="w-16 h-16 flex items-center justify-center bg-white/10 text-white rounded-full text-2xl font-bold">
                      {result.destiny}
                    </div>
                  </div>
                  <p className="text-white font-semibold mb-2">
                    {numberMeanings[result.destiny]?.title}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {numberMeanings[result.destiny]?.description}
                  </p>
                </div>

                {/* Soul Urge */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-cinzel text-xl font-bold text-white">
                      Число Души
                    </h3>
                    <div className="w-16 h-16 flex items-center justify-center bg-white/10 text-white rounded-full text-2xl font-bold">
                      {result.soulUrge}
                    </div>
                  </div>
                  <p className="text-white font-semibold mb-2">
                    {numberMeanings[result.soulUrge]?.title}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {numberMeanings[result.soulUrge]?.description}
                  </p>
                </div>

                {/* Personality */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-cinzel text-xl font-bold text-white">
                      Число Личности
                    </h3>
                    <div className="w-16 h-16 flex items-center justify-center bg-white/10 text-white rounded-full text-2xl font-bold">
                      {result.personality}
                    </div>
                  </div>
                  <p className="text-white font-semibold mb-2">
                    {numberMeanings[result.personality]?.title}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {numberMeanings[result.personality]?.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setResult(null);
                    setFormData({ fullName: '', birthDate: '' });
                  }}
                  className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
                >
                  Новый расчет
                </button>
                <button className="flex-1 py-3 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition">
                  Скачать отчет
                </button>
              </div>
            </div>

            {/* Clarify with Mirastros */}
            <ClarifyButton
              onClarify={() => {
                // TODO: Open chat modal/page with context
                console.log('Opening chat with numerology context:', result);
              }}
              contextType="numerology"
              contextData={result}
              available={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
