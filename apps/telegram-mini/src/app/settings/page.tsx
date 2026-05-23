'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authenticatedFetch } from '../../lib/auth'
import { CosmicBackground } from '../../components/CosmicBackground'
import { ZScrollCard } from '../../components/ZScrollContainer'
import { Button, Spinner, Badge } from '@mirastros-universal/design-system'
import {
  updateNotificationPreferences,
  triggerHapticFeedback,
  showPopup,
  closeMiniApp,
} from '../../lib/telegram'

interface NotificationPreferences {
  daily_horoscope: boolean
  transit_alerts: boolean
  lunar_phases: boolean
  personalized_insights: boolean
}

export default function SettingsPage() {
  const { auth, logout } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    daily_horoscope: false,
    transit_alerts: false,
    lunar_phases: false,
    personalized_insights: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const response = await authenticatedFetch('/telegram/notifications/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    }
    setPreferences(newPreferences)
    triggerHapticFeedback('light')

    setIsSaving(true)
    const success = await updateNotificationPreferences(newPreferences)
    setIsSaving(false)

    if (success) {
      triggerHapticFeedback('success')
    } else {
      triggerHapticFeedback('error')
      // Revert on failure
      setPreferences(preferences)
      await showPopup(
        'Error',
        'Failed to update notification preferences',
        [{ text: 'OK', type: 'ok' }]
      )
    }
  }

  const handleLogout = async () => {
    const confirmed = await showPopup(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', type: 'cancel' },
        { text: 'Logout', type: 'destructive' },
      ]
    )

    if (confirmed === '0') {
      triggerHapticFeedback('medium')
      logout()
      closeMiniApp()
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = await showPopup(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', type: 'cancel' },
        { text: 'Delete', type: 'destructive' },
      ]
    )

    if (confirmed === '0') {
      const doubleConfirm = await showPopup(
        'Are you absolutely sure?',
        'Type DELETE to confirm account deletion',
        [
          { text: 'Cancel', type: 'cancel' },
          { text: 'Confirm', type: 'destructive' },
        ]
      )

      if (doubleConfirm === '0') {
        try {
          const response = await authenticatedFetch('/auth/delete-account', {
            method: 'DELETE',
          })

          if (response.ok) {
            triggerHapticFeedback('success')
            await showPopup(
              'Account Deleted',
              'Your account has been permanently deleted.',
              [{ text: 'OK', type: 'ok' }]
            )
            logout()
            closeMiniApp()
          } else {
            throw new Error('Failed to delete account')
          }
        } catch (error) {
          triggerHapticFeedback('error')
          await showPopup(
            'Error',
            'Failed to delete account. Please try again later.',
            [{ text: 'OK', type: 'ok' }]
          )
        }
      }
    }
  }

  if (isLoading) {
    return (
      <>
        <CosmicBackground />
        <main className="min-h-screen p-6 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-300">Loading settings...</p>
          </div>
        </main>
      </>
    )
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
              ⚙️ Settings
            </h1>
            <p className="text-gray-300">
              Manage your account and preferences
            </p>
          </div>

          {/* Account Info */}
          {auth && (
            <ZScrollCard className="mb-6">
              <h2 className="text-xl font-bold text-gold mb-4">Account</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Name</span>
                  <span className="text-white font-semibold">
                    {auth.user.full_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Subscription</span>
                  <Badge variant="primary">
                    {auth.user.subscription_tier.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">User ID</span>
                  <span className="text-gray-500 text-sm font-mono">
                    {auth.user.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gold/20">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => window.location.href = '/subscription'}
                  className="w-full"
                >
                  Manage Subscription
                </Button>
              </div>
            </ZScrollCard>
          )}

          {/* Notification Preferences */}
          <ZScrollCard className="mb-6">
            <h2 className="text-xl font-bold text-gold mb-4">
              🔔 Notifications
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Receive updates via Telegram bot
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">Daily Horoscope</div>
                  <div className="text-xs text-gray-400">
                    Get your horoscope every morning
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('daily_horoscope')}
                  disabled={isSaving}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.daily_horoscope ? 'bg-gold' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.daily_horoscope ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">Transit Alerts</div>
                  <div className="text-xs text-gray-400">
                    Important planetary movements
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('transit_alerts')}
                  disabled={isSaving}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.transit_alerts ? 'bg-gold' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.transit_alerts ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">Lunar Phases</div>
                  <div className="text-xs text-gray-400">
                    New moon and full moon alerts
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('lunar_phases')}
                  disabled={isSaving}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.lunar_phases ? 'bg-gold' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.lunar_phases ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">
                    Personalized Insights
                  </div>
                  <div className="text-xs text-gray-400">
                    AI-generated guidance (Premium+)
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('personalized_insights')}
                  disabled={
                    isSaving ||
                    auth?.user.subscription_tier === 'freemium'
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.personalized_insights ? 'bg-gold' : 'bg-gray-600'
                  } ${
                    auth?.user.subscription_tier === 'freemium'
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.personalized_insights ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </ZScrollCard>

          {/* Actions */}
          <ZScrollCard className="mb-6">
            <h2 className="text-xl font-bold text-gold mb-4">Actions</h2>
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleLogout}
                className="w-full"
              >
                Logout
              </Button>
              <Button
                variant="danger"
                size="lg"
                onClick={handleDeleteAccount}
                className="w-full"
              >
                Delete Account
              </Button>
            </div>
          </ZScrollCard>

          {/* About */}
          <ZScrollCard>
            <h2 className="text-xl font-bold text-gold mb-4">About</h2>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Mirastros v1.0.0</p>
              <p>Mystical AI-powered esoteric services</p>
              <p className="pt-2 border-t border-gold/20">
                <a href="https://mirastros.com/privacy" className="text-gold hover:underline">
                  Privacy Policy
                </a>
                {' • '}
                <a href="https://mirastros.com/terms" className="text-gold hover:underline">
                  Terms of Service
                </a>
              </p>
            </div>
          </ZScrollCard>
        </div>
      </main>
    </>
  )
}
