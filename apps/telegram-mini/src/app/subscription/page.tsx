'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { CosmicBackground } from '../../components/CosmicBackground'
import { ZScrollCard } from '../../components/ZScrollContainer'
import { Button, Badge } from '@mirastros-universal/design-system'
import {
  subscribeToPremium,
  subscribeToPlatinum,
  triggerHapticFeedback,
  showPopup,
} from '../../lib/telegram'

const SUBSCRIPTION_TIERS = [
  {
    id: 'freemium',
    name: 'Freemium',
    price: 'Free',
    stars: 0,
    features: [
      '1 daily horoscope',
      '1 Tarot reading per week',
      '1 dream interpretation per day',
      'Basic numerology',
      '7-day history',
      'Ads supported',
    ],
    color: 'from-gray-600 to-gray-800',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99/month',
    stars: 999,
    features: [
      'Unlimited horoscopes',
      'Unlimited Tarot readings',
      'Full natal chart',
      'Planetary transits',
      'Unlimited dream interpretation',
      'AI Clarify assistant',
      'No ads',
      'Email support',
    ],
    color: 'from-gold to-yellow-600',
    popular: true,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: '$29.99/month',
    stars: 2999,
    features: [
      'All Premium features',
      'Personalized AI astrologer',
      'Priority AI processing',
      'Extended natal chart',
      'Synastry analysis',
      'Solar return chart',
      'Horary astrology',
      'Personalized rituals',
      'Transit notifications',
      'Priority support',
    ],
    color: 'from-purple-light to-purple-600',
  },
]

export default function SubscriptionPage() {
  const { auth } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubscribe = async (tierId: string) => {
    if (tierId === 'freemium') {
      await showPopup(
        'Already on Freemium',
        'You are currently on the free tier. Upgrade to Premium or Platinum for more features!',
        [{ text: 'OK', type: 'ok' }]
      )
      return
    }

    if (auth?.user.subscription_tier === tierId) {
      await showPopup(
        'Already Subscribed',
        `You are already subscribed to ${tierId}!`,
        [{ text: 'OK', type: 'ok' }]
      )
      return
    }

    const confirmed = await showPopup(
      `Subscribe to ${tierId}?`,
      `This will charge ${SUBSCRIPTION_TIERS.find(t => t.id === tierId)?.stars} Telegram Stars to your account.`,
      [
        { text: 'Cancel', type: 'cancel' },
        { text: 'Subscribe', type: 'ok' },
      ]
    )

    if (confirmed !== '0') return // User cancelled

    setIsProcessing(true)
    triggerHapticFeedback('medium')

    try {
      let success = false

      if (tierId === 'premium') {
        success = await subscribeToPremium()
      } else if (tierId === 'platinum') {
        success = await subscribeToPlatinum()
      }

      if (success) {
        triggerHapticFeedback('success')
        await showPopup(
          'Payment Initiated',
          'Please complete the payment in Telegram. Your subscription will be activated automatically.',
          [{ text: 'OK', type: 'ok' }]
        )
      } else {
        triggerHapticFeedback('error')
        await showPopup(
          'Payment Failed',
          'Unable to initiate payment. Please try again later.',
          [{ text: 'OK', type: 'ok' }]
        )
      }
    } catch (error) {
      console.error('Subscription error:', error)
      triggerHapticFeedback('error')
      await showPopup(
        'Error',
        'An error occurred. Please try again.',
        [{ text: 'OK', type: 'ok' }]
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <CosmicBackground />
      <main className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <a href="/" className="inline-block text-gold hover:text-gold/80 mb-4">
              ← Back
            </a>
            <h1 className="text-4xl font-bold text-gold mb-2">
              ✨ Subscription Plans
            </h1>
            <p className="text-gray-300">
              Choose the plan that fits your mystical journey
            </p>
          </div>

          {/* Current Subscription */}
          {auth && (
            <ZScrollCard className="mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">Current Plan</p>
                <Badge variant="primary" className="justify-center">
                  {auth.user.subscription_tier.toUpperCase()}
                </Badge>
              </div>
            </ZScrollCard>
          )}

          {/* Subscription Tiers */}
          <div className="grid md:grid-cols-3 gap-6">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <ZScrollCard
                key={tier.id}
                className={`relative ${
                  tier.popular ? 'ring-2 ring-gold' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gold mb-2">
                    {tier.name}
                  </h3>
                  <div className="text-3xl font-bold mb-1">{tier.price}</div>
                  {tier.stars > 0 && (
                    <div className="text-sm text-gray-400">
                      {tier.stars} ⭐ Telegram Stars
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-300">
                      <span className="text-gold mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={
                    auth?.user.subscription_tier === tier.id
                      ? 'secondary'
                      : tier.id === 'freemium'
                      ? 'ghost'
                      : 'primary'
                  }
                  size="lg"
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={
                    isProcessing ||
                    auth?.user.subscription_tier === tier.id
                  }
                  className="w-full"
                >
                  {auth?.user.subscription_tier === tier.id
                    ? 'Current Plan'
                    : tier.id === 'freemium'
                    ? 'Free Forever'
                    : 'Subscribe'}
                </Button>
              </ZScrollCard>
            ))}
          </div>

          {/* Payment Info */}
          <ZScrollCard className="mt-6">
            <h3 className="text-lg font-bold text-gold mb-3">
              💳 Payment Information
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                • Payments are processed securely through Telegram Stars
              </p>
              <p>
                • Your subscription will auto-renew monthly
              </p>
              <p>
                • Cancel anytime from your Telegram settings
              </p>
              <p>
                • Refunds available within 7 days of purchase
              </p>
            </div>
          </ZScrollCard>

          {/* FAQ */}
          <ZScrollCard className="mt-6">
            <h3 className="text-lg font-bold text-gold mb-3">
              ❓ Frequently Asked Questions
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-200 mb-1">
                  What are Telegram Stars?
                </p>
                <p className="text-gray-400">
                  Telegram Stars are Telegram's in-app currency. You can purchase them directly in Telegram and use them for subscriptions.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-200 mb-1">
                  Can I upgrade or downgrade?
                </p>
                <p className="text-gray-400">
                  Yes! You can upgrade to a higher tier anytime. Downgrades take effect at the end of your current billing period.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-200 mb-1">
                  Is my data secure?
                </p>
                <p className="text-gray-400">
                  Absolutely. All payments are processed by Telegram, and we never store your payment information.
                </p>
              </div>
            </div>
          </ZScrollCard>
        </div>
      </main>
    </>
  )
}
