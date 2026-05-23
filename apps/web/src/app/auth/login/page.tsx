'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../auth.css';
import {
  Button as DSButton,
  Input as DSInput,
  Checkbox as DSCheckbox,
  Label as DSLabel,
} from '@mirastros-universal/design-system';
import Image from 'next/image';
import { Background3D } from '../../../components/Background3D';
import { api } from '../../../services/api';

const Button = DSButton as any;
const Input = DSInput as any;
const Checkbox = DSCheckbox as any;
const Label = DSLabel as any;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValueChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.login(formData.email, formData.password);
      router.push('/dashboard');
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

  const handleSocialLogin = (provider: string) => {
    // TODO: wire up real social auth flows (Google/Apple) when tokens are available.
    alert(provider + ' login coming soon');
  };

  return (
    <div className="auth-shell">
      <Background3D />
      <div className="auth-bg-wrapper" aria-hidden="true">
        <img src="/backweb.png" alt="" className="auth-bg-img desktop-only" />
        <img src="/backmobile.png" alt="" className="auth-bg-img mobile-only" />
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
          <div className="auth-card-inner">
            <div className="flex justify-center mb-10">
              <div className="auth-logo-img" aria-hidden="true">
                <Image src="/logo.png" alt="Mirastros" width={180} height={64} priority />
              </div>
            </div>

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
                  <Label htmlFor="email" className="text-base font-medium text-white mb-4 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(val: any) => handleValueChange('email', val)}
                    placeholder="your@email.com"
                    className="login-input h-14 text-lg"
                  />
                </div>

                <div className="auth-field">
                  <Label htmlFor="password" className="text-base font-medium text-white mb-4 block">
                    Пароль
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(val: any) => handleValueChange('password', val)}
                    placeholder="••••••••"
                    className="login-input h-14 text-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 pb-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <Checkbox
                    id="remember"
                    name="remember"
                    className="!w-5 !h-5 rounded border-2 border-white/30 bg-black/30 text-mirastros-gold"
                  />
                  <span className="text-sm text-gray-300/80">Запомнить меня</span>
                </label>

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
                className="mt-6 w-full h-16 text-lg font-sans font-normal justify-center shadow-[0_0_30px_rgba(212,175,55,0.20)] hover:shadow-[0_0_50px_rgba(212,175,55,0.35)] transition-all duration-500 bg-mirastros-gold text-black hover:bg-white border-none uppercase tracking-wider"
              >
                {loading ? 'Вход…' : 'Войти'}
              </Button>
            </form>

            <div className="auth-divider auth-divider--spaced"><span>или</span></div>

            <div className="auth-social-grid">
              <button type="button" onClick={() => handleSocialLogin('Google')} className="auth-social-btn">
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>
              <button type="button" onClick={() => handleSocialLogin('Apple')} className="auth-social-btn">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Apple</span>
              </button>
            </div>

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
