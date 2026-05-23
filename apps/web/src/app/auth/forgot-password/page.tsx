'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../auth.css';
import {
  Button as DSButton,
  Input as DSInput,
  Label as DSLabel,
} from '@mirastros-universal/design-system';
import { Background3D } from '../../../components/Background3D';
import { api } from '../../../services/api';

const Button = DSButton as any;
const Input = DSInput as any;
const Label = DSLabel as any;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus('idle');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.requestPasswordReset(email);
      setStatus('success');
      setMessage(res?.message || 'Если аккаунт существует, ссылка для сброса пароля отправлена на email.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
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
        data-error={status === 'error' ? 'true' : 'false'}
      >
        <div className="auth-card auth-portal">
          <div className="auth-card-inner space-y-6">
            <div className="text-center">
              <h1 className="auth-title font-cinzel text-3xl font-bold text-white mb-2">Сброс пароля</h1>
              <p className="auth-subtitle text-gray-400">
                Введите email — если аккаунт существует, мы отправим ссылку для сброса пароля.
              </p>
            </div>

            {message && (
              <div
                className={
                  status === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 text-emerald-200 text-sm'
                    : 'bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-red-300 text-sm'
                }
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="auth-field">
                <Label htmlFor="email" className="text-base font-medium text-white mb-2 block">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(val: any) => setEmail(val)}
                  placeholder="your@email.com"
                  className="auth-input h-14 text-lg"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                className="w-full h-14 text-lg font-sans font-normal justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] transition-all duration-500 bg-mirastros-gold text-black hover:bg-white border-none uppercase tracking-wider"
              >
                {loading ? 'Отправляем…' : 'Отправить ссылку'}
              </Button>

              <div className="flex items-center justify-between pt-2 text-sm">
                <Link href="/auth/login" className="text-mirastros-gold hover:text-mirastros-gold/80 transition font-medium">
                  Назад ко входу
                </Link>
                <button
                  type="button"
                  onClick={() => router.push('/auth/register')}
                  className="text-gray-300 hover:text-white transition"
                >
                  Регистрация
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
