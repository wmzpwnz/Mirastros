'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [tokenStatus, setTokenStatus] = useState('checking'); // checking | valid | invalid
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) {
        setTokenStatus('invalid');
        setMessage('Не указан токен сброса пароля.');
        return;
      }
      try {
        const res = await api.verifyPasswordResetToken(token);
        if (cancelled) return;
        setTokenStatus('valid');
        setEmail(res.email);
      } catch (err: any) {
        if (cancelled) return;
        setTokenStatus('invalid');
        setMessage(err?.message || 'Токен недействителен или истёк.');
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage('');

    if (!password || password.length < 8) {
      setMessage('Пароль должен содержать минимум 8 символов.');
      return;
    }
    if (password !== confirm) {
      setMessage('Пароли не совпадают.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.confirmPasswordReset(token, password);
      setMessage(res?.message || 'Пароль изменён. Теперь можно войти.');
      setTimeout(() => router.push('/auth/login'), 800);
    } catch (err: any) {
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
        data-error={tokenStatus === 'invalid' ? 'true' : 'false'}
      >
        <div className="auth-card auth-portal">
          <div className="auth-card-inner space-y-6">
            <div className="text-center">
              <h1 className="auth-title font-cinzel text-3xl font-bold text-white mb-2">Новый пароль</h1>
              <p className="auth-subtitle text-gray-400">
                {tokenStatus === 'checking' && 'Проверяем ссылку…'}
                {tokenStatus === 'valid' && `Аккаунт: ${email}`}
                {tokenStatus === 'invalid' && 'Ссылка недействительна'}
              </p>
            </div>

            {message && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 text-sm">
                {message}
              </div>
            )}

            {tokenStatus === 'valid' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="auth-field">
                  <Label htmlFor="password" className="text-base font-medium text-white mb-2 block">
                    Новый пароль
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(val: any) => setPassword(val)}
                    placeholder="••••••••"
                    className="auth-input h-14 text-lg"
                  />
                </div>

                <div className="auth-field">
                  <Label htmlFor="confirm" className="text-base font-medium text-white mb-2 block">
                    Повторите пароль
                  </Label>
                  <Input
                    id="confirm"
                    name="confirm"
                    type="password"
                    required
                    value={confirm}
                    onChange={(val: any) => setConfirm(val)}
                    placeholder="••••••••"
                    className="auth-input h-14 text-lg"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  className="w-full h-14 text-lg font-sans font-normal justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] transition-all duration-500 bg-mirastros-gold text-black hover:bg-white border-none uppercase tracking-wider"
                >
                  {loading ? 'Сохраняем…' : 'Сохранить пароль'}
                </Button>
              </form>
            )}

            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-mirastros-gold hover:text-mirastros-gold/80 transition font-medium">
                Вернуться ко входу
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-shell">
          <Background3D />
          <div className="auth-warp">
            <div className="auth-card auth-portal">
              <div className="auth-card-inner text-center text-gray-300">Проверяем ссылку...</div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
