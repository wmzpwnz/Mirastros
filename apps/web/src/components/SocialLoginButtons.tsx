'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../services/api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

interface SocialLoginButtonsProps {
  onSuccess?: (user: any) => void | Promise<void>;
  onError?: (error: unknown) => void;
}
function telegramData(): string {
  return typeof window !== 'undefined' ? (window as any).Telegram?.WebApp?.initData || '' : '';
}
export function GoogleLoginButton({ onSuccess, onError }: SocialLoginButtonsProps) {
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  return <GoogleOAuthProvider clientId={clientId}><div className="auth-google"><GoogleLogin
    onSuccess={async response => {
      try {
        if (!response.credential) throw new Error('Google не вернул данные входа');
        const result = await api.loginWithGoogle(response.credential);
        localStorage.setItem('user', JSON.stringify(result.user));
        if (onSuccess) await onSuccess(result.user); else router.push('/dashboard');
      } catch (cause) { onError?.(cause); }
    }}
    onError={() => onError?.(new Error('Не удалось войти через Google'))}
    theme="filled_black" size="large" shape="rectangular" text="continue_with"
  /></div></GoogleOAuthProvider>;
}

export function TelegramLoginButton({ onSuccess, onError }: SocialLoginButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function login() {
    if (loading) return;
    const initData = telegramData();
    if (!initData) { onError?.(new Error('Откройте Mirastros внутри Telegram.')); return; }
    setLoading(true);
    try {
      const result = await api.loginWithTelegram(initData);
      localStorage.setItem('user', JSON.stringify(result.user));
      if (onSuccess) await onSuccess(result.user); else router.push('/dashboard');
    } catch (cause) { onError?.(cause); }
    finally { setLoading(false); }
  }
  return <button type="button" disabled={loading} onClick={login} className="auth-social-btn" aria-busy={loading}>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m21 3-4 18-6-5-3 3 .5-6L19 5 6.5 12 2 10Z" /></svg>
    {loading ? 'Входим…' : 'Войти через Telegram'}
  </button>;
}

/** No decorative disabled providers; Telegram is offered only in its signed host. */
export function SocialLoginButtons(props: SocialLoginButtonsProps) {
  const [telegramAvailable, setTelegramAvailable] = useState(false);
  useEffect(() => { setTelegramAvailable(Boolean(telegramData())); }, []);
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && !telegramAvailable) return null;
  return <section aria-label="Другие способы входа"><div className="auth-divider"><span>или</span></div><div className="auth-social-grid">
    <GoogleLoginButton {...props} />
    {telegramAvailable && <TelegramLoginButton {...props} />}
  </div></section>;
}
