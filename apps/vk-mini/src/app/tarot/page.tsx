'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '../../lib/auth'
import { CosmicBackground } from '../../components/CosmicBackground'
import { shareReading } from '../../lib/vk'

export default function TarotPage() {
  const { auth } = useAuth()
  const [spreadType, setSpreadType] = useState<'one' | 'three' | 'celtic'>('three')
  const [question, setQuestion] = useState('')
  const [reading, setReading] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGetReading = async () => {
    if (!question.trim()) {
      alert('Пожалуйста, введите ваш вопрос')
      return
    }

    setIsLoading(true)
    try {
      const response = await authenticatedFetch('/tarot/reading', {
        method: 'POST',
        body: JSON.stringify({
          spread_type: spreadType,
          question: question,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get reading')
      }

      const data = await response.json()
      setReading(data)
    } catch (error) {
      console.error('Error getting reading:', error)
      alert('Не удалось получить расклад. Попробуйте снова.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    if (reading) {
      shareReading(
        'Таро',
        reading.interpretation,
        window.location.href
      )
    }
  }

  return (
    <>
      <CosmicBackground />
      <main className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gold mb-2">🔮 Таро</h1>
            <p className="text-gray-300">Мистические толкования карт</p>
          </div>

          {!reading ? (
            <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl">
              {/* Spread Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Тип расклада
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSpreadType('one')}
                    className={`p-3 rounded-lg border transition-all ${
                      spreadType === 'one'
                        ? 'bg-gold/20 border-gold text-gold'
                        : 'bg-purple-deep/50 border-gold/20 text-gray-300 hover:border-gold/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">🃏</div>
                    <div className="text-xs">1 карта</div>
                  </button>
                  <button
                    onClick={() => setSpreadType('three')}
                    className={`p-3 rounded-lg border transition-all ${
                      spreadType === 'three'
                        ? 'bg-gold/20 border-gold text-gold'
                        : 'bg-purple-deep/50 border-gold/20 text-gray-300 hover:border-gold/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">🃏🃏🃏</div>
                    <div className="text-xs">3 карты</div>
                  </button>
                  <button
                    onClick={() => setSpreadType('celtic')}
                    className={`p-3 rounded-lg border transition-all ${
                      spreadType === 'celtic'
                        ? 'bg-gold/20 border-gold text-gold'
                        : 'bg-purple-deep/50 border-gold/20 text-gray-300 hover:border-gold/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">✨</div>
                    <div className="text-xs">Кельтский крест</div>
                  </button>
                </div>
              </div>

              {/* Question Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ваш вопрос
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="О чём вы хотите узнать?"
                  className="w-full px-4 py-3 bg-purple-deep/50 border border-gold/20 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gold/50 resize-none"
                  rows={4}
                />
              </div>

              {/* Get Reading Button */}
              <button
                onClick={handleGetReading}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gold to-purple-light text-black font-semibold py-4 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Вытягиваем карты...' : 'Получить расклад'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cards Display */}
              <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-gold mb-4">Ваши карты</h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {reading.cards.map((card: any, index: number) => (
                    <div
                      key={index}
                      className="bg-purple-deep/50 border border-gold/20 rounded-lg p-3 text-center"
                    >
                      <div className="text-3xl mb-2">🃏</div>
                      <div className="text-sm text-gold font-medium">{card.name}</div>
                      {card.reversed && (
                        <div className="text-xs text-gray-400 mt-1">(перевёрнутая)</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interpretation */}
              <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-gold mb-4">Толкование</h2>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {reading.interpretation}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 bg-purple-deep/50 border border-gold/20 text-gold font-semibold py-3 rounded-full hover:border-gold/50 transition-colors"
                >
                  📤 Поделиться
                </button>
                <button
                  onClick={() => {
                    setReading(null)
                    setQuestion('')
                  }}
                  className="flex-1 bg-gradient-to-r from-gold to-purple-light text-black font-semibold py-3 rounded-full hover:scale-105 transition-transform"
                >
                  🔮 Новый расклад
                </button>
              </div>

              {/* Back Button */}
              <a
                href="/"
                className="block text-center text-gray-400 hover:text-gold transition-colors"
              >
                ← Вернуться на главную
              </a>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
