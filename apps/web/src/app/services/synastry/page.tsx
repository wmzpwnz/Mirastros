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

export default function SynastryPage() {
  const [partner1Data, setPartner1Data] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  });
  const [partner2Data, setPartner2Data] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  });
  const [compatibility, setCompatibility] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePartner, setActivePartner] = useState<1 | 2>(1);

  const handleCalculateCompatibility = async () => {
    setError('');

    // Validate all required fields
    if (
      !partner1Data.name ||
      !partner1Data.birthDate ||
      !partner1Data.birthTime ||
      !partner1Data.birthLocation ||
      !partner2Data.name ||
      !partner2Data.birthDate ||
      !partner2Data.birthTime ||
      !partner2Data.birthLocation
    ) {
      setError('Пожалуйста, заполните все поля для обоих партнеров');
      return;
    }

    setLoading(true);

    try {
      const result = await api.calculateSynastry(partner1Data, partner2Data);
      setCompatibility({
        ...result,
        partner1Data,
        partner2Data,
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка при расчете синастрии');
    } finally {
      setLoading(false);
    }
  };

  const handleNewCalculation = () => {
    setCompatibility(null);
    setPartner1Data({
      name: '',
      birthDate: '',
      birthTime: '',
      birthLocation: '',
    });
    setPartner2Data({
      name: '',
      birthDate: '',
      birthTime: '',
      birthLocation: '',
    });
    setError('');
    setActivePartner(1);
  };

  const currentPartnerData = activePartner === 1 ? partner1Data : partner2Data;
  const setCurrentPartnerData = activePartner === 1 ? setPartner1Data : setPartner2Data;

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
            Синастрия
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Анализ совместимости двух людей через их натальные карты
          </p>
        </div>

        {!compatibility ? (
          <>
            {/* Synastry Input */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Данные партнеров
              </h2>

              {/* Partner Selection Tabs */}
              <div className="flex gap-4 mb-8 border-b border-white/10">
                <button
                  onClick={() => setActivePartner(1)}
                  className={`pb-4 px-4 font-semibold transition ${
                    activePartner === 1
                      ? 'text-mirastros-gold border-b-2 border-mirastros-gold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Партнер 1
                </button>
                <button
                  onClick={() => setActivePartner(2)}
                  className={`pb-4 px-4 font-semibold transition ${
                    activePartner === 2
                      ? 'text-mirastros-gold border-b-2 border-mirastros-gold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Партнер 2
                </button>
              </div>

              {/* Partner Data Form */}
              <DataForm
                data={currentPartnerData}
                onChange={setCurrentPartnerData}
                onSubmit={handleCalculateCompatibility}
                loading={loading}
                error={error}
                submitButtonText="Рассчитать совместимость"
                showSubmitButton={activePartner === 2}
              />
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">
                О синастрии
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Синастрия — это астрологический метод анализа совместимости двух людей.
                Она показывает, как планеты одного человека взаимодействуют с планетами другого,
                раскрывая гармоничные и напряженные аспекты отношений.
                Введите данные рождения обоих партнеров для анализа.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Compatibility Result */}
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Анализ совместимости
              </h2>

              {/* Partners Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ResultCard
                  title={`${compatibility.partner1Data.name}`}
                  content={
                    <div className="text-sm text-gray-300">
                      <p>
                        <span className="text-gray-400">Дата рождения:</span>{' '}
                        {compatibility.partner1Data.birthDate}
                      </p>
                      <p>
                        <span className="text-gray-400">Время:</span>{' '}
                        {compatibility.partner1Data.birthTime}
                      </p>
                      <p>
                        <span className="text-gray-400">Место:</span>{' '}
                        {compatibility.partner1Data.birthLocation}
                      </p>
                    </div>
                  }
                />
                <ResultCard
                  title={`${compatibility.partner2Data.name}`}
                  content={
                    <div className="text-sm text-gray-300">
                      <p>
                        <span className="text-gray-400">Дата рождения:</span>{' '}
                        {compatibility.partner2Data.birthDate}
                      </p>
                      <p>
                        <span className="text-gray-400">Время:</span>{' '}
                        {compatibility.partner2Data.birthTime}
                      </p>
                      <p>
                        <span className="text-gray-400">Место:</span>{' '}
                        {compatibility.partner2Data.birthLocation}
                      </p>
                    </div>
                  }
                />
              </div>

              {/* Compatibility Score */}
              {compatibility.compatibilityScore !== undefined && (
                <ResultCard
                  title="Оценка совместимости"
                  content={
                    <div className="text-center">
                      <div className="text-4xl font-bold text-mirastros-gold mb-2">
                        {compatibility.compatibilityScore}%
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-mirastros-gold h-2 rounded-full transition-all"
                          style={{ width: `${compatibility.compatibilityScore}%` }}
                        />
                      </div>
                    </div>
                  }
                  className="mb-6"
                />
              )}

              {/* Aspects */}
              {compatibility.aspects && compatibility.aspects.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-4">
                    Аспекты
                  </h3>
                  <div className="space-y-3">
                    {compatibility.aspects.map((aspect: any, i: number) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${
                          aspect.type === 'harmonious'
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <h4 className="font-semibold text-white mb-1">
                          {aspect.planet1} {aspect.aspect} {aspect.planet2}
                        </h4>
                        <p className="text-gray-300 text-sm">{aspect.interpretation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interpretation */}
              <ResultText
                title="Толкование"
                content={compatibility.interpretation}
                className="mb-6"
              />

              {/* Recommendations */}
              {compatibility.recommendations && compatibility.recommendations.length > 0 && (
                <ResultCard
                  title="💡 Рекомендации"
                  content={
                    <ul className="space-y-2">
                      {compatibility.recommendations.map((rec: string, i: number) => (
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
                console.log('Opening chat with synastry context:', compatibility);
              }}
              contextType="synastry"
              contextData={compatibility}
              available={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
