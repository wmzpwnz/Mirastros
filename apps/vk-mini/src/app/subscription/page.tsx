'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { subscribeToPremium, subscribeToPlatinum } from '../../lib/vk'
import { CosmicBackground } from '../../components/CosmicBackground'

export default function SubscriptionPage() {
  const { auth } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubscribe = async (tier: 'premium' | 'platinum') => {
    setIsProcessing(true)
    try {
      const success = tier === 'premium' 
        ? await subscribeToPremium()
        : await subscribeToPlatinum()

      if (success) {
        alert('Подписка успешно оформлена!')
        window.location.href = '/'
      } else {
        alert('Не удалось оформить подписку. Попробуйте снова.')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Произошла ошибка при оформлении подписки.')
    } finally {
      setIsProcessing(false)
    }
  }

  const currentTier = auth?.user.subscription_tier || 'freemium'

  return (
    <>
      <CosmicBackground />
      <main className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gold mb-2">💎 Подписки</h1>
            <p className="text-gray-300">Выберите свой уровень доступа</p>
          </div>

          {/* Current Subscription */}
          <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Текущая подписка</div>
              <div className="text-2xl font-bold text-gold capitalize">{currentTier}</div>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="space-y-4">
            {/* Freemium */}
            <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-300">Freemium</h3>
                  <p className="text-2xl font-bold text-gold mt-1">Бесплатно</p>
                </div>
                {currentTier === 'freemium' && (
                  <span className="bg-gold/20 text-gold text-xs px-3 py-1 rounded-full">
                    Текущий
                  </span>
                )}
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>1 гороскоп в день</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>1 расклад Таро в неделю</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>1 толкование сна в день</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">✗</span>
                  <span className="text-gray-500">Натальная карта</span>
                </li>
              </ul>
            </div>

            {/* Premium */}
            <div className="bg-purple-deep/80 backdrop-blur-md border-2 border-gold/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gold">Premium</h3>
                  <p className="text-2xl font-bold text-gold mt-1">999 ₽/месяц</p>
                </div>
                {currentTier === 'premium' && (
                  <span className="bg-gold/20 text-gold text-xs px-3 py-1 rounded-full">
                    Текущий
                  </span>
                )}
              </div>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>Безлимитные гороскопы</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>Безлимитные расклады Таро</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>Полная натальная карта</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>Анализ транзитов</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>AI-ассистент "Уточнить с Mirastros"</span>
                </li>
              </ul>
              {currentTier !== 'premium' && currentTier !== 'platinum' && (
                <button
                  onClick={() => handleSubscribe('premium')}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-gold to-purple-light text-black font-semibold py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isProcessing ? 'Обработка...' : 'Оформить Premium'}
                </button>
              )}
            </div>

            {/* Platinum */}
            <div className="bg-gradient-to-br from-purple-deep/80 to-gold/20 backdrop-blur-md border-2 border-gold rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gold">Platinum</h3>
                  <p className="text-2xl font-bold text-gold mt-1">2999 ₽/месяц</p>
                </div>
                {currentTier === 'platinum' && (
                  <span className="bg-gold text-black text-xs px-3 py-1 rounded-full font-semibold">
                    Текущий
                  </span>
                )}
              </div>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>Все функции Premium</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>Персональный AI-астролог</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>Приоритетная обработка</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>Синастрия (совместимость)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>Солнечный возврат</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>Хорарная астрология</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span>Персонализированные ритуалы</span>
                </li>
              </ul>
              {currentTier !== 'platinum' && (
                <button
                  onClick={() => handleSubscribe('platinum')}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-gold to-purple-light text-black font-semibold py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isProcessing ? 'Обработка...' : 'Оформить Platinum'}
                </button>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-6 bg-purple-deep/50 backdrop-blur-sm rounded-lg p-4 border border-gold/10">
            <p className="text-xs text-gray-400 text-center">
              💳 Оплата через VK Pay. Подписка продлевается автоматически.
              <br />
              Вы можете отменить подписку в любое время.
            </p>
          </div>

          {/* Back Button */}
          <a
            href="/"
            className="block text-center text-gray-400 hover:text-gold transition-colors mt-6"
          >
            ← Вернуться на главную
          </a>
        </div>
      </main>
    </>
  )
}
