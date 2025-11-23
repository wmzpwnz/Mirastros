'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  addToFavorites, 
  addToHomeScreen, 
  allowNotifications,
  requestPermissions 
} from '../../lib/vk'
import { CosmicBackground } from '../../components/CosmicBackground'
import { logout } from '../../lib/auth'

export default function SettingsPage() {
  const { auth } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAddToFavorites = async () => {
    setIsProcessing(true)
    try {
      const success = await addToFavorites()
      if (success) {
        alert('Приложение добавлено в избранное!')
      }
    } catch (error) {
      console.error('Error adding to favorites:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddToHomeScreen = async () => {
    setIsProcessing(true)
    try {
      const success = await addToHomeScreen()
      if (success) {
        alert('Приложение добавлено на главный экран!')
      }
    } catch (error) {
      console.error('Error adding to home screen:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAllowNotifications = async () => {
    setIsProcessing(true)
    try {
      const success = await allowNotifications()
      if (success) {
        alert('Уведомления включены!')
      }
    } catch (error) {
      console.error('Error allowing notifications:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRequestPermissions = async () => {
    setIsProcessing(true)
    try {
      const success = await requestPermissions(['friends', 'wall'])
      if (success) {
        alert('Разрешения предоставлены!')
      }
    } catch (error) {
      console.error('Error requesting permissions:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogout = async () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
      await logout()
      window.location.href = '/'
    }
  }

  return (
    <>
      <CosmicBackground />
      <main className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gold mb-2">⚙️ Настройки</h1>
            <p className="text-gray-300">Управление приложением</p>
          </div>

          {/* User Info */}
          {auth && (
            <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl mb-6">
              <h2 className="text-lg font-bold text-gold mb-4">Профиль</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Имя:</span>
                  <span className="text-gray-300">{auth.user.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-gray-300">{auth.user.email || 'Не указан'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Подписка:</span>
                  <span className="text-gold capitalize">{auth.user.subscription_tier}</span>
                </div>
              </div>
            </div>
          )}

          {/* VK Features */}
          <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl mb-6">
            <h2 className="text-lg font-bold text-gold mb-4">Функции VK</h2>
            <div className="space-y-3">
              <button
                onClick={handleAddToFavorites}
                disabled={isProcessing}
                className="w-full bg-purple-deep/50 border border-gold/20 text-gray-300 font-medium py-3 rounded-lg hover:border-gold/50 transition-colors disabled:opacity-50 text-left px-4"
              >
                ⭐ Добавить в избранное
              </button>
              <button
                onClick={handleAddToHomeScreen}
                disabled={isProcessing}
                className="w-full bg-purple-deep/50 border border-gold/20 text-gray-300 font-medium py-3 rounded-lg hover:border-gold/50 transition-colors disabled:opacity-50 text-left px-4"
              >
                📱 Добавить на главный экран
              </button>
              <button
                onClick={handleAllowNotifications}
                disabled={isProcessing}
                className="w-full bg-purple-deep/50 border border-gold/20 text-gray-300 font-medium py-3 rounded-lg hover:border-gold/50 transition-colors disabled:opacity-50 text-left px-4"
              >
                🔔 Включить уведомления
              </button>
              <button
                onClick={handleRequestPermissions}
                disabled={isProcessing}
                className="w-full bg-purple-deep/50 border border-gold/20 text-gray-300 font-medium py-3 rounded-lg hover:border-gold/50 transition-colors disabled:opacity-50 text-left px-4"
              >
                🔐 Разрешить доступ к друзьям и стене
              </button>
            </div>
          </div>

          {/* App Settings */}
          <div className="bg-purple-deep/80 backdrop-blur-md border border-gold/20 rounded-2xl p-6 shadow-2xl mb-6">
            <h2 className="text-lg font-bold text-gold mb-4">Приложение</h2>
            <div className="space-y-3">
              <a
                href="/subscription"
                className="block w-full bg-purple-deep/50 border border-gold/20 text-gray-300 font-medium py-3 rounded-lg hover:border-gold/50 transition-colors text-left px-4"
              >
                💎 Управление подпиской
              </a>
              <a
                href="https://vk.com/mirastros"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-purple-deep/50 border border-gold/20 text-gray-300 font-medium py-3 rounded-lg hover:border-gold/50 transition-colors text-left px-4"
              >
                📢 Наше сообщество VK
              </a>
              <a
                href="https://vk.com/support"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-purple-deep/50 border border-gold/20 text-gray-300 font-medium py-3 rounded-lg hover:border-gold/50 transition-colors text-left px-4"
              >
                💬 Поддержка
              </a>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/20 border border-red-500/50 text-red-400 font-semibold py-3 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            🚪 Выйти из аккаунта
          </button>

          {/* Back Button */}
          <a
            href="/"
            className="block text-center text-gray-400 hover:text-gold transition-colors mt-6"
          >
            ← Вернуться на главную
          </a>

          {/* App Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Mirastros VK Mini App v1.0.0
              <br />
              Powered by VK Mini Apps Platform
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
