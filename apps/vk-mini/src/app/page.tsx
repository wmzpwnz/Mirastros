'use client'

import { useEffect } from 'react'
import bridge from '@vkontakte/vk-bridge'
import { useAuth } from '../contexts/AuthContext'
import { CosmicBackground } from '../components/CosmicBackground'
import { ZScrollContainer, ZScrollSection, ZScrollCard } from '../components/ZScrollContainer'

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
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
            <h1 className="text-2xl font-bold text-gold mb-4">
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
            <h1 className="text-4xl font-bold text-center mb-2 text-gold">
              ✨ Mirastros
            </h1>
            <p className="text-center text-gray-300 mb-6">
              Мистический AI-оракул
            </p>

            {auth && (
              <div className="bg-purple-deep/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gold/10">
                <p className="text-sm text-gray-300">
                  Добро пожаловать, <span className="text-gold">{auth.user.full_name}</span>!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Подписка: <span className="text-gold capitalize">{auth.user.subscription_tier}</span>
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
              <h2 className="text-2xl font-bold text-gold mb-6">
                Быстрые действия
              </h2>
              <a
                href="/subscription"
                className="block bg-gradient-to-r from-gold to-purple-light text-black font-semibold py-3 rounded-full hover:scale-105 transition-transform"
              >
                💎 Улучшить подписку
              </a>
              <a
                href="/settings"
                className="block bg-purple-deep/50 border border-gold/20 text-gold font-semibold py-3 rounded-full hover:border-gold/50 transition-colors"
              >
                ⚙️ Настройки
              </a>
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
      <h3 className="text-2xl font-bold mb-2 text-gold">
        {title.split(' ').slice(1).join(' ')}
      </h3>
      <p className="text-gray-300 mb-3">{description}</p>
      <p className="text-sm text-gray-400 mb-6">{details}</p>
      <a
        href={href}
        className="inline-block bg-gradient-to-r from-gold to-purple-light text-black font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform"
      >
        Исследовать
      </a>
    </div>
  )
}
