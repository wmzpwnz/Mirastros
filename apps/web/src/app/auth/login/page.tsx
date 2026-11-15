'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../gold-auth.css';
import { PasswordVisibilityButton } from '../../../components/ornaments/PasswordVisibilityButton';
import { OrnamentFrame } from '../../../components/ornaments/OrnamentFrame';
import {
  Button as DSButton,
  Input as DSInput,
  Label as DSLabel,
} from '@mirastros-universal/design-system';
import Image from 'next/image';
import { api } from '../../../services/api';
import { SocialLoginButtons } from '../../../components/SocialLoginButtons';

const Button = DSButton as any;
const Input = DSInput as any;
const Label = DSLabel as any;

export default function LoginPage() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValueChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const continueAfterLogin = async () => {
    try {
      const welcome = await api.getWelcomeState();
      router.push(welcome.started && !welcome.completed ? '/auth/onboarding' : '/dashboard');
    } catch { router.push('/dashboard'); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.login(formData.email, formData.password);
      await continueAfterLogin();
    } catch (err: any) {
      const msg = err?.message || 'Ошибка входа. Проверьте email и пароль.';
      const isBackendUnreachable =
        msg.includes('Сервер') ||
        msg.includes('бэкенд') ||
        msg.includes('timeout') ||
        msg.includes('Таймаут') ||
        msg.includes('Таймаут запроса');
      setError(
        isBackendUnreachable && !msg.includes('npm start')
          ? `${msg} В корне проекта выполните: npm start`
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSuccess = async () => { await continueAfterLogin(); };

  const handleSocialError = (error: any) => {
    const msg = error?.message || 'Ошибка входа. Попробуйте позже.';
    setError(msg);
  };

  return (
    <div className="auth-shell auth-preset">
      <Link href="/" className="auth-brand-return" aria-label="На главную Mirastros"><Image src="/logo.png" alt="Mirastros" width={800} height={205} priority /></Link>
      <div className="auth-bg-wrapper" aria-hidden="true">
        <img src="/images/mirastros-reference-desktop.webp" alt="" className="auth-bg-img desktop-only" />
        <img src="/images/mirastros-reference-desktop.webp" alt="" className="auth-bg-img mobile-only" />
        <div className="auth-bg-overlay" />
        <div className="auth-bg-vignette" />
      </div>
      <div
        className="auth-warp"
        data-loading={loading ? 'true' : 'false'}
        data-error={error ? 'true' : 'false'}
        data-page="login"
      >
        <div className="auth-card auth-portal">
          <OrnamentFrame className="auth-preset-frame" />
          <div className="auth-card-inner">


            <div className="text-center">
              <h1 className="auth-title text-4xl font-bold text-white mb-3">Вход</h1>
              <p className="auth-subtitle text-base mt-3">Войдите в свой аккаунт Mirastros</p>
            </div>

            {error && (
              <div className="mt-5 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-12">
              <div className="space-y-10">
                <div className="auth-field">
                  <Label htmlFor="email" className="auth-field-label text-base font-medium text-white mb-4 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(val: any) => handleValueChange('email', val)}
                    placeholder="Email"
                    className="login-input h-14 text-lg"
                  />
                </div>

                <div className="auth-field">
                  <Label htmlFor="password" className="auth-field-label text-base font-medium text-white mb-4 block">
                    Пароль
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type={passwordVisible ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(val: any) => handleValueChange('password', val)}
                    placeholder="Пароль"
                    className="login-input h-14 text-lg"
                  />
                <PasswordVisibilityButton controlId="password" visible={passwordVisible} onToggle={() => setPasswordVisible(value => !value)} />
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 pb-2">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-mirastros-gold hover:text-mirastros-gold/80 transition font-medium"
                >
                  Забыли пароль?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                className="mira-action mira-action-primary w-full"
              >
                {loading ? 'Вход…' : 'Войти'}
              </Button>
            </form>

            <div className="auth-divider auth-divider--spaced"><span>или</span></div>

            <SocialLoginButtons onSuccess={handleSocialSuccess} onError={handleSocialError} />

            <p className="text-center text-base text-gray-300 pt-7">
              Нет аккаунта?{' '}
              <Link
                href="/auth/register"
                className="text-mirastros-gold hover:text-mirastros-gold/80 font-medium transition"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
