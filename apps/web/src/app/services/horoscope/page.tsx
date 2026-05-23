'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../services/api';
import type { Horoscope, User } from '../../../types';
import { LifeAreaRatings } from '../../../components/LifeAreaRatings';

type Period = 'daily' | 'weekly' | 'monthly';

const PERIODS: Array<{ id: Period; name: string }> = [
  { id: 'daily', name: 'Сегодня' },
  { id: 'weekly', name: 'Неделя' },
  { id: 'monthly', name: 'Месяц' },
];

const ZODIAC_SIGNS = [
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

const isValidPeriod = (value: string | null): value is Period =>
  value === 'daily' || value === 'weekly' || value === 'monthly';

const isValidSign = (value: string | null): value is string =>
  !!value && ZODIAC_SIGNS.some((sign) => sign.id === value);

export default function HoroscopePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [selectedSign, setSelectedSign] = useState('aries');
  const [period, setPeriod] = useState<Period>('daily');
  const [horoscopes, setHoroscopes] = useState<Record<Period, Horoscope | null>>({
    daily: null,
    weekly: null,
    monthly: null,
  });
  const [loading, setLoading] = useState(false);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  const isPremium = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'platinum';

  const selectedZodiac = useMemo(
    () => ZODIAC_SIGNS.find((sign) => sign.id === selectedSign) || ZODIAC_SIGNS[0],
    [selectedSign]
  );

  useEffect(() => {
    const qSign = searchParams.get('sign');
    const qPeriod = searchParams.get('period');
    if (isValidSign(qSign)) setSelectedSign(qSign);
    if (isValidPeriod(qPeriod)) setPeriod(qPeriod);
  }, [searchParams]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const current = await api.getCurrentUser();
        setUser(current);
        if (current.zodiacSign) {
          const normalized = current.zodiacSign.toLowerCase();
          if (isValidSign(normalized)) setSelectedSign(normalized);
        }
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const allowedPeriod = !isPremium && period !== 'daily' ? 'daily' : period;
    if (allowedPeriod !== period) {
      setPeriod('daily');
      console.info('[metrics] horoscope_paywall_shown', { source: 'horoscope_page' });
      return;
    }

    const load = async () => {
      setLoading(true);
      setRatingsLoading(true);
      try {
        const result = await api.getHoroscope(selectedSign, allowedPeriod);
        setHoroscopes((prev) => ({ ...prev, [allowedPeriod]: result }));
      } catch (error) {
        console.error('Failed to load horoscope:', error);
      } finally {
        setLoading(false);
        setRatingsLoading(false);
      }
    };
    load();
  }, [selectedSign, period, isPremium]);

  const activeHoroscope = horoscopes[period];

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background:
          'radial-gradient(circle at 20% 15%, rgba(212,175,55,0.17) 0%, rgba(0,0,0,0) 35%), radial-gradient(circle at 90% 80%, rgba(245,158,11,0.14) 0%, rgba(0,0,0,0) 45%), linear-gradient(160deg, #050505 0%, #0f172a 45%, #070b14 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-3 transition"
          >
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-2 drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]">
            Персональный гороскоп
          </h1>
          <p className="text-silver/80">
            Полный прогноз по периодам с рейтингами, пояснениями и лучшими временными окнами.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">
          {PERIODS.map((item) => {
            const locked = !isPremium && item.id !== 'daily';
            const active = period === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (locked) {
                    console.info('[metrics] horoscope_paywall_shown', { source: 'horoscope_tabs', period: item.id });
                    return;
                  }
                  setPeriod(item.id);
                  console.info('[metrics] horoscope_period_opened', { period: item.id });
                }}
                className={`px-4 py-3 rounded-xl font-semibold transition border ${
                  active
                    ? 'bg-mirastros-gold/20 border-mirastros-gold text-white'
                    : 'bg-black/30 border-white/10 text-silver/80 hover:border-white/30'
                } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {item.name} {locked ? '🔒' : ''}
              </button>
            );
          })}
        </div>

        <div className="mb-8">
          <h2 className="font-cinzel text-xl font-bold text-white mb-4">Выберите знак</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ZODIAC_SIGNS.map((sign) => (
              <button
                key={sign.id}
                onClick={() => setSelectedSign(sign.id)}
                className={`p-3 rounded-xl border transition ${
                  selectedSign === sign.id
                    ? 'bg-mirastros-gold/15 border-mirastros-gold/70 shadow-[0_0_18px_rgba(212,175,55,0.2)]'
                    : 'bg-black/20 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-3xl mb-1">{sign.symbol}</div>
                <p className="text-white text-sm font-semibold">{sign.name}</p>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mirastros-gold mx-auto mb-3" />
            <p className="text-silver/70">Загрузка гороскопа...</p>
          </div>
        ) : activeHoroscope ? (
          <div className="rounded-2xl border border-mirastros-gold/20 bg-black/35 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_40px_rgba(212,175,55,0.12)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedZodiac.symbol}</div>
                <div>
                  <h2 className="font-cinzel text-3xl text-white font-bold">{selectedZodiac.name}</h2>
                  <p className="text-silver/70 text-sm">{selectedZodiac.dates}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-silver/60">Период</div>
                <div className="text-mirastros-gold font-semibold">
                  {activeHoroscope.periodRangeLabel || PERIODS.find((p) => p.id === period)?.name}
                </div>
                <div className="text-[11px] text-silver/50">
                  {activeHoroscope.is_personalized ? 'Персонализирован' : 'Базовый прогноз'} · RU
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Прогноз</h3>
              <p className="text-silver/90 leading-relaxed whitespace-pre-wrap">
                {activeHoroscope.plainText || activeHoroscope.prediction}
              </p>
            </div>

            {activeHoroscope.ratings && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Рейтинги периода</h3>
                <LifeAreaRatings
                  ratings={activeHoroscope.ratings}
                  explanations={activeHoroscope.explanations}
                  loading={ratingsLoading}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-white font-semibold mb-2">Счастливые числа</h4>
                <div className="flex gap-2 flex-wrap">
                  {(activeHoroscope.luckyNumbers || []).map((num, index) => (
                    <span key={index} className="mira-chip-gold text-[9px] sm:text-[10px]">{num}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-white font-semibold mb-2">Счастливые цвета</h4>
                <div className="flex gap-2 flex-wrap">
                  {(activeHoroscope.luckyColors || []).map((color, index) => (
                    <span key={index} className="mira-chip-neutral text-[9px] sm:text-[10px]">{color}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-white font-semibold mb-2">Совместимость</h4>
                <div className="flex gap-2 flex-wrap">
                  {(activeHoroscope.compatibility || []).map((compat, index) => (
                    <span key={index} className="px-2 py-1 rounded-md bg-black/30 border border-white/10 text-silver/85 text-sm">
                      {compat}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-white font-semibold mb-2">Лучшие часы</h4>
                <div className="flex gap-2 flex-wrap">
                  {(activeHoroscope.bestTimeWindows || []).map((time, index) => (
                    <span key={index} className="px-2 py-1 rounded-md bg-mirastros-gold/15 border border-mirastros-gold/30 text-mirastros-gold text-sm">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-mirastros-gold/20 bg-mirastros-gold/5 p-4 mb-6">
              <h4 className="text-white font-semibold mb-2">Совет</h4>
              <p className="text-silver/85">{activeHoroscope.advice}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:border-white/40 transition"
              >
                На панель
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-4 py-3 rounded-xl bg-mirastros-gold text-black font-semibold hover:bg-mirastros-gold/90 transition"
              >
                Уточнить у Mirastros
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/20 p-8 text-silver/70 text-center">
            Не удалось загрузить гороскоп. Обновите страницу.
          </div>
        )}
      </div>
    </div>
  );
}
