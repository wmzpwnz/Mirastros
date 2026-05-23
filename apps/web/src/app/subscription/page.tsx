'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import type { User } from '../../types';
import { PaymentModal } from '../../components/PaymentModal';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'freemium',
    name: 'Freemium',
    price: 0,
    period: 'навсегда',
    features: [
      '1 гороскоп в день',
      '1 расклад Таро в неделю',
      '1 толкование сна в день',
      'Базовая нумерология',
      'История на 7 дней',
      'Реклама',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 999,
    period: 'в месяц',
    popular: true,
    features: [
      'Безлимитные гороскопы',
      'Безлимитные расклады Таро',
      'Натальная карта',
      'Транзиты планет',
      'Анализ совместимости',
      'Безлимитные толкования снов',
      'Лунный календарь',
      'Полная история',
      'Без рекламы',
      'AI-ассистент "Уточнить"',
      'Email поддержка (24ч)',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 2999,
    period: 'в месяц',
    features: [
      'Все функции Premium',
      'Персональный AI-астролог',
      'Приоритетная обработка',
      'Расширенная натальная карта',
      'Синастрия (совместимость партнеров)',
      'Соляр (годовой прогноз)',
      'Хорарная астрология',
      'Персональные медитации',
      'Эксклюзивный контент',
      'Уведомления о транзитах',
      '1 консультация с астрологом',
      'Приоритетная поддержка (2ч)',
      'Ранний доступ к новым функциям',
    ],
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    planId: string;
    planName: string;
    price: number;
    currency: string;
  }>({
    isOpen: false,
    planId: '',
    planName: '',
    price: 0,
    currency: 'RUB',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (planId: string) => {
    if (planId === 'freemium') {
      return;
    }

    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    setPaymentModal({
      isOpen: true,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      currency: 'RUB', // Default to RUB, can be changed based on user location
    });
  };

  const handlePaymentSuccess = async () => {
    // Reload user data to get updated subscription
    try {
      const updatedUser = await api.getCurrentUser();
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to reload user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mirastros-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link
            href="/dashboard"
            className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition"
          >
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-4">
            Выберите подписку
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Получите полный доступ ко всем эзотерическим практикам и
            персонализированным прогнозам
          </p>
        </div>

        {/* Current Plan */}
        <div className="mb-12 bg-white/5 border border-white/10 rounded-lg p-6 text-center">
          <p className="text-gray-400 mb-2">Ваш текущий тариф</p>
          <p className="font-cinzel text-2xl font-bold text-mirastros-gold capitalize">
            {user.subscriptionTier}
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = user.subscriptionTier === plan.id;
            const canUpgrade =
              (user.subscriptionTier === 'freemium' && plan.id !== 'freemium') ||
              (user.subscriptionTier === 'premium' && plan.id === 'platinum');

            return (
              <div
                key={plan.id}
                className={`relative bg-white/5 border-2 rounded-lg p-8 ${
                  plan.popular
                    ? 'border-mirastros-gold'
                    : 'border-white/10'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-mirastros-gold text-black text-sm font-semibold rounded-full">
                    Популярный
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4 px-4 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                    Текущий
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="font-cinzel text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">
                      {plan.price === 0 ? 'Бесплатно' : `₽${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-400 text-sm ml-2">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-mirastros-gold mt-1">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || processing}
                  className={`w-full py-3 px-6 font-semibold rounded-lg transition ${
                    isCurrentPlan
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                      : canUpgrade
                      ? 'bg-mirastros-gold hover:bg-mirastros-gold/90 text-black'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                  }`}
                >
                  {isCurrentPlan
                    ? 'Текущий тариф'
                    : canUpgrade
                    ? 'Перейти на этот тариф'
                    : plan.price === 0
                    ? 'Бесплатно'
                    : 'Выбрать'}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
            Часто задаваемые вопросы
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">
                Могу ли я отменить подписку в любое время?
              </h3>
              <p className="text-gray-400 text-sm">
                Да, вы можете отменить подписку в любое время. Доступ к Premium
                функциям сохранится до конца оплаченного периода.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">
                Какие способы оплаты доступны?
              </h3>
              <p className="text-gray-400 text-sm">
                Мы принимаем оплату через ЮKassa (для России) и Stripe (для
                международных платежей). Доступны банковские карты и другие
                популярные методы.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">
                Есть ли годовая подписка со скидкой?
              </h3>
              <p className="text-gray-400 text-sm">
                Да! Premium: ₽9,990/год (экономия 2 месяцев), Platinum:
                ₽29,990/год (экономия 2 месяцев).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">
                Что происходит с моими данными при отмене?
              </h3>
              <p className="text-gray-400 text-sm">
                Все ваши данные, история предсказаний и натальная карта
                сохраняются. Вы можете вернуться к Premium в любое время.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
        planId={paymentModal.planId}
        planName={paymentModal.planName}
        price={paymentModal.price}
        currency={paymentModal.currency}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
