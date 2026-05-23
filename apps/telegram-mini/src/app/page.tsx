'use client'

import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { useAuth } from '../contexts/AuthContext'
import { CosmicBackground } from '../components/CosmicBackground'
import { ZScrollContainer, ZScrollSection, ZScrollCard } from '../components/ZScrollContainer'
import { Button, Spinner, Badge } from '@mirastros-universal/design-system'

export default function Home() {
  const { auth, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready()
    // Expand to full height
    WebApp.expand()
  }, [])

  if (isLoading) {
    return (
      <>
        <CosmicBackground />
        <main className="min-h-screen p-6 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-300">Connecting to Mirastros...</p>
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
              Unable to authenticate with Telegram
            </p>
            <p className="text-sm text-gray-400">
              Please make sure you're opening this app from Telegram
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
              Mystical AI Oracle
            </p>

            {auth && (
              <div className="bg-purple-deep/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gold/10">
                <p className="text-sm text-gray-300">
                  Welcome, <span className="text-gold">{auth.user.full_name}</span>!
                </p>
                <Badge variant="primary" className="mt-2">
                  {auth.user.subscription_tier.toUpperCase()}
                </Badge>
              </div>
            )}

            <p className="text-center text-sm text-gray-400">
              Scroll down to explore mystical services
            </p>
          </ZScrollCard>
        </ZScrollSection>

        {/* Tarot Section */}
        <ZScrollSection index={1}>
          <ZScrollCard>
            <ServiceCard
              title="🔮 Tarot Reading"
              description="Mystical card interpretations"
              details="Draw cards and receive AI-powered insights into your questions"
              href="/tarot"
            />
          </ZScrollCard>
        </ZScrollSection>

        {/* Horoscope Section */}
        <ZScrollSection index={2}>
          <ZScrollCard>
            <ServiceCard
              title="⭐ Horoscope"
              description="Daily cosmic guidance"
              details="Personalized astrological predictions based on your zodiac sign"
              href="/horoscope"
            />
          </ZScrollCard>
        </ZScrollSection>

        {/* Natal Chart Section */}
        <ZScrollSection index={3}>
          <ZScrollCard>
            <ServiceCard
              title="🌙 Natal Chart"
              description="Your cosmic blueprint"
              details="Discover your astrological profile and planetary influences"
              href="/natal"
            />
          </ZScrollCard>
        </ZScrollSection>

        {/* Quick Actions Section */}
        <ZScrollSection index={4}>
          <ZScrollCard>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gold mb-6">
                Quick Actions
              </h2>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => window.location.href = '/subscription'}
              >
                💎 Upgrade Subscription
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => window.location.href = '/settings'}
              >
                ⚙️ Settings
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
      <h3 className="text-2xl font-bold mb-2 text-gold">
        {title.split(' ').slice(1).join(' ')}
      </h3>
      <p className="text-gray-300 mb-3">{description}</p>
      <p className="text-sm text-gray-400 mb-6">{details}</p>
      <Button
        variant="primary"
        size="lg"
        onClick={() => window.location.href = href}
      >
        Explore
      </Button>
    </div>
  )
}
