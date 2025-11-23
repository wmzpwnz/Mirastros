'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '../../lib/auth'
import { CosmicBackground } from '../../components/CosmicBackground'
import { ZScrollCard } from '../../components/ZScrollContainer'

interface NatalChart {
  planets: Record<string, any>
  houses: Record<string, any>
  aspects: any[]
  interpretation: string
}

export default function NatalChartPage() {
  const { auth } = useAuth()
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [chart, setChart] = useState<NatalChart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculateChart = async () => {
    if (!birthDate || !birthTime || !latitude || !longitude) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authenticatedFetch('/natal/calculate', {
        method: 'POST',
        body: JSON.stringify({
          birth_date: birthDate,
          birth_time: birthTime,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          location: birthPlace || 'Unknown',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to calculate chart')
      }

      const data = await response.json()
      setChart(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChart = () => {
    setChart(null)
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
              🌙 Natal Chart
            </h1>
            <p className="text-gray-300">
              Discover your cosmic blueprint
            </p>
          </div>

          {!chart ? (
            <ZScrollCard>
              {/* Birth Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-deep/50 border border-gold/20 rounded-lg text-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* Birth Time */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Birth Time
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-deep/50 border border-gold/20 rounded-lg text-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* Birth Place */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Birth Place (Optional)
                </label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 bg-purple-deep/50 border border-gold/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="40.7128"
                    className="w-full px-4 py-3 bg-purple-deep/50 border border-gold/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="-74.0060"
                    className="w-full px-4 py-3 bg-purple-deep/50 border border-gold/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Helper Text */}
              <div className="mb-6 p-3 bg-purple-deep/30 border border-gold/20 rounded-lg text-xs text-gray-400">
                💡 Tip: You can find coordinates by searching your birth city on Google Maps
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Calculate Button */}
              <button
                onClick={handleCalculateChart}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gold to-purple-light text-black font-semibold py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Calculating Chart...
                  </span>
                ) : (
                  'Calculate Chart'
                )}
              </button>

              {/* Subscription Info */}
              {auth && auth.user.subscription_tier === 'freemium' && (
                <div className="mt-4 p-3 bg-purple-deep/30 border border-gold/20 rounded-lg text-xs text-gray-400 text-center">
                  Freemium: Basic chart only • Upgrade for detailed analysis
                </div>
              )}
            </ZScrollCard>
          ) : (
            <div className="space-y-6">
              {/* Chart Overview */}
              <ZScrollCard>
                <h2 className="text-xl font-bold text-gold mb-4">Your Natal Chart</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-deep/50 border border-gold/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Sun Sign</div>
                    <div className="text-lg font-semibold text-gold">
                      {chart.planets?.sun?.sign || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-purple-deep/50 border border-gold/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Moon Sign</div>
                    <div className="text-lg font-semibold text-gold">
                      {chart.planets?.moon?.sign || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-purple-deep/50 border border-gold/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Rising Sign</div>
                    <div className="text-lg font-semibold text-gold">
                      {chart.houses?.['1']?.sign || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-purple-deep/50 border border-gold/20 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Aspects</div>
                    <div className="text-lg font-semibold text-gold">
                      {chart.aspects?.length || 0}
                    </div>
                  </div>
                </div>
              </ZScrollCard>

              {/* Interpretation */}
              <ZScrollCard>
                <h2 className="text-xl font-bold text-gold mb-4">Interpretation</h2>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {chart.interpretation}
                </p>
              </ZScrollCard>

              {/* Planets */}
              {chart.planets && Object.keys(chart.planets).length > 0 && (
                <ZScrollCard>
                  <h2 className="text-xl font-bold text-gold mb-4">Planetary Positions</h2>
                  <div className="space-y-2">
                    {Object.entries(chart.planets).map(([planet, data]: [string, any]) => (
                      <div
                        key={planet}
                        className="flex justify-between items-center bg-purple-deep/30 border border-gold/10 rounded-lg p-3"
                      >
                        <span className="text-gray-300 capitalize">{planet}</span>
                        <span className="text-gold font-semibold">
                          {data.sign} {data.degree?.toFixed(2)}°
                        </span>
                      </div>
                    ))}
                  </div>
                </ZScrollCard>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleNewChart}
                  className="flex-1 bg-gradient-to-r from-gold to-purple-light text-black font-semibold py-3 rounded-full hover:scale-105 transition-transform"
                >
                  New Chart
                </button>
                <a
                  href="/"
                  className="flex-1 bg-purple-deep/50 border border-gold/20 text-gold font-semibold py-3 rounded-full hover:border-gold/50 transition-colors text-center"
                >
                  Home
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
