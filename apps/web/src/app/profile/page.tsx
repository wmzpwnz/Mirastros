'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import type { User } from '../../types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        birthDate: userData.birthDate || '',
        birthTime: userData.birthTime || '',
        birthLocation: userData.birthLocation?.city || '',
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // TODO: Implement update profile API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage('Профиль успешно обновлен');
    } catch (error) {
      setMessage('Ошибка при сохранении профиля');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mirastros-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard"
            className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition"
          >
            ← Назад к панели
          </Link>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-2">
            Профиль
          </h1>
          <p className="text-gray-400">Управление вашим аккаунтом</p>
        </div>

        {/* Subscription Status */}
        <div className="mb-8 bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-cinzel text-xl font-bold text-white mb-2">
                Подписка
              </h2>
              <p className="text-gray-400">
                Текущий тариф:{' '}
                <span className="text-mirastros-gold font-semibold capitalize">
                  {user.subscriptionTier}
                </span>
              </p>
              {user.subscriptionExpires && (
                <p className="text-gray-400 text-sm mt-1">
                  Действует до:{' '}
                  {new Date(user.subscriptionExpires).toLocaleDateString('ru-RU')}
                </p>
              )}
            </div>
            <Link
              href="/subscription"
              className="px-6 py-3 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition"
            >
              Управление подпиской
            </Link>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
          <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
            Личные данные
          </h2>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes('успешно')
                  ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                  : 'bg-red-500/10 border border-red-500/50 text-red-400'
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Полное имя
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
              />
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="font-cinzel text-lg font-bold text-white mb-4">
                Данные для астрологии
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Эти данные используются для персонализированных прогнозов
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Дата рождения
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Время рождения
                  </label>
                  <input
                    type="time"
                    name="birthTime"
                    value={formData.birthTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Место рождения
                  </label>
                  <input
                    type="text"
                    name="birthLocation"
                    value={formData.birthLocation}
                    onChange={handleChange}
                    placeholder="Москва, Россия"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
              <button
                onClick={() => loadUser()}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
          <h2 className="font-cinzel text-xl font-bold text-white mb-4">
            Опасная зона
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 mb-1">Выйти из аккаунта</p>
              <p className="text-gray-500 text-sm">
                Вы сможете войти снова в любое время
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-semibold rounded-lg transition"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
