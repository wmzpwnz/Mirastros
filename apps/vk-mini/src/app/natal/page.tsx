'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '../../lib/auth'
import { CosmicBackground } from '../../components/CosmicBackground'
import { shareReading } from '../../lib/vk'
import { Button, Card, Input } from '@mirastros-universal/design-system'

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
            <h1 className="text-4xl font-bold text-gold-500 mb-2">🌙 Натальная карта</h1>
            <p className="text-gray-300">Ваш космический чертеж</p>
          </div>

          {!natalChart ? (
            <Card variant="elevated">
              {/* Birth Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Дата рождения
                </label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              {/* Birth Time */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Время рождения
                </label>
                <Input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                />
              </div>

              {/* Birth Place */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Место рождения
                </label>
                <Input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Город, страна"
                />
              </div>

              {/* Calculate Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
                onClick={handleCalculate}
              >
                {isLoading ? 'Рассчитываем карту...' : 'Рассчитать натальную карту'}
              </Button>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Точное время рождения необходимо для расчёта домов и асцендента
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Planets Display */}
              <Card variant="elevated">
                <h2 className="text-xl font-bold text-gold-500 mb-4">Планеты</h2>
                <div className="space-y-3">
                  {natalChart.planets && Object.entries(natalChart.planets).map(([planet, data]: [string, any]) => (
                    <div
                      key={planet}
                      className="flex justify-between items-center bg-gray-900/50 rounded-lg p-3"
                    >
                      <div>
                        <div className="text-gold-500 font-medium capitalize">{planet}</div>
                        <div className="text-xs text-gray-400">{data.sign}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-300">{data.degree}°</div>
                        <div className="text-xs text-gray-400">Дом {data.house}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Interpretation */}
              <Card variant="elevated">
                <h2 className="text-xl font-bold text-gold-500 mb-4">Толкование</h2>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {natalChart.interpretation}
                </p>
              </Card>

              {/* Key Aspects */}
              {natalChart.aspects && natalChart.aspects.length > 0 && (
                <Card variant="elevated">
                  <h2 className="text-xl font-bold text-gold-500 mb-4">Ключевые аспекты</h2>
                  <div className="space-y-2">
                    {natalChart.aspects.slice(0, 5).map((aspect: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-900/50 rounded-lg p-3 text-sm"
                      >
                        <div className="text-gold-500 font-medium">
                          {aspect.planet1} {aspect.type} {aspect.planet2}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                          {aspect.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={handleShare}
                >
                  📤 Поделиться
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    setNatalChart(null)
                    setBirthDate('')
                    setBirthTime('')
                    setBirthPlace('')
                  }}
                >
                  🌙 Новый расчёт
                </Button>
              </div>

              {/* Back Button */}
              <a
                href="/"
                className="block text-center text-gray-400 hover:text-gold-500 transition-colors"
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
