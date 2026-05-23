'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ClarifyButton } from '../../../components/ClarifyButton';
import { ResultCard } from '../../../components/ui/ResultCard';
import { ResultText } from '../../../components/ui/ResultText';
import { ErrorDisplay } from '../../../components/ui/ErrorDisplay';
import { LoadingIndicator } from '../../../components/ui/LoadingIndicator';

export default function MandalaPage() {
  const [generationType, setGenerationType] = useState<'birth' | 'intention' | 'random'>('random');
  const [intention, setIntention] = useState('');
  const [mandala, setMandala] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generationTypes = [
    { value: 'birth', label: 'На основе даты рождения', description: 'Персональная мандала' },
    { value: 'intention', label: 'На основе намерения', description: 'Мандала для цели' },
    { value: 'random', label: 'Случайная', description: 'Спонтанная мандала' },
  ];

  const handleGenerateMandala = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await api.generateMandala(generationType, intention);
      setMandala({
        ...result,
        generationType,
        intention,
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка при генерации мандалы');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNew = async () => {
    await handleGenerateMandala();
  };

  const handleDownload = async () => {
    if (!mandala || !mandala.imageUrl) return;

    try {
      const link = document.createElement('a');
      link.href = mandala.imageUrl;
      link.download = `mandala-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Ошибка при загрузке мандалы');
    }
  };

  const handleNewMandala = () => {
    setMandala(null);
    setIntention('');
    setGenerationType('random');
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
            Генерация мандал
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Создавайте персональные мандалы для медитации и духовной практики
          </p>
        </div>

        {loading ? (
          <LoadingIndicator serviceName="Мандала" />
        ) : error && !mandala ? (
          <ErrorDisplay error={error} onRetry={handleGenerateMandala} />
        ) : !mandala ? (
          <>
            {/* Mandala Generation Options */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Параметры генерации
              </h2>

              <div className="space-y-6">
                {/* Generation Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Тип генерации
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {generationTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setGenerationType(type.value as 'birth' | 'intention' | 'random')}
                        className={`p-4 rounded-lg transition text-left ${
                          generationType === type.value
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

                {/* Intention Input (if needed) */}
                {generationType === 'intention' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ваше намерение
                    </label>
                    <textarea
                      value={intention}
                      onChange={(e) => setIntention(e.target.value)}
                      placeholder="Опишите ваше намерение или цель..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-mirastros-gold"
                    />
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerateMandala}
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-lg transition bg-mirastros-gold hover:bg-mirastros-gold/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold"
                >
                  {loading ? 'Генерирую...' : 'Сгенерировать мандалу'}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                О мандалах
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Мандала — это священный геометрический символ, используемый в медитации и духовной практике.
                Каждая мандала уникальна и несет определенную энергию и смысл.
                Выберите тип генерации и создайте свою персональную мандалу.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Mandala Result */}
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ваша мандала
              </h2>

              {/* Mandala Image */}
              {mandala.imageUrl && (
                <div className="mb-6 text-center">
                  <img
                    src={mandala.imageUrl}
                    alt="Generated Mandala"
                    className="max-w-md mx-auto rounded-lg border border-mirastros-gold/30"
                  />
                </div>
              )}

              {/* Meaning */}
              {mandala.meaning && (
                <ResultText
                  title="Значение мандалы"
                  content={mandala.meaning}
                  className="mb-6"
                />
              )}

              {/* Meditation Guidance */}
              {mandala.meditationGuidance && (
                <ResultCard
                  title="🧘 Руководство для медитации"
                  content={<p className="text-gray-300 text-sm">{mandala.meditationGuidance}</p>}
                  className="bg-mirastros-gold/10 border-mirastros-gold/30 mb-6"
                />
              )}

              {/* Generation Info */}
              <ResultCard
                title="Информация о генерации"
                content={
                  <div className="text-sm text-gray-300">
                    <p>
                      <span className="text-gray-400">Тип:</span>{' '}
                      {generationTypes.find(t => t.value === mandala.generationType)?.label}
                    </p>
                    {mandala.intention && (
                      <p>
                        <span className="text-gray-400">Намерение:</span> {mandala.intention}
                      </p>
                    )}
                  </div>
                }
                className="mb-6"
              />

              {/* Actions */}
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleGenerateNew}
                  className="py-3 px-6 rounded-lg transition bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold"
                >
                  Сгенерировать новую
                </button>
                <button
                  onClick={handleDownload}
                  className="py-3 px-6 rounded-lg transition bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold"
                >
                  Загрузить
                </button>
                <button
                  onClick={handleNewMandala}
                  className="py-3 px-6 rounded-lg transition bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold"
                >
                  Новая генерация
                </button>
              </div>
            </div>

            {/* Clarify with Mirastros */}
            <ClarifyButton
              onClarify={() => {
                console.log('Opening chat with mandala context:', mandala);
              }}
              contextType="mandala"
              contextData={mandala}
              available={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
