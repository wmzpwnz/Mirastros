'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import '../gold-auth.css';
import { api } from '../../../services/api';
import { AuthShell } from '../../../components/auth/AuthShell';
import { AuthField, AuthNotice } from '../../../components/auth/AuthField';
import { authError } from '../../../components/auth/authError';
import { PasswordVisibilityButton } from '../../../components/ornaments/PasswordVisibilityButton';

function ResetPasswordContent() {
  const token = useSearchParams().get('token') || '';
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid' | 'success'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [fields, setFields] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setStatus('checking'); setMessage('');
    if (!token) { setStatus('invalid'); return; }
    void api.verifyPasswordResetToken(token).then(result => {
      if (!cancelled) setStatus(result.valid ? 'valid' : 'invalid');
    }).catch(() => { if (!cancelled) setStatus('invalid'); });
    return () => { cancelled = true; };
  }, [token]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (loading) return;
    const issues = { password: password.length < 8 || password.length > 100 ? 'Используйте от 8 до 100 символов.' : undefined, confirm: password !== confirm || !confirm ? 'Пароли не совпадают.' : undefined };
    setFields(issues); setMessage('');
    const first = issues.password ? 'password' : issues.confirm ? 'confirm' : null;
    if (first) { (event.currentTarget.elements.namedItem(first) as HTMLElement)?.focus(); return; }
    setLoading(true);
    try { await api.confirmPasswordReset(token, password); setStatus('success'); setPassword(''); setConfirm(''); }
    catch (cause) { setMessage(authError(cause, 'Не удалось сохранить пароль. Попробуйте ещё раз.')); }
    finally { setLoading(false); }
  }
  return <AuthShell title={status === 'success' ? 'Пароль изменён' : 'Новый пароль'} description={status === 'valid' ? 'Создайте новый пароль для вашего аккаунта.' : undefined} page="reset-password" loading={loading} footer={status !== 'success' ? <Link href="/auth/login">Вернуться ко входу</Link> : undefined}>
    {status === 'checking' && <p className="auth-description" role="status">Проверяем ссылку…</p>}
    {status === 'invalid' && <><AuthNotice>Ссылка недействительна или устарела. Запросите новую ссылку для сброса пароля.</AuthNotice><p className="auth-footer"><Link href="/auth/forgot-password">Запросить новую ссылку</Link></p></>}
    {status === 'success' && <><p className="auth-description" role="status">Теперь можно войти с новым паролем.</p><p className="auth-footer"><Link className="mira-action mira-action-primary auth-submit" href="/auth/login">Войти</Link></p></>}
    {status === 'valid' && <form onSubmit={submit} className="auth-form" noValidate aria-busy={loading}>
      <div className="auth-fields">
        <AuthField id="password" name="password" label="Новый пароль" placeholder="Новый пароль" type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={100} required disabled={loading} value={password} onChange={e => { setPassword(e.target.value); setFields({}); setMessage(''); }} hint="От 8 до 100 символов" error={fields.password} action={<PasswordVisibilityButton controlId="password" visible={visible} onToggle={() => setVisible(v => !v)} />} />
        <AuthField id="confirm" name="confirm" label="Повторите пароль" placeholder="Повторите пароль" type={confirmVisible ? 'text' : 'password'} autoComplete="new-password" maxLength={100} required disabled={loading} value={confirm} onChange={e => { setConfirm(e.target.value); setFields(previous => ({ ...previous, confirm: undefined })); setMessage(''); }} error={fields.confirm} action={<PasswordVisibilityButton controlId="confirm" visible={confirmVisible} onToggle={() => setConfirmVisible(v => !v)} confirmation />} />
      </div>
      {message && <AuthNotice>{message}</AuthNotice>}
      <button type="submit" disabled={loading} className="mira-action mira-action-primary auth-submit">{loading ? 'Сохраняем…' : 'Сохранить пароль'}</button>
    </form>}
  </AuthShell>;
}
export default function ResetPasswordPage() {
  return <Suspense fallback={<AuthShell title="Новый пароль" page="reset-password"><p className="auth-description" role="status">Проверяем ссылку…</p></AuthShell>}><ResetPasswordContent /></Suspense>;
}
