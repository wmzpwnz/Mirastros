'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

const goals = ['защита', 'любовь', 'богатство', 'здоровье', 'интуиция', 'энергия'];

export default function CrystalsPage() {
  const [selectedGoal, setSelectedGoal] = useState('');
  const [recommendations, setRecommendations] = useState<any>(null);

  const handleGetRecommendations = async () => {
    try {
      const result = await api.getCrystalRecommendations(selectedGoal);
      setRecommendations(result);
    } catch (err: any) {
      console.error('Error getting crystal recommendations:', err);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <Link href="/dashboard" className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition">
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">Кристаллы и камни</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Подбор кристаллов для ваших целей</p>
        </div>

        {!recommendations ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl font-bold text-white mb-6">Выберите цель</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {goals.map((goal) => (
                  <button key={goal} onClick={() => setSelectedGoal(goal)}
                    className={`p-4 rounded-lg border-2 transition capitalize ${selectedGoal === goal ? 'bg-mirastros-gold/10 border-mirastros-gold' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                    <span className="text-white font-semibold">{goal}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleGetRecommendations} disabled={!selectedGoal}
                className="w-full py-4 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 text-lg">
                Получить рекомендации
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">О кристаллах</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Кристаллы и камни обладают уникальными энергетическими свойствами. Они могут помочь в достижении целей, 
                защите, исцелении и духовном развитии. Выберите кристаллы, которые резонируют с вашими намерениями.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-2">Рекомендации</h2>
            <p className="text-gray-400 mb-6 capitalize">Цель: {recommendations.goal}</p>

            <div className="space-y-4 mb-6">
              {recommendations.crystals.map((crystal: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-cinzel text-xl font-bold text-white mb-1">{crystal.name}</h3>
                      <p className="text-gray-400 text-sm">Чакра: {crystal.chakra}</p>
                    </div>
                    <div className="text-4xl">💎</div>
                  </div>
                  <p className="text-gray-300 text-sm">{crystal.properties}</p>
                </div>
              ))}
            </div>

            <div className="bg-mirastros-gold/10 border border-mirastros-gold/30 rounded-lg p-6 mb-6">
              <h3 className="font-cinzel text-lg font-bold text-white mb-3">Как использовать</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{recommendations.advice}</p>
            </div>

            <div className="flex gap-4">
              <button onClick={() => { setRecommendations(null); setSelectedGoal(''); }}
                className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition">
                Новый подбор
              </button>
              <Link href="/shop" className="flex-1 py-3 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition text-center">
                Купить кристаллы
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
