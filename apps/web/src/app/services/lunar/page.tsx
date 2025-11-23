'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

export default function LunarPage() {
  const [currentPhase, setCurrentPhase] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLunarData = async () => {
      try {
        const phase = await api.getLunarPhase();
        const recs = await api.getLunarRecommendations();
        setCurrentPhase(phase);
        setRecommendations(recs);
      } catch (err: any) {
        console.error('Error fetching lunar data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLunarData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mirastros-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка лунных данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <Link href="/dashboard" className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition">
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Лунный календарь</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Благоприятные дни для важных дел</p>
        </div>

        {currentPhase && recommendations && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <div className="text-center mb-8">
                <div className="text-8xl mb-4">{currentPhase.emoji || '🌙'}</div>
                <h2 className="font-cinzel text-3xl font-bold text-white mb-2">{currentPhase.name}</h2>
                <p className="text-gray-400">Лунный день: {currentPhase.day} • Освещенность: {currentPhase.percent}%</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                  <h3 className="font-cinzel text-xl font-bold text-white mb-4">✓ Благоприятно</h3>
                  <ul className="space-y-2">
                    {recommendations.favorable?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="text-green-400">•</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                  <h3 className="font-cinzel text-xl font-bold text-white mb-4">✗ Неблагоприятно</h3>
                  <ul className="space-y-2">
                    {recommendations.unfavorable?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="text-red-400">•</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {currentPhase.energy && (
                <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-3">Энергия дня</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{currentPhase.energy}</p>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">О лунном календаре</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Луна влияет на все живое на Земле. Лунный календарь помогает выбрать благоприятное время для важных дел: 
                стрижки, свадьбы, начала бизнеса, медицинских процедур и многого другого.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
