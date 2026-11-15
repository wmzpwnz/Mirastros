'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../services/api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

interface SocialLoginButtonsProps {
  onSuccess?: (user: any) => void | Promise<void>;
  onError?: (error: any) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: SocialLoginButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = useCallback(async (credentialResponse: any) => {
    setLoading(true);
    try {
      if (!credentialResponse.credential) throw new Error('Google не вернул данные входа');
      const result = await api.loginWithGoogle(credentialResponse.credential);

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      if (onSuccess) await onSuccess(result.user);
      else router.push('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [router, onSuccess, onError]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    return (
      <button disabled className="auth-social-btn opacity-50 cursor-not-allowed">
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Google</span>
      </button>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => onError?.(new Error('Google login failed'))}
          theme="filled_black"
          size="large"
          width="100%"
        />
      </div>
    </GoogleOAuthProvider>
  );
}

// Enable these providers only after their browser callbacks are implemented.
export function AppleLoginButton() {
  return <button type="button" disabled className="auth-social-btn opacity-50" title="Вход через Apple пока недоступен">Apple</button>;
}

export function VKLoginButton() {
  return <button type="button" disabled className="auth-social-btn opacity-50" title="Вход через VK пока недоступен">ВКонтакте</button>;
}

export function TelegramLoginButton({ onSuccess, onError }: SocialLoginButtonsProps) {
  const router = useRouter();

  React.useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleTelegramClick = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const webApp = (window as any).Telegram.WebApp;
      const user = webApp.initData;

      if (user) {
        try {
          const result = await api.loginWithTelegram(user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(result.user));
          }
          if (onSuccess) await onSuccess(result.user);
          else router.push('/dashboard');
        } catch (error) {
          console.error('Telegram login error:', error);
          onError?.(error);
        }
      } else {
        onError?.(new Error('Откройте приложение через Telegram-бота'));
      }
    } else {
      alert('Telegram Web App не доступно. Откройте приложение через Telegram бота.');
    }
  }, [router, onSuccess, onError]);

  return (
    <button
      type="button"
      onClick={handleTelegramClick}
      className="auth-social-btn"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm4.5 9.5s-.5 2-1 3.5c-.5 1.5-2.5 3-4 3h-.5l-1.5 2s-.5.5-1 .5-.5-.5-.5-1v-2.5l-2-1v-1.5l6-2.5 1 4.5s1-1 1.5-1.5c.5-.5 1.5-.5 1.5-.5l1-1.5zm-1.5-2s-.5 0-1 .5-.5 1-1 1l-1 .5s-.5.5-1 .5-.5-.5-.5-.5l.5-1s.5-.5 1-.5.5 0 1-.5c.5-.5 1-.5 1.5-.5s.5.5.5.5z"/>
      </svg>
      <span>Telegram</span>
    </button>
  );
}

export function SocialLoginButtons({ onSuccess, onError }: SocialLoginButtonsProps) {
  return (
    <div className="auth-social-grid">
      <GoogleLoginButton onSuccess={onSuccess} onError={onError} />
      <AppleLoginButton />
      <VKLoginButton />
      <TelegramLoginButton onSuccess={onSuccess} onError={onError} />
    </div>
  );
}
