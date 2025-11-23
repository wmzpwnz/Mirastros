'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '../../lib/auth'
import { CosmicBackground } from '../../components/CosmicBackground'
import { shareReading } from '../../lib/vk'

const ZODIAC_SIGNS = [
  { id: 'aries', name: 'Овен', emoji: '♈', dates: '21.03 - 19.04' },
  { id: 'taurus', name: 'Телец', emoji: '♉', dates: '20.04 - 20.05' },
  { id: 'gemini', name: 'Близнецы', emoji: '♊', dates: '21.05 - 20.06' },
  { id: 'cancer', name: 'Рак', emoji: '♋', dates: '21.06 - 22.07' },
  { id: 'leo', name: 'Лев', emoji: '♌', dates: '23.07 - 22.08' },
  { id: 'virgo', name: 'Дева', emoji: '♍', dates: '23.08 - 22.09' },
  { id: 'libra', name: 'Весы', emoji: '♎', dates: '23.09 - 22.10' },
  { id: 'scorpio', name: 'Скорпион', emoji: '♏', dates: '23.10 - 21.11' },
  { id: 'sagittarius', name: 'Стрелец', emoji: '♐', dates: '22.11 - 21.12' },
  { id: 'capricorn', name: 'Козерог', emoji: '♑', dates: '22.12 - 19.01' },
  { id: 'aquarius', name: 'Водолей', emoji: '♒', dates: '20.01 - 18.02' },
  { id: 'pisces', name: 'Рыбы', emoji: '♓', dates: '19.02 - 20.03' },
]

export default function HoroscopePage() {
  const { auth } = useAuth()
  const [selectedSign, setSelectedSign] = useState<string>('')
  const [horoscope, setHoroscope] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGetHoroscope = async () => {
    if (!selectedSign) {
      alert('Пожалуйста, выберите знак зодиака')
      return
    }

    setIsLoading(true)
    try {
      const response = await authenticatedFetch(`/horoscope/daily/${selectedSign}`)

      if (!response.ok) {
        throw new Error('Failed to get horoscope')
      }

      const data = await response.json()
      setHoroscope(data)
    } catch (error) {
      console.error('Error getting horoscope:', error)
      alert('Не удалось получить гороскоп. Попробуйте снова.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    if (horoscope) {
      const sign = ZODIAC_SIGNS.find(s => s.id === selectedSign)
      shareReading(
        `Гороскоп для ${sign?.name}`,
        horoscope.prediction,
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
            <h1 className="text-4xl font-bold text-gold mb-2">⭐ Гороскоп</h1>
            <p className="text-gray-300">Ежедневное космическое руководство</p>
          </div>

          {!horoscope ? (
            <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl">
              {/* Zodiac Sign Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Выберите знак зодиака
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ZODIAC_SIGNS.map((sign) => (
                    <button
                      key={sign.id}
                      onClick={() => setSelectedSign(sign.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedSign === sign.id
                          ? 'bg-gold/20 border-gold text-gold'
                          : 'bg-purple-deep/50 border-gold/20 text-gray-300 hover:border-gold/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{sign.emoji}</div>
                      <div className="text-xs font-medium">{sign.name}</div>
                      <div className="text-xs text-gray-400">{sign.dates}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Get Horoscope Button */}
              <button
                onClick={handleGetHoroscope}
                disabled={isLoading || !selectedSign}
                className="w-full bg-gradient-to-r from-gold to-purple-light text-black font-semibold py-4 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Получаем прогноз...' : 'Получить гороскоп'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Horoscope Display */}
              <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gold">
                    {ZODIAC_SIGNS.find(s => s.id === selectedSign)?.name}
                  </h2>
                  <div className="text-4xl">
                    {ZODIAC_SIGNS.find(s => s.id === selectedSign)?.emoji}
                  </div>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
                  {horoscope.prediction}
                </p>

                {/* Lucky Numbers & Colors */}
                {(horoscope.lucky_numbers || horoscope.lucky_colors) && (
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gold/20">
                    {horoscope.lucky_numbers && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Счастливые числа</div>
                        <div className="text-gold font-medium">
                          {horoscope.lucky_numbers.join(', ')}
                        </div>
                      </div>
                    )}
                    {horoscope.lucky_colors && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Счастливые цвета</div>
                        <div className="text-gold font-medium">
                          {horoscope.lucky_colors.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                    setHoroscope(null)
                    setSelectedSign('')
                  }}
                  className="flex-1 bg-gradient-to-r from-gold to-purple-light text-black font-semibold py-3 rounded-full hover:scale-105 transition-transform"
                >
                  ⭐ Другой знак
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
