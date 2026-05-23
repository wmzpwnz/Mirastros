'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '../../lib/auth'
import { CosmicBackground } from '../../components/CosmicBackground'
import { ZScrollCard } from '../../components/ZScrollContainer'
import { Button, Textarea, Spinner, Badge } from '@mirastros-universal/design-system'

interface TarotCard {
  name: string
  suit: string
  number: number
  reversed: boolean
  meaning: string
}

interface TarotReading {
  cards: TarotCard[]
  interpretation: string
  spread_type: string
}

export default function TarotPage() {
  const { auth } = useAuth()
  const [spreadType, setSpreadType] = useState<'one-card' | 'three-card' | 'celtic-cross'>('three-card')
  const [question, setQuestion] = useState('')
  const [reading, setReading] = useState<TarotReading | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetReading = async () => {
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authenticatedFetch('/tarot/reading', {
        method: 'POST',
        body: JSON.stringify({
          spread_type: spreadType,
          question: question.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get reading')
      }

      const data = await response.json()
      setReading(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewReading = () => {
    setReading(null)
    setQuestion('')
    setError(null)
  }

  return (
    <>
      <CosmicBackground />
      <main className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <a href="/" className="inline-block text-gold hover:text-gold/80 mb-4">
              ← Back
            </a>
            <h1 className="text-4xl font-bold text-gold mb-2">
              🔮 Tarot Reading
            </h1>
            <p className="text-gray-300">
              Ask your question and receive mystical guidance
            </p>
          </div>

          {!reading ? (
            <ZScrollCard>
              {/* Spread Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Choose Spread Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSpreadType('one-card')}
                    className={`p-3 rounded-lg border transition-all ${
                      spreadType === 'one-card'
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gray-600 text-gray-400 hover:border-gold/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">🃏</div>
                    <div className="text-xs">One Card</div>
                  </button>
                  <button
                    onClick={() => setSpreadType('three-card')}
                    className={`p-3 rounded-lg border transition-all ${
                      spreadType === 'three-card'
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gray-600 text-gray-400 hover:border-gold/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">🎴</div>
                    <div className="text-xs">Three Card</div>
                  </button>
                  <button
                    onClick={() => setSpreadType('celtic-cross')}
                    className={`p-3 rounded-lg border transition-all ${
                      spreadType === 'celtic-cross'
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gray-600 text-gray-400 hover:border-gold/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">✨</div>
                    <div className="text-xs">Celtic Cross</div>
                  </button>
                </div>
              </div>

              {/* Question Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Question
                </label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What guidance do you seek?"
                  rows={4}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Get Reading Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleGetReading}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Drawing Cards...
                  </span>
                ) : (
                  'Draw Cards'
                )}
              </Button>

              {/* Subscription Info */}
              {auth && auth.user.subscription_tier === 'freemium' && (
                <Badge variant="secondary" className="mt-4 w-full text-center">
                  Freemium: 1 reading per week • Upgrade for unlimited readings
                </Badge>
              )}
            </ZScrollCard>
          ) : (
            <div className="space-y-6">
              {/* Cards Display */}
              <ZScrollCard>
                <h2 className="text-xl font-bold text-gold mb-4">Your Cards</h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {reading.cards.map((card, index) => (
                    <div
                      key={index}
                      className="bg-purple-deep/50 border border-gold/20 rounded-lg p-3 text-center"
                    >
                      <div className="text-3xl mb-2">🎴</div>
                      <div className="text-sm font-semibold text-gold mb-1">
                        {card.name}
                      </div>
                      {card.reversed && (
                        <div className="text-xs text-purple-light">Reversed</div>
                      )}
                    </div>
                  ))}
                </div>
              </ZScrollCard>

              {/* Interpretation */}
              <ZScrollCard>
                <h2 className="text-xl font-bold text-gold mb-4">Interpretation</h2>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {reading.interpretation}
                </p>
              </ZScrollCard>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNewReading}
                  className="flex-1"
                >
                  New Reading
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
