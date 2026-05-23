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

export default function ChakraPage() {
  const [birthData, setBirthData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyzeChakras = async () => {
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
      const result = await api.analyzeChakras(birthData);
      setAnalysis({
        ...result,
        birthData,
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка при анализе чакр');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
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
            Анализ чакр
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Понимание баланса ваших энергетических центров
          </p>
        </div>

        {!analysis ? (
          <>
            {/* Chakra Analysis Input */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Данные для анализа
              </h2>

              <DataForm
                data={birthData}
                onChange={setBirthData}
                onSubmit={handleAnalyzeChakras}
                loading={loading}
                error={error}
                submitButtonText="Анализировать чакры"
              />
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                О чакрах
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Чакры — это энергетические центры в теле человека, каждый из которых отвечает
                за определенные аспекты жизни и здоровья.
                Анализ чакр помогает понять, какие центры находятся в гармонии, а какие нуждаются в исцелении.
                Введите ваши данные рождения для анализа.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Analysis Result */}
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Анализ ваших чакр
              </h2>

              {/* User Info */}
              <ResultCard
                title="Ваши данные"
                content={
                  <div className="text-sm text-gray-300">
                    <p>
                      <span className="text-gray-400">Имя:</span> {analysis.birthData.name}
                    </p>
                    <p>
                      <span className="text-gray-400">Дата рождения:</span>{' '}
                      {analysis.birthData.birthDate}
                    </p>
                  </div>
                }
                className="mb-6"
              />

              {/* Chakras */}
              {analysis.chakras && analysis.chakras.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-4">
                    Состояние чакр
                  </h3>
                  <div className="space-y-4">
                    {analysis.chakras.map((chakra: any, i: number) => (
                      <div
                        key={i}
                        className="bg-white/5 border border-white/10 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{chakra.name}</h4>
                          <div className="text-2xl">{chakra.emoji || '🔮'}</div>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{chakra.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">Баланс:</span>
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div
                              className="bg-mirastros-gold h-2 rounded-full transition-all"
                              style={{ width: `${chakra.balance}%` }}
                            />
                          </div>
                          <span className="text-gray-400 text-xs">{chakra.balance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Balance */}
              {analysis.overallBalance !== undefined && (
                <ResultCard
                  title="Общий баланс"
                  content={
                    <div className="text-center">
                      <div className="text-4xl font-bold text-mirastros-gold mb-2">
                        {analysis.overallBalance}%
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-mirastros-gold h-2 rounded-full transition-all"
                          style={{ width: `${analysis.overallBalance}%` }}
                        />
                      </div>
                    </div>
                  }
                  className="mb-6"
                />
              )}

              {/* Interpretation */}
              {analysis.interpretation && (
                <ResultText
                  title="Толкование"
                  content={analysis.interpretation}
                  className="mb-6"
                />
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <ResultCard
                  title="💡 Рекомендации"
                  content={
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec: string, i: number) => (
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
                console.log('Opening chat with chakra context:', analysis);
              }}
              contextType="chakra"
              contextData={analysis}
              available={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
