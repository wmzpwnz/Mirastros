'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '../../lib/auth'
import { CosmicBackground } from '../../components/CosmicBackground'
import { shareReading } from '../../lib/vk'

export default function NatalPage() {
  const { auth } = useAuth()
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [natalChart, setNatalChart] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCalculate = async () => {
    if (!birthDate || !birthTime || !birthPlace) {
      alert('Пожалуйста, заполните все поля')
      return
    }

    setIsLoading(true)
    try {
      const response = await authenticatedFetch('/natal/calculate', {
        method: 'POST',
        body: JSON.stringify({
          birth_date: birthDate,
          birth_time: birthTime,
          birth_location: birthPlace,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to calculate natal chart')
      }

      const data = await response.json()
      setNatalChart(data)
    } catch (error) {
      console.error('Error calculating natal chart:', error)
      alert('Не удалось рассчитать натальную карту. Попробуйте снова.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    if (natalChart) {
      shareReading(
        'Натальная карта',
        natalChart.interpretation,
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
            <h1 className="text-4xl font-bold text-gold mb-2">🌙 Натальная карта</h1>
            <p className="text-gray-300">Ваш космический чертеж</p>
          </div>

          {!natalChart ? (
            <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl">
              {/* Birth Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Дата рождения
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-deep/50 border border-gold/20 rounded-lg text-gray-100 focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Birth Time */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Время рождения
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-deep/50 border border-gold/20 rounded-lg text-gray-100 focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Birth Place */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Место рождения
                </label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Город, страна"
                  className="w-full px-4 py-3 bg-purple-deep/50 border border-gold/20 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gold/50"
                />
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gold to-purple-light text-black font-semibold py-4 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Рассчитываем карту...' : 'Рассчитать натальную карту'}
              </button>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Точное время рождения необходимо для расчёта домов и асцендента
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Planets Display */}
              <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-gold mb-4">Планеты</h2>
                <div className="space-y-3">
                  {natalChart.planets && Object.entries(natalChart.planets).map(([planet, data]: [string, any]) => (
                    <div
                      key={planet}
                      className="flex justify-between items-center bg-purple-deep/50 rounded-lg p-3"
                    >
                      <div>
                        <div className="text-gold font-medium capitalize">{planet}</div>
                        <div className="text-xs text-gray-400">{data.sign}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-300">{data.degree}°</div>
                        <div className="text-xs text-gray-400">Дом {data.house}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interpretation */}
              <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-gold mb-4">Толкование</h2>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {natalChart.interpretation}
                </p>
              </div>

              {/* Key Aspects */}
              {natalChart.aspects && natalChart.aspects.length > 0 && (
                <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl">
                  <h2 className="text-xl font-bold text-gold mb-4">Ключевые аспекты</h2>
                  <div className="space-y-2">
                    {natalChart.aspects.slice(0, 5).map((aspect: any, index: number) => (
                      <div
                        key={index}
                        className="bg-purple-deep/50 rounded-lg p-3 text-sm"
                      >
                        <div className="text-gold font-medium">
                          {aspect.planet1} {aspect.type} {aspect.planet2}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                          {aspect.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    setNatalChart(null)
                    setBirthDate('')
                    setBirthTime('')
                    setBirthPlace('')
                  }}
                  className="flex-1 bg-gradient-to-r from-gold to-purple-light text-black font-semibold py-3 rounded-full hover:scale-105 transition-transform"
                >
                  🌙 Новый расчёт
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
