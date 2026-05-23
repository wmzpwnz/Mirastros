'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ClarifyButton } from '../../../components/ClarifyButton';
import { DataForm, type FormData } from '../../../components/ui/DataForm';
import { ResultCard } from '../../../components/ui/ResultCard';
import { ResultActions } from '../../../components/ui/ResultActions';
import { LoadingIndicator } from '../../../components/ui/LoadingIndicator';
import { ErrorDisplay } from '../../../components/ui/ErrorDisplay';

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
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: '',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDataChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleCalculate = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await api.calculateNumerology({
        fullName: formData.name || '',
        birthDate: formData.birthDate || '',
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Ошибка при расчете нумерологии');
    } finally {
      setLoading(false);
    }
  };

  const handleNewCalculation = () => {
    setResult(null);
    setFormData({ name: '', birthDate: '' });
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

              <DataForm
                data={formData}
                onDataChange={handleDataChange}
                onSubmit={handleCalculate}
                loading={loading}
                error={error}
                fields={[
                  {
                    name: 'name',
                    label: 'Полное имя',
                    type: 'text',
                    placeholder: 'Иван Иванович Иванов',
                    required: true,
                  },
                  {
                    name: 'birthDate',
                    label: 'Дата рождения',
                    type: 'date',
                    required: true,
                  },
                ]}
                submitButtonText="Рассчитать нумерологию"
              />
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
            <div className="mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
                Ваши числа
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Life Path */}
                <ResultCard
                  title="Число Жизненного Пути"
                  content={
                    <div>
                      <div className="flex items-center justify-between mb-4">
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
                  }
                  className="bg-mirastros-gold/10 border-mirastros-gold/30"
                />

                {/* Destiny */}
                <ResultCard
                  title="Число Судьбы"
                  content={
                    <div>
                      <div className="flex items-center justify-between mb-4">
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
                  }
                />

                {/* Soul Urge */}
                <ResultCard
                  title="Число Души"
                  content={
                    <div>
                      <div className="flex items-center justify-between mb-4">
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
                  }
                />

                {/* Personality */}
                <ResultCard
                  title="Число Личности"
                  content={
                    <div>
                      <div className="flex items-center justify-between mb-4">
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
                  }
                />
              </div>

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
