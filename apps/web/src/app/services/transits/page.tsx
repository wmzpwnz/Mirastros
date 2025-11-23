'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

export default function TransitsPage() {
  const [transits, setTransits] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransits = async () => {
      try {
        const result = await api.getPersonalTransits();
        setTransits(result);
      } catch (err: any) {
        console.error('Error fetching transits:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransits();
  }, []);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <Link href="/dashboard" className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition">
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Транзиты</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Текущие планетарные влияния на вашу натальную карту</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mirastros-gold mx-auto mb-4"></div>
            <p className="text-gray-400">Расчет транзитов...</p>
          </div>
        ) : transits && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                <h2 className="font-cinzel text-2xl font-bold text-white">Текущие транзиты</h2>
                <p className="text-gray-400">{transits.currentDate}</p>
              </div>

              <div className="space-y-4 mb-6">
                {transits.planets.map((planet: any, i: number) => (
                  <div key={i} className={`p-4 rounded-lg border ${planet.impact === 'positive' ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-white font-semibold">{planet.name}</span>
                        <span className="text-gray-400 ml-2">в {planet.sign} {planet.degree}°</span>
                      </div>
                      <span className={`text-sm ${planet.impact === 'positive' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {planet.impact === 'positive' ? '✓ Благоприятно' : '⚠ Внимание'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{planet.aspect}</p>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="font-cinzel text-xl font-bold text-white mb-3">Интерпретация</h3>
                <p className="text-gray-300 leading-relaxed">{transits.interpretation}</p>
              </div>

              <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6">
                <h3 className="font-cinzel text-lg font-bold text-white mb-3">Рекомендации</h3>
                <ul className="space-y-2">
                  {transits.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="text-mirastros-gold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">О транзитах</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Транзиты — это текущие положения планет и их аспекты к вашей натальной карте. 
                Они показывают актуальные космические влияния и помогают выбрать благоприятное время для действий.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
