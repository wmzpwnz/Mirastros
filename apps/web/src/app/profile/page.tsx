'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, DatePicker } from '@mirastros-universal/design-system';
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

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Parse birth location if it's a string
      let birthLocation = null;
      if (formData.birthLocation) {
        // If it's already an object, use it; otherwise try to parse
        if (typeof formData.birthLocation === 'string') {
          // Try to get from user's existing birth location
          birthLocation = user?.birthLocation || null;
        } else {
          birthLocation = formData.birthLocation;
        }
      }

      const updatedUser = await api.updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        birthDate: formData.birthDate || undefined,
        birthTime: formData.birthTime || undefined,
        birthLocation: birthLocation || undefined,
      });

      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      setMessage('Профиль успешно обновлен');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setMessage(error.message || 'Ошибка при сохранении профиля');
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

  const birthDateValue = formData.birthDate
    ? new Date(`${formData.birthDate}T00:00:00`)
    : undefined;

  return (
    <div className="mira-profile-page min-h-screen py-12 px-4">
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

        <div className="mb-8 flex flex-wrap gap-4 text-mirastros-gold">
          <Link href="/auth/onboarding?view=portrait">✧ Мой личный портрет</Link>
          <Link href="/auth/onboarding?edit=1">Уточнить данные рождения →</Link>
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
              className="inline-flex px-6 py-3 rounded-lg bg-mirastros-gold text-black font-semibold hover:bg-mirastros-gold/90 transition"
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
              <Label>Полное имя</Label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={(value) => handleChange('fullName', value)}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={(value) => handleChange('email', value)}
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
                  <Label>Дата рождения</Label>
                  <DatePicker
                    name="birthDate"
                    value={birthDateValue}
                    onChange={(date) => handleChange('birthDate', date.toISOString().slice(0, 10))}
                  />
                </div>

                <div>
                  <Label>Время рождения</Label>
                  <Input
                    type="time"
                    name="birthTime"
                    value={formData.birthTime}
                    onChange={(value) => handleChange('birthTime', value)}
                  />
                </div>

                <div>
                  <Label>Место рождения</Label>
                  <Input
                    type="text"
                    name="birthLocation"
                    value={formData.birthLocation}
                    onChange={(value) => handleChange('birthLocation', value)}
                    placeholder="Москва, Россия"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                onClick={handleSave}
                disabled={saving}
                loading={saving}
                className="flex-1"
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
              <Button
                onClick={() => loadUser()}
                variant="secondary"
                className="px-6"
              >
                Отменить
              </Button>
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
            <Button
              onClick={handleLogout}
              variant="danger"
              className="px-6"
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
