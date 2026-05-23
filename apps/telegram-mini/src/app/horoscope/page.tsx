'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '../../lib/auth'
import { CosmicBackground } from '../../components/CosmicBackground'
import { ZScrollCard } from '../../components/ZScrollContainer'
import { Button, Badge, Spinner } from '@mirastros-universal/design-system'

const ZODIAC_SIGNS = [
  { name: 'Aries', emoji: '♈', dates: 'Mar 21 - Apr 19' },
  { name: 'Taurus', emoji: '♉', dates: 'Apr 20 - May 20' },
  { name: 'Gemini', emoji: '♊', dates: 'May 21 - Jun 20' },
  { name: 'Cancer', emoji: '♋', dates: 'Jun 21 - Jul 22' },
  { name: 'Leo', emoji: '♌', dates: 'Jul 23 - Aug 22' },
  { name: 'Virgo', emoji: '♍', dates: 'Aug 23 - Sep 22' },
  { name: 'Libra', emoji: '♎', dates: 'Sep 23 - Oct 22' },
  { name: 'Scorpio', emoji: '♏', dates: 'Oct 23 - Nov 21' },
  { name: 'Sagittarius', emoji: '♐', dates: 'Nov 22 - Dec 21' },
  { name: 'Capricorn', emoji: '♑', dates: 'Dec 22 - Jan 19' },
  { name: 'Aquarius', emoji: '♒', dates: 'Jan 20 - Feb 18' },
  { name: 'Pisces', emoji: '♓', dates: 'Feb 19 - Mar 20' },
]

interface Horoscope {
  sign: string
  period: string
  prediction: string
  lucky_numbers: number[]
  lucky_colors: string[]
}

export default function HoroscopePage() {
  const { auth } = useAuth()
  const [selectedSign, setSelectedSign] = useState<string>('')
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetHoroscope = async () => {
    if (!selectedSign) {
      setError('Please select your zodiac sign')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authenticatedFetch(
        `/horoscope/${period}/${selectedSign.toLowerCase()}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get horoscope')
      }

      const data = await response.json()
      setHoroscope(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setHoroscope(null)
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
              ⭐ Horoscope
            </h1>
            <p className="text-gray-300">
              Discover your cosmic guidance
            </p>
          </div>

          {!horoscope ? (
            <ZScrollCard>
              {/* Period Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Choose Period
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPeriod('daily')}
                    className={`p-3 rounded-lg border transition-all ${
                      period === 'daily'
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gray-600 text-gray-400 hover:border-gold/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">☀️</div>
                    <div className="text-xs">Daily</div>
                  </button>
                  <button
                    onClick={() => setPeriod('weekly')}
                    className={`p-3 rounded-lg border transition-all ${
                      period === 'weekly'
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gray-600 text-gray-400 hover:border-gold/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">📅</div>
                    <div className="text-xs">Weekly</div>
                  </button>
                  <button
                    onClick={() => setPeriod('monthly')}
                    className={`p-3 rounded-lg border transition-all ${
                      period === 'monthly'
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gray-600 text-gray-400 hover:border-gold/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">🌙</div>
                    <div className="text-xs">Monthly</div>
                  </button>
                </div>
              </div>

              {/* Zodiac Sign Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Your Zodiac Sign
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ZODIAC_SIGNS.map((sign) => (
                    <button
                      key={sign.name}
                      onClick={() => setSelectedSign(sign.name)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedSign === sign.name
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-gray-600 text-gray-400 hover:border-gold/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{sign.emoji}</div>
                      <div className="text-xs font-semibold">{sign.name}</div>
                      <div className="text-xs opacity-70">{sign.dates}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Get Horoscope Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleGetHoroscope}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Reading Stars...
                  </span>
                ) : (
                  'Get Horoscope'
                )}
              </Button>

              {/* Subscription Info */}
              {auth && auth.user.subscription_tier === 'freemium' && (
                <Badge variant="secondary" className="mt-4 w-full text-center">
                  Freemium: 1 daily horoscope • Upgrade for weekly & monthly
                </Badge>
              )}
            </ZScrollCard>
          ) : (
            <div className="space-y-6">
              {/* Horoscope Header */}
              <ZScrollCard>
                <div className="text-center">
                  <div className="text-6xl mb-3">
                    {ZODIAC_SIGNS.find(s => s.name === horoscope.sign)?.emoji}
                  </div>
                  <h2 className="text-2xl font-bold text-gold mb-1">
                    {horoscope.sign}
                  </h2>
                  <p className="text-sm text-gray-400 capitalize">
                    {horoscope.period} Horoscope
                  </p>
                </div>
              </ZScrollCard>

              {/* Prediction */}
              <ZScrollCard>
                <h3 className="text-lg font-bold text-gold mb-3">Prediction</h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {horoscope.prediction}
                </p>
              </ZScrollCard>

              {/* Lucky Numbers & Colors */}
              <ZScrollCard>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gold mb-2">Lucky Numbers</h3>
                    <div className="flex flex-wrap gap-2">
                      {horoscope.lucky_numbers.map((num, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-deep/50 border border-gold/20 rounded-full px-3 py-1 text-sm text-gold"
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gold mb-2">Lucky Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {horoscope.lucky_colors.map((color, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-deep/50 border border-gold/20 rounded-full px-3 py-1 text-sm text-gray-300 capitalize"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ZScrollCard>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBack}
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
