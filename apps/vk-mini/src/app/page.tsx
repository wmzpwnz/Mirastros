'use client'

import { useEffect } from 'react'
import bridge from '@vkontakte/vk-bridge'
import { useAuth } from '../contexts/AuthContext'
import { CosmicBackground } from '../components/CosmicBackground'
import { ZScrollContainer, ZScrollSection, ZScrollCard } from '../components/ZScrollContainer'
import { Button, Spinner } from '@mirastros-universal/design-system'

export default function Home() {
  const { auth, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    // Initialize VK Bridge
    bridge.send('VKWebAppInit')
  }, [])

  if (isLoading) {
    return (
      <>
        <CosmicBackground />
        <main className="min-h-screen p-6 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-300">Подключение к Mirastros...</p>
          </div>
        </main>
      </>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <CosmicBackground />
        <main className="min-h-screen p-6 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gold-500 mb-4">
              ✨ Mirastros
            </h1>
            <p className="text-gray-300 mb-4">
              Не удалось авторизоваться через VK
            </p>
            <p className="text-sm text-gray-400">
              Пожалуйста, убедитесь, что вы открываете приложение из VK
            </p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <CosmicBackground />
      <ZScrollContainer>
        {/* Hero Section */}
        <ZScrollSection index={0}>
          <ZScrollCard>
            <h1 className="text-4xl font-bold text-center mb-2 text-gold-500">
              ✨ Mirastros
            </h1>
            <p className="text-center text-gray-300 mb-6">
              Мистический AI-оракул
            </p>

            {auth && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gold-500/10">
                <p className="text-sm text-gray-300">
                  Добро пожаловать, <span className="text-gold-500">{auth.user.full_name}</span>!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Подписка: <span className="text-gold-500 capitalize">{auth.user.subscription_tier}</span>
                </p>
              </div>
            )}

            <p className="text-center text-sm text-gray-400">
              Прокрутите вниз, чтобы исследовать мистические услуги
            </p>
          </ZScrollCard>
        </ZScrollSection>

        {/* Tarot Section */}
        <ZScrollSection index={1}>
          <ZScrollCard>
            <ServiceCard
              title="🔮 Таро"
              description="Мистические толкования карт"
              details="Вытяните карты и получите AI-интерпретацию ваших вопросов"
              href="/tarot"
            />
          </ZScrollCard>
        </ZScrollSection>

        {/* Horoscope Section */}
        <ZScrollSection index={2}>
          <ZScrollCard>
            <ServiceCard
              title="⭐ Гороскоп"
              description="Ежедневное космическое руководство"
              details="Персонализированные астрологические прогнозы на основе вашего знака зодиака"
              href="/horoscope"
            />
          </ZScrollCard>
        </ZScrollSection>

        {/* Natal Chart Section */}
        <ZScrollSection index={3}>
          <ZScrollCard>
            <ServiceCard
              title="🌙 Натальная карта"
              description="Ваш космический чертеж"
              details="Откройте свой астрологический профиль и планетарные влияния"
              href="/natal"
            />
          </ZScrollCard>
        </ZScrollSection>

        {/* Quick Actions Section */}
        <ZScrollSection index={4}>
          <ZScrollCard>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gold-500 mb-6">
                Быстрые действия
              </h2>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => window.location.href = '/subscription'}
              >
                💎 Улучшить подписку
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => window.location.href = '/settings'}
              >
                ⚙️ Настройки
              </Button>
            </div>
          </ZScrollCard>
        </ZScrollSection>
      </ZScrollContainer>
    </>
  )
}

function ServiceCard({ 
  title, 
  description, 
  details,
  href 
}: { 
  title: string
  description: string
  details: string
  href: string
}) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-4">{title.split(' ')[0]}</div>
      <h3 className="text-2xl font-bold mb-2 text-gold-500">
        {title.split(' ').slice(1).join(' ')}
      </h3>
      <p className="text-gray-300 mb-3">{description}</p>
      <p className="text-sm text-gray-400 mb-6">{details}</p>
      <Button
        variant="primary"
        size="md"
        onClick={() => window.location.href = href}
      >
        Исследовать
      </Button>
    </div>
  )
}
