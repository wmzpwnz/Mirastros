'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../gold-auth.css';
import { PasswordVisibilityButton } from '../../../components/ornaments/PasswordVisibilityButton';
import { api } from '../../../services/api';
import { SocialLoginButtons } from '../../../components/SocialLoginButtons';
import { AuthShell } from '../../../components/auth/AuthShell';
import { AuthField, AuthNotice } from '../../../components/auth/AuthField';
import { authError } from '../../../components/auth/authError';

export default function LoginPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const continueAfterLogin = async () => {
    try { const welcome = await api.getWelcomeState(); router.push(welcome.started && !welcome.completed ? '/auth/onboarding' : '/dashboard'); }
    catch { router.push('/dashboard'); }
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (loading) return;
    const fields = new FormData(event.currentTarget);
    const submittedEmail = String(fields.get('email') ?? '').trim();
    const submittedPassword = String(fields.get('password') ?? '');
    setEmail(submittedEmail);
    setPassword(submittedPassword);
    setError(''); setLoading(true);
    try { await api.login(submittedEmail, submittedPassword); await continueAfterLogin(); }
    catch (cause) { setError(authError(cause, 'Не удалось войти. Проверьте email и пароль и попробуйте снова.')); }
    finally { setLoading(false); }
  }
  return <AuthShell title="Вход" page="login" loading={loading} footer={<>Нет аккаунта? <Link href="/auth/register">Зарегистрироваться</Link></>}>
    <form className="auth-form" onSubmit={submit} aria-busy={loading}>
      <div className="auth-fields">
        <AuthField id="email" name="email" type="email" label="Email" placeholder="Email" autoComplete="email" autoCapitalize="none" spellCheck={false} required value={email} onChange={e => { setEmail(e.target.value); setError(''); }} disabled={loading} />
        <AuthField id="password" name="password" type={visible ? 'text' : 'password'} label="Пароль" placeholder="Пароль" autoComplete="current-password" required value={password} onChange={e => { setPassword(e.target.value); setError(''); }} disabled={loading} action={<PasswordVisibilityButton controlId="password" visible={visible} onToggle={() => setVisible(v => !v)} />} />
      </div>
      <Link href="/auth/forgot-password" className="auth-forgot">Забыли пароль?</Link>
      {error && <AuthNotice>{error}</AuthNotice>}
      <button type="submit" disabled={loading} className="mira-action mira-action-primary auth-submit">{loading ? 'Входим…' : 'Войти'}</button>
    </form>
    <SocialLoginButtons onSuccess={continueAfterLogin} onError={cause => setError(authError(cause, 'Не удалось войти. Попробуйте позже.'))} />
  </AuthShell>;
}
