'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import type { User, NatalChart } from '../../types';
import { NatalChartWheel } from '../../components/natal/NatalChartWheel';

const PLANET_EMOJI: Record<string, string> = {
  sun: '☀️',
  moon: '🌙',
  mercury: '☿️',
  venus: '♀️',
  mars: '♂️',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

const PLANET_NAMES: Record<string, string> = {
  sun: 'Солнце',
  moon: 'Луна',
  mercury: 'Меркурий',
  venus: 'Венера',
  mars: 'Марс',
  jupiter: 'Юпитер',
  saturn: 'Сатурн',
  uranus: 'Уран',
  neptune: 'Нептун',
  pluto: 'Плутон',
};

const ASPECT_NAMES: Record<string, string> = {
  Conjunction: 'Соединение',
  Trine: 'Трин',
  Square: 'Квадрат',
  Opposition: 'Оппозиция',
  Sextile: 'Секстиль',
  conjunction: 'Соединение',
  trine: 'Трин',
  square: 'Квадрат',
  opposition: 'Оппозиция',
  sextile: 'Секстиль',
};

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'text-red-400',
  earth: 'text-yellow-400',
  air: 'text-blue-400',
  water: 'text-cyan-400',
};

export default function NatalChartPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [natalChart, setNatalChart] = useState<NatalChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);

      if (userData.birthDate && userData.birthTime && userData.birthLocation) {
        try {
          const chart = await api.getNatalChart();
          setNatalChart(chart);

          // Load AI interpretation for Platinum users
          if (chart && userData.subscriptionTier === 'platinum') {
            loadAIInterpretation(chart);
          }
        } catch (error) {
          console.error('Failed to load natal chart:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAIInterpretation = async (chart: NatalChart) => {
    setLoadingAI(true);
    try {
      // Generate AI interpretation using DeepSeek
      const response = await api.request<{ response?: string }>('/ai/predict', {
        method: 'POST',
        body: JSON.stringify({
          prompt: `Проанализируй эту натальную карту и дай детальную интерпретацию личности:

Солнце: ${chart.planets.sun.sign} ${chart.planets.sun.degree.toFixed(
            1
          )}° (дом ${chart.planets.sun.house})
Луна: ${chart.planets.moon.sign} ${chart.planets.moon.degree.toFixed(
            1
          )}° (дом ${chart.planets.moon.house})
Асцендент: ${chart.houses[0]?.sign} ${chart.houses[0]?.degree.toFixed(1)}°

Основные аспекты:
${chart.aspects
  .slice(0, 5)
  .map((a) => `${a.planet1} ${ASPECT_NAMES[a.type] || a.type} ${a.planet2}`)
  .join('\n')}

Дай детальный анализ личности, сильных сторон, вызовов и рекомендаций.`,
          max_tokens: 1024,
        }),
      });

      if (response.response) {
        setAiInterpretation(response.response);
      }
    } catch (error) {
      console.error('Failed to load AI interpretation:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const getElementFromSign = (sign: string): string => {
    const signLower = sign.toLowerCase();
    if (['aries', 'leo', 'sagittarius'].includes(signLower)) return 'fire';
    if (['taurus', 'virgo', 'capricorn'].includes(signLower)) return 'earth';
    if (['gemini', 'libra', 'aquarius'].includes(signLower)) return 'air';
    if (['cancer', 'scorpio', 'pisces'].includes(signLower)) return 'water';
    return 'unknown';
  };

  const calculateElements = () => {
    if (!natalChart) return { fire: 0, earth: 0, air: 0, water: 0 };
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    Object.values(natalChart.planets).forEach((planet) => {
      const element = getElementFromSign(planet.sign);
      if (element !== 'unknown') {
        elements[element as keyof typeof elements]++;
      }
    });
    const total = Object.values(elements).reduce((a, b) => a + b, 0);
    return {
      fire: total > 0 ? Math.round((elements.fire / total) * 100) : 0,
      earth: total > 0 ? Math.round((elements.earth / total) * 100) : 0,
      air: total > 0 ? Math.round((elements.air / total) * 100) : 0,
      water: total > 0 ? Math.round((elements.water / total) * 100) : 0,
    };
  };

  const getRetrogradePlanets = () => {
    if (!natalChart) return [];
    return Object.entries(natalChart.planets)
      .filter(([_, planet]) => planet.retrograde)
      .map(([name]) => name);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mirastros-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка натальной карты...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!user.birthDate || !user.birthTime || !user.birthLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="font-cinzel text-3xl font-bold text-white mb-4">
            Данные для натальной карты не заполнены
          </h1>
          <p className="text-gray-400 mb-6">
            Для расчета натальной карты необходимо указать дату, время и место
            рождения
          </p>
          <Link
            href="/profile"
            className="inline-block px-6 py-3 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition"
          >
            Заполнить данные
          </Link>
        </div>
      </div>
    );
  }

  if (!natalChart) {
    const isPremiumOrPlatinum =
      user.subscriptionTier === 'premium' ||
      user.subscriptionTier === 'platinum';
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="font-cinzel text-3xl font-bold text-white mb-4">
            Натальная карта не рассчитана
          </h1>
          {isPremiumOrPlatinum ? (
            <>
              <p className="text-gray-400 mb-6">
                Данные рождения заполнены. Рассчитайте натальную карту по вашим
                данным — после расчёта она сохранится и будет отображаться
                здесь.
              </p>
              <Link
                href="/services/natal"
                className="inline-block px-6 py-3 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition"
              >
                Рассчитать натальную карту
              </Link>
            </>
          ) : (
            <>
              <p className="text-gray-400 mb-6">
                Натальная карта доступна для Premium и Platinum подписок
              </p>
              <Link
                href="/subscription"
                className="inline-block px-6 py-3 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition"
              >
                Обновить подписку
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const elements = calculateElements();
  const retrogradePlanets = getRetrogradePlanets();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition"
          >
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-2">
            Натальная карта
          </h1>
          <p className="text-gray-400">
            Полный астрологический анализ вашей личности
          </p>
        </div>

        {/* Chart Visualization - Professional Natal Chart Wheel */}
        <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-8">
          <h2 className="font-cinzel text-2xl font-bold text-white mb-6 text-center">
            Натальная карта (Колесо)
          </h2>
          <div className="flex items-center justify-center overflow-x-auto">
            <NatalChartWheel
              chart={natalChart}
              variant="full"
              className="min-w-max"
            />
          </div>
        </div>

        {/* Planets Table */}
        <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
            Планеты
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                    Планета
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                    Знак
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                    Градус
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                    Дом
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(natalChart.planets).map(([name, planet]) => (
                  <tr
                    key={name}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-3 px-4">
                      <span className="text-2xl mr-2">
                        {PLANET_EMOJI[name] || '⭐'}
                      </span>
                      <span className="text-white">
                        {PLANET_NAMES[name] || name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`${
                          ELEMENT_COLORS[getElementFromSign(planet.sign)] ||
                          'text-white'
                        }`}
                      >
                        {planet.sign}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">
                      {planet.degree.toFixed(2)}°
                    </td>
                    <td className="py-3 px-4 text-white">{planet.house}</td>
                    <td className="py-3 px-4">
                      {planet.retrograde ? (
                        <span className="text-orange-400 text-sm">
                          Ретроградная
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Директная</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Houses */}
        <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
            12 Домов
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {natalChart.houses.map((house) => (
              <div
                key={house.number}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-mirastros-gold font-semibold">
                    Дом {house.number}
                  </span>
                  <span
                    className={`text-sm ${
                      ELEMENT_COLORS[getElementFromSign(house.sign)] ||
                      'text-white'
                    }`}
                  >
                    {house.sign}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">
                  Куспид: {house.degree.toFixed(2)}°
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Aspects */}
        <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
            Аспекты
          </h2>
          <div className="space-y-3">
            {natalChart.aspects.slice(0, 20).map((aspect, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold">
                    {PLANET_NAMES[aspect.planet1] || aspect.planet1}
                  </span>
                  <span className="text-mirastros-gold">
                    {ASPECT_NAMES[aspect.type] || aspect.type}
                  </span>
                  <span className="text-white font-semibold">
                    {PLANET_NAMES[aspect.planet2] || aspect.planet2}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">
                  Орб: {aspect.orb.toFixed(2)}°
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Elements and Qualities */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-cinzel text-xl font-bold text-white mb-4">
              Элементы
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-red-400">🔥 Огонь</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${elements.fire}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold">
                    {elements.fire}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400">🌍 Земля</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${elements.earth}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold">
                    {elements.earth}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-400">💨 Воздух</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${elements.air}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold">
                    {elements.air}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyan-400">💧 Вода</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${elements.water}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold">
                    {elements.water}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-cinzel text-xl font-bold text-white mb-4">
              Дополнительная информация
            </h2>
            <div className="space-y-3">
              {retrogradePlanets.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">
                    Ретроградные планеты:
                  </p>
                  <p className="text-orange-400">
                    {retrogradePlanets
                      .map((p) => PLANET_NAMES[p] || p)
                      .join(', ')}
                  </p>
                </div>
              )}
              {natalChart.houses[0] && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Асцендент:</p>
                  <p className="text-white">
                    {natalChart.houses[0].sign}{' '}
                    {natalChart.houses[0].degree.toFixed(2)}°
                  </p>
                </div>
              )}
              {natalChart.houses[9] && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">
                    Середина неба (MC):
                  </p>
                  <p className="text-white">
                    {natalChart.houses[9].sign}{' '}
                    {natalChart.houses[9].degree.toFixed(2)}°
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Interpretation (Platinum only) */}
        {user.subscriptionTier === 'platinum' && (
          <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-4">
              🤖 AI Анализ личности
            </h2>
            {loadingAI ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-5/6" />
                <div className="h-4 bg-white/10 rounded w-4/6" />
              </div>
            ) : aiInterpretation ? (
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {aiInterpretation}
                </p>
              </div>
            ) : (
              <button
                onClick={() => natalChart && loadAIInterpretation(natalChart)}
                className="px-6 py-3 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition"
              >
                Сгенерировать AI анализ
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              // TODO: Implement save as image
              alert(
                'Функция сохранения изображения будет добавлена в ближайшее время'
              );
            }}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
          >
            Сохранить как изображение
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition"
          >
            Вернуться в панель
          </Link>
        </div>
      </div>
    </div>
  );
}
