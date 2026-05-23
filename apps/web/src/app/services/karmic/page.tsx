'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ClarifyButton } from '../../../components/ClarifyButton';
import { DataForm } from '../../../components/ui/DataForm';
import { ResultCard } from '../../../components/ui/ResultCard';
import { ResultText } from '../../../components/ui/ResultText';
import { ResultActions } from '../../../components/ui/ResultActions';
import { ErrorDisplay } from '../../../components/ui/ErrorDisplay';

export default function KarmicPage() {
  const [birthData, setBirthData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  });
  const [karmicAnalysis, setKarmicAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRevealKarmicLessons = async () => {
    setError('');

    // Validate all required fields
    if (
      !birthData.name ||
      !birthData.birthDate ||
      !birthData.birthTime ||
      !birthData.birthLocation
    ) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);

    try {
      const result = await api.getKarmicLessons(birthData);
      setKarmicAnalysis({
        ...result,
        birthData,
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка при получении кармических уроков');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setKarmicAnalysis(null);
    setBirthData({
      name: '',
      birthDate: '',
      birthTime: '',
      birthLocation: '',
    });
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
            Кармические уроки
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Понимание вашего духовного пути и личностного роста
          </p>
        </div>

        {!karmicAnalysis ? (
          <>
            {/* Karmic Analysis Input */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Данные для анализа
              </h2>

              <DataForm
                data={birthData}
                onChange={setBirthData}
                onSubmit={handleRevealKarmicLessons}
                loading={loading}
                error={error}
                submitButtonText="Раскрыть кармические уроки"
              />
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                О кармических уроках
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Кармические уроки — это духовные задачи и вызовы, которые вы пришли решить в этой жизни.
                Они показывают области личностного роста и развития, которые необходимы для вашей эволюции.
                Введите ваши данные рождения для анализа.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Karmic Analysis Result */}
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ваши кармические уроки
              </h2>

              {/* User Info */}
              <ResultCard
                title="Ваши данные"
                content={
                  <div className="text-sm text-gray-300">
                    <p>
                      <span className="text-gray-400">Имя:</span> {karmicAnalysis.birthData.name}
                    </p>
                    <p>
                      <span className="text-gray-400">Дата рождения:</span>{' '}
                      {karmicAnalysis.birthData.birthDate}
                    </p>
                  </div>
                }
                className="mb-6"
              />

              {/* Primary Lessons */}
              {karmicAnalysis.primaryLessons && karmicAnalysis.primaryLessons.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-4">
                    Основные кармические уроки
                  </h3>
                  <div className="space-y-3">
                    {karmicAnalysis.primaryLessons.map((lesson: any, i: number) => (
                      <div
                        key={i}
                        className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-4"
                      >
                        <h4 className="font-semibold text-white mb-2">{lesson.title}</h4>
                        <p className="text-gray-300 text-sm">{lesson.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Growth Areas */}
              {karmicAnalysis.growthAreas && karmicAnalysis.growthAreas.length > 0 && (
                <ResultCard
                  title="Области роста"
                  content={
                    <ul className="space-y-2">
                      {karmicAnalysis.growthAreas.map((area: string, i: number) => (
                        <li key={i} className="text-gray-300 text-sm flex gap-2">
                          <span className="text-mirastros-gold">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  }
                  className="mb-6"
                />
              )}

              {/* Spiritual Guidance */}
              {karmicAnalysis.spiritualGuidance && (
                <ResultText
                  title="Духовное руководство"
                  content={karmicAnalysis.spiritualGuidance}
                  className="mb-6"
                />
              )}

              {/* Recommendations */}
              {karmicAnalysis.recommendations && karmicAnalysis.recommendations.length > 0 && (
                <ResultCard
                  title="💡 Рекомендации для развития"
                  content={
                    <ul className="space-y-2">
                      {karmicAnalysis.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-gray-300 text-sm flex gap-2">
                          <span className="text-mirastros-gold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  }
                  className="bg-mirastros-gold/10 border-mirastros-gold/30 mb-6"
                />
              )}

              {/* Actions */}
              <ResultActions
                onNewConsultation={handleNewAnalysis}
                newConsultationLabel="Новый анализ"
                historyLink="/history"
              />
            </div>

            {/* Clarify with Mirastros */}
            <ClarifyButton
              onClarify={() => {
                console.log('Opening chat with karmic context:', karmicAnalysis);
              }}
              contextType="karmic"
              contextData={karmicAnalysis}
              available={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
