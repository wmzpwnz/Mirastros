'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import type { DestinyMatrix } from '../../types';
import { DestinyMatrixView } from '../destiny/DestinyMatrixView';
import { ServiceSection } from './ServiceSection';
import { SERVICE_TUNNEL_MEDIA } from '../../constants/tunnelMedia';

const HERO_CACHE_PREFIX = 'mira_hero_cache_';
const MATRIX_UPDATED_EVENT = 'mira:matrix-updated';
const normalizeBirthDate = (value?: string | null) =>
  (value || '').split('T')[0];

interface DestinyMatrixSectionProps {
  id?: string;
  embedded?: boolean;
}

export default function DestinyMatrixSection({
  id,
  embedded = false,
}: DestinyMatrixSectionProps) {
  const router = useRouter();
  const [matrixData, setMatrixData] = useState<DestinyMatrix | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCalculateForm, setShowCalculateForm] = useState(false);
  const [birthDate, setBirthDate] = useState('');

  const isLegacy = useMemo(
    () => !!matrixData && matrixData.calculation_version === 'v1',
    [matrixData]
  );

  useEffect(() => {
    void loadMatrix();
  }, []);

  const syncHeroCache = (matrix: DestinyMatrix) => {
    if (typeof window === 'undefined' || !matrix?.birth_date) return;
    try {
      const normalizedBirthDate = normalizeBirthDate(matrix.birth_date);
      const payload = JSON.stringify({
        data: matrix,
        timestamp: Date.now(),
      });

      sessionStorage.setItem(
        `${HERO_CACHE_PREFIX}matrix_${normalizedBirthDate}`,
        payload
      );

      if (matrix.birth_date !== normalizedBirthDate) {
        sessionStorage.setItem(
          `${HERO_CACHE_PREFIX}matrix_${matrix.birth_date}`,
          payload
        );
      }

      window.dispatchEvent(
        new CustomEvent(MATRIX_UPDATED_EVENT, {
          detail: {
            birthDate: normalizedBirthDate,
            matrix,
          },
        })
      );
    } catch {
      // no-op
    }
  };

  const loadMatrix = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDestinyMatrix();
      if (data) {
        setMatrixData(data);
        setBirthDate(data.birth_date || '');
      } else {
        setShowCalculateForm(true);
      }
    } catch (err: any) {
      setShowCalculateForm(true);
      setError(err?.message || 'Не удалось загрузить матрицу судьбы');
    } finally {
      setLoading(false);
    }
  };

  const calculateMatrix = async () => {
    if (!birthDate) {
      setError('Пожалуйста, укажите дату рождения');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.calculateDestinyMatrix(birthDate);
      setMatrixData(data);
      syncHeroCache(data);
      setShowCalculateForm(false);
    } catch (err: any) {
      setError(err?.message || 'Не удалось рассчитать матрицу судьбы');
    } finally {
      setLoading(false);
    }
  };

  const recalculateV2 = async () => {
    if (!birthDate) {
      setError('Для пересчета нужна дата рождения');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.recalculateDestinyMatrixV2(birthDate);
      setMatrixData(data);
      syncHeroCache(data);
    } catch (err: any) {
      setError(err?.message || 'Не удалось пересчитать матрицу v2');
    } finally {
      setLoading(false);
    }
  };

  const matrixContent = (
    <>
      {loading && (
        <div className="mira-card p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-mirastros-gold mb-3" />
          <p className="text-silver/80">Загрузка матрицы...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-500/15 border border-red-500/40 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {!loading && showCalculateForm && (
        <div className="mira-card p-6 border border-mirastros-gold/20">
          <h3 className="text-xl font-semibold text-mirastros-gold mb-4">
            Рассчитать матрицу судьбы
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-silver/80 text-sm mb-2">Дата рождения</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-mirastros-gold/60"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <button
              onClick={calculateMatrix}
              disabled={!birthDate}
              className="mira-button w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Рассчитать v2
            </button>
          </div>
        </div>
      )}

      {!loading && matrixData && (
        <div className="space-y-4">
          {isLegacy && (
            <div className="bg-amber-500/12 border border-amber-500/40 rounded-lg p-4">
              <p className="text-amber-200 text-sm mb-3">
                У вас сохранена legacy-матрица v1. Для полной версии пересчитайте до v2.
              </p>
              <button onClick={recalculateV2} className="mira-button w-full sm:w-auto">
                Пересчитать до v2
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/destiny-matrix')}
              className="mira-button w-full sm:w-auto"
            >
              Посмотреть матрицу
            </button>
            <button
              onClick={() => setShowCalculateForm(true)}
              className="mira-button w-full sm:w-auto border border-mirastros-gold/50 bg-transparent"
            >
              Пересчитать
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <ServiceSection
        id={id}
        badge="СУДЬБА"
        title="Матрица судьбы"
        description="Полная версия матрицы с базовыми и расширенными линиями. Узнайте свои кармические задачи и путь души."
        media={SERVICE_TUNNEL_MEDIA.destinyMatrix}
        imageAlt="Матрица судьбы"
      >
        {matrixContent}
      </ServiceSection>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🔮</div>
        <h2 className="text-3xl md:text-4xl font-bold text-mirastros-gold mb-2">
          Матрица судьбы
        </h2>
        <p className="text-silver/75 text-sm md:text-base">
          Полная версия матрицы с базовыми и расширенными линиями v2
        </p>
      </div>
      {matrixContent}
    </div>
  );
}
