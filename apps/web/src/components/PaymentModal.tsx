'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal } from '@mirastros-universal/design-system';
import { api } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  price: number;
  currency: string;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  planId,
  planName,
  price,
  currency,
  onSuccess,
}) => {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'yookassa'>('yookassa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-detect payment method based on currency or user location
    if (currency === 'RUB') {
      setPaymentMethod('yookassa');
    } else {
      setPaymentMethod('stripe');
    }
  }, [currency]);

  const handlePayment = async () => {
    if (!planId || planId === 'freemium') {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create subscription
      const subscription = await api.createSubscription({
        tier: planId as 'premium' | 'platinum',
        paymentMethod,
        billingPeriod: 'monthly',
      });

      // If we have a confirmation URL (YooKassa), redirect
      if (subscription.confirmationUrl) {
        window.location.href = subscription.confirmationUrl;
        return;
      }

      // If we have clientSecret (Stripe), we would integrate Stripe Elements here
      // For now, show success message
      if (subscription.clientSecret) {
        // TODO: Integrate Stripe Elements for card payment
        alert('Stripe integration coming soon. Please use YooKassa for now.');
        onClose();
        return;
      }

      // If payment URL is provided, redirect
      if (subscription.paymentUrl) {
        window.location.href = subscription.paymentUrl;
        return;
      }

      // Fallback: show success
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Ошибка при создании платежа. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Оформление подписки"
      size="md"
    >
      <div className="space-y-6">
        <p className="text-gray-400 text-sm">
          {planName} - {price} {currency === 'RUB' ? '₽' : '$'}/мес
        </p>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Способ оплаты
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('yookassa')}
              className={`p-4 rounded-lg border transition ${
                paymentMethod === 'yookassa'
                  ? 'border-mirastros-gold bg-mirastros-gold/10 text-white'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="text-2xl mb-2">💳</div>
              <div className="text-sm font-semibold">ЮKassa</div>
              <div className="text-xs text-gray-500">Российские карты</div>
            </button>

            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`p-4 rounded-lg border transition ${
                paymentMethod === 'stripe'
                  ? 'border-mirastros-gold bg-mirastros-gold/10 text-white'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="text-2xl mb-2">💳</div>
              <div className="text-sm font-semibold">Stripe</div>
              <div className="text-xs text-gray-500">Международные</div>
            </button>
          </div>
        </div>

        {/* Payment Info */}
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Подписка</span>
            <span className="text-white font-semibold">{planName}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Период</span>
            <span className="text-white font-semibold">1 месяц</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-gray-400 text-sm">Итого</span>
            <span className="text-mirastros-gold font-bold text-lg">
              {price} {currency === 'RUB' ? '₽' : '$'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading}
            loading={loading}
            className="flex-1"
          >
            Оплатить
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Нажимая "Оплатить", вы соглашаетесь с условиями подписки
        </p>
      </div>
    </Modal>
  );
};
