'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import '../gold-auth.css';
import { api } from '../../../services/api';
import { AuthShell } from '../../../components/auth/AuthShell';
import { AuthField, AuthNotice } from '../../../components/auth/AuthField';
import { authError } from '../../../components/auth/authError';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (loading) return;
    setLoading(true); setMessage(''); setSuccess(false);
    try {
      await api.requestPasswordReset(email.trim()); setSuccess(true);
      setMessage('Если аккаунт с таким email существует, мы отправили письмо со ссылкой. Проверьте также папку «Спам».');
    } catch (cause) { setMessage(authError(cause, 'Не удалось отправить письмо. Попробуйте позже.')); }
    finally { setLoading(false); }
  }
  return <AuthShell title="Сброс пароля" description="Укажите email вашего аккаунта. Мы отправим ссылку для создания нового пароля." page="forgot-password" loading={loading}>
    <form onSubmit={submit} className="auth-form" aria-busy={loading}>
      <AuthField id="email" name="email" type="email" label="Email" placeholder="Email" autoComplete="email" autoCapitalize="none" spellCheck={false} required value={email} onChange={e => { setEmail(e.target.value); setMessage(''); setSuccess(false); }} disabled={loading} />
      {message && <AuthNotice success={success}>{message}</AuthNotice>}
      <button type="submit" disabled={loading} className="mira-action mira-action-primary auth-submit">{loading ? 'Отправляем…' : 'Отправить ссылку'}</button>
      <nav className="auth-links"><Link href="/auth/login">Назад ко входу</Link><Link href="/auth/register">Регистрация</Link></nav>
    </form>
  </AuthShell>;
}
