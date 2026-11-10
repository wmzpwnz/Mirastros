'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal } from '@mirastros-universal/design-system';
import { api } from '../services/api';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface StripePaymentFormProps {
  planId: string;
  planName: string;
  price: number;
  currency: string;
  onSuccess: () => void;
  onClose: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  planId,
  planName,
  price,
  currency,
  onSuccess,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const subscription = await api.createSubscription({
        tier: planId as 'premium' | 'platinum',
        paymentMethod: 'stripe',
        billingPeriod: 'monthly',
      });

      if (!subscription.clientSecret) {
        throw new Error('No payment intent created');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        subscription.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // Add billing details if available from user profile
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Stripe payment error:', err);
      setError(err.message || 'Ошибка при обработке платежа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-white/10 rounded-lg bg-white/5">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Номер карты
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                  color: '#6b7280',
                },
              },
              invalid: {
                color: '#ef4444',
              },
            },
          }}
          className="stripe-card-element"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
          className="flex-1"
          disabled={loading}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          loading={loading}
          className="flex-1"
        >
          Оплатить {price} {currency === 'RUB' ? '₽' : '$'}
        </Button>
      </div>
    </form>
  );
};

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
    if (currency === 'RUB') {
      setPaymentMethod('yookassa');
    } else {
      setPaymentMethod('stripe');
    }
  }, [currency]);

  const handleYooKassaPayment = async () => {
    if (!planId || planId === 'freemium') {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const subscription = await api.createSubscription({
        tier: planId as 'premium' | 'platinum',
        paymentMethod: 'yookassa',
        billingPeriod: 'monthly',
      });

      const paymentUrl = subscription.confirmationUrl || subscription.paymentUrl;
      if (paymentUrl) {
        const redirect = new URL(paymentUrl);
        if (redirect.protocol !== 'https:') throw new Error('Некорректный адрес оплаты');
        window.location.href = redirect.href;
        return;
      }

      throw new Error('Платёж не подтверждён. Попробуйте позже.');
    } catch (err: any) {
      console.error('YooKassa payment error:', err);
      setError(err.message || 'Ошибка при создании платежа.');
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

        {paymentMethod === 'stripe' && !stripePromise ? (
          <p role="status">Оплата картой временно недоступна.</p>
        ) : paymentMethod === 'stripe' ? (
          <Elements stripe={stripePromise}>
            <StripePaymentForm
              planId={planId}
              planName={planName}
              price={price}
              currency={currency}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              onClick={handleYooKassaPayment}
              disabled={loading}
              loading={loading}
              className="flex-1"
            >
              Оплатить
            </Button>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Нажимая "Оплатить", вы соглашаетесь с условиями подписки
        </p>
      </div>
    </Modal>
  );
};
