'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Stack } from '@mirastros-universal/design-system';
import { adminApi } from '../../../services/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminApi.login(formData.email, formData.password);
      router.push('/');
    } catch (err: any) {
      const msg = err?.message || 'Ошибка входа. Проверьте email и пароль.';
      setError(
        msg.includes('timeout') || msg.includes('unavailable')
          ? 'Сервер недоступен. Убедитесь, что backend запущен на http://localhost:8000'
          : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cosmic p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <Stack gap="6">
          <div className="text-center">
            <h1 className="text-4xl font-cinzel text-gold mb-2">Mirastros Admin</h1>
            <p className="text-silver/60">Войдите для доступа в панель администратора</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-silver mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData(prev => ({ ...prev, email: value ?? '' }))}
                  placeholder="admin@mirastros.com"
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-silver mb-2">
                  Пароль
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(value) => setFormData(prev => ({ ...prev, password: value ?? '' }))}
                  placeholder="Введите пароль"
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </Stack>
          </form>

          <div className="text-center text-xs text-silver/60">
            <p>Доступ только для пользователей с email из списка администраторов</p>
          </div>
        </Stack>
      </Card>
    </div>
  );
}
