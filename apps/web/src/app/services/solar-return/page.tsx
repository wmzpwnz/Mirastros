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

export default function SolarReturnPage() {
  const [birthData, setBirthData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  });
  const [solarReturn, setSolarReturn] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculateSolarReturn = async () => {
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
      const result = await api.calculateSolarReturn(birthData);
      setSolarReturn({
        ...result,
        birthData,
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка при расчете солнечного возврата');
    } finally {
      setLoading(false);
    }
  };

  const handleNewCalculation = () => {
    setSolarReturn(null);
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
            Солнечный возврат
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Понимание тем вашего предстоящего года
          </p>
        </div>

        {!solarReturn ? (
          <>
            {/* Solar Return Input */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Данные для расчета
              </h2>

              <DataForm
                data={birthData}
                onChange={setBirthData}
                onSubmit={handleCalculateSolarReturn}
                loading={loading}
                error={error}
                submitButtonText="Рассчитать солнечный возврат"
              />
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                О солнечном возврате
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Солнечный возврат — это астрологическая карта момента, когда Солнце возвращается
                на ту же позицию, что и в момент вашего рождения.
                Это происходит примерно один раз в год и показывает основные темы и события предстоящего года.
                Введите ваши данные рождения для расчета.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Solar Return Result */}
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ваш солнечный возврат
              </h2>

              {/* User Info */}
              <ResultCard
                title="Ваши данные"
                content={
                  <div className="text-sm text-gray-300">
                    <p>
                      <span className="text-gray-400">Имя:</span> {solarReturn.birthData.name}
                    </p>
                    <p>
                      <span className="text-gray-400">Дата рождения:</span>{' '}
                      {solarReturn.birthData.birthDate}
                    </p>
                  </div>
                }
                className="mb-6"
              />

              {/* Solar Return Date */}
              {solarReturn.solarReturnDate && (
                <ResultCard
                  title="Дата солнечного возврата"
                  content={
                    <p className="text-white font-semibold">
                      {solarReturn.solarReturnDate}
                    </p>
                  }
                  className="mb-6"
                />
              )}

              {/* Main Themes */}
              {solarReturn.mainThemes && solarReturn.mainThemes.length > 0 && (
                <ResultCard
                  title="Основные темы года"
                  content={
                    <ul className="space-y-2">
                      {solarReturn.mainThemes.map((theme: string, i: number) => (
                        <li key={i} className="text-gray-300 text-sm flex gap-2">
                          <span className="text-mirastros-gold">•</span>
                          <span>{theme}</span>
                        </li>
                      ))}
                    </ul>
                  }
                  className="mb-6"
                />
              )}

              {/* Chart Interpretation */}
              {solarReturn.chartInterpretation && (
                <ResultText
                  title="Толкование карты"
                  content={solarReturn.chartInterpretation}
                  className="mb-6"
                />
              )}

              {/* Yearly Forecast */}
              {solarReturn.yearlyForecast && (
                <ResultText
                  title="Прогноз на год"
                  content={solarReturn.yearlyForecast}
                  className="mb-6"
                />
              )}

              {/* Recommendations */}
              {solarReturn.recommendations && solarReturn.recommendations.length > 0 && (
                <ResultCard
                  title="💡 Рекомендации"
                  content={
                    <ul className="space-y-2">
                      {solarReturn.recommendations.map((rec: string, i: number) => (
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
                onNewConsultation={handleNewCalculation}
                newConsultationLabel="Новый расчет"
                historyLink="/history"
              />
            </div>

            {/* Clarify with Mirastros */}
            <ClarifyButton
              onClarify={() => {
                console.log('Opening chat with solar return context:', solarReturn);
              }}
              contextType="solar-return"
              contextData={solarReturn}
              available={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
