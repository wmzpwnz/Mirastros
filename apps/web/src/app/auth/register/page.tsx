'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../gold-auth.css';
import { api } from '../../../services/api';
import { PasswordVisibilityButton } from '../../../components/ornaments/PasswordVisibilityButton';
import { SocialLoginButtons } from '../../../components/SocialLoginButtons';
import { AuthShell } from '../../../components/auth/AuthShell';
import { AuthField, AuthNotice } from '../../../components/auth/AuthField';
import { authError } from '../../../components/auth/authError';

type Field = 'fullName' | 'email' | 'password' | 'confirmPassword' | 'acceptTerms';
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const clear = (field: Field) => { setErrors(previous => ({ ...previous, [field]: undefined })); setError(''); };

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = event.currentTarget;
    // Safari/Keychain can fill the DOM without firing React change events.
    const values = new FormData(form);
    const enteredName = String(values.get('fullName') || '');
    const enteredEmail = String(values.get('email') || '');
    const enteredPassword = String(values.get('password') || '');
    const enteredConfirmation = String(values.get('confirmPassword') || '');
    const enteredTerms = values.has('acceptTerms');
    setName(enteredName); setEmail(enteredEmail); setPassword(enteredPassword);
    setConfirmation(enteredConfirmation); setTerms(enteredTerms);
    const issues: Partial<Record<Field, string>> = {};
    if (!enteredName.trim()) issues.fullName = 'Укажите, как к вам обращаться.';
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    if (!enteredEmail.trim() || emailInput.validity.typeMismatch) issues.email = 'Укажите корректный email.';
    if (enteredPassword.length < 8 || enteredPassword.length > 100) issues.password = 'Используйте от 8 до 100 символов.';
    if (!enteredConfirmation || enteredPassword !== enteredConfirmation) issues.confirmPassword = 'Пароли не совпадают.';
    if (!enteredTerms) issues.acceptTerms = 'Для регистрации нужно принять условия.';
    setErrors(issues); setError('');
    const first = Object.keys(issues)[0] as Field | undefined;
    if (first) { (form.elements.namedItem(first) as HTMLElement)?.focus(); return; }
    setLoading(true);
    try {
      let timezone = 'UTC';
      try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { /* Keep the default. */ }
      await api.register({ email: enteredEmail.trim(), password: enteredPassword, full_name: enteredName.trim(), preferredLanguage: 'ru', timezone });
      router.push('/auth/onboarding?start=1');
    } catch (cause) {
      setError(authError(cause, 'Не удалось создать аккаунт. Проверьте данные и попробуйте ещё раз.'));
    } finally { setLoading(false); }
  }

  return <AuthShell title="Регистрация" page="register" loading={loading} footer={<>Уже есть аккаунт? <Link href="/auth/login">Войти</Link></>}>
    <form onSubmit={register} className="auth-form" noValidate aria-busy={loading}>
      <div className="auth-fields">
        <AuthField id="fullName" name="fullName" label="Как к вам обращаться" autoComplete="given-name" value={name} onChange={e => { setName(e.target.value); clear('fullName'); }} required maxLength={255} placeholder="Имя" error={errors.fullName} disabled={loading} />
        <AuthField id="email" name="email" type="email" label="Email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={e => { setEmail(e.target.value); clear('email'); }} required placeholder="Email" error={errors.email} disabled={loading} />
        <AuthField id="password" name="password" label="Пароль · от 8 символов" placeholder="Пароль" type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={100} value={password} onChange={e => { setPassword(e.target.value); clear('password'); clear('confirmPassword'); }} required hint="От 8 до 100 символов" error={errors.password} disabled={loading} action={<PasswordVisibilityButton controlId="password" visible={visible} onToggle={() => setVisible(v => !v)} />} />
        <AuthField id="confirmPassword" name="confirmPassword" label="Повторите пароль" placeholder="Повторите пароль" type={confirmationVisible ? 'text' : 'password'} autoComplete="new-password" maxLength={100} value={confirmation} onChange={e => { setConfirmation(e.target.value); clear('confirmPassword'); }} required error={errors.confirmPassword} disabled={loading} action={<PasswordVisibilityButton controlId="confirmPassword" visible={confirmationVisible} onToggle={() => setConfirmationVisible(v => !v)} confirmation />} />
      </div>
      <div>
        <label className="auth-terms" htmlFor="acceptTerms"><span className="auth-terms-control"><input id="acceptTerms" name="acceptTerms" type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); clear('acceptTerms'); }} required disabled={loading} aria-invalid={Boolean(errors.acceptTerms)} aria-describedby={errors.acceptTerms ? 'acceptTerms-error' : undefined} /></span><span>Я принимаю <Link href="/terms" target="_blank" rel="noopener">условия использования</Link> и <Link href="/privacy" target="_blank" rel="noopener">политику конфиденциальности</Link></span></label>
        {errors.acceptTerms && <p className="auth-field-error" id="acceptTerms-error">{errors.acceptTerms}</p>}
      </div>
      {error && <AuthNotice>{error}</AuthNotice>}
      <button className="mira-action mira-action-primary auth-submit" type="submit" disabled={loading}>{loading ? 'Создаём аккаунт…' : 'Начать свой путь'} <span aria-hidden="true">✧</span></button>
    </form>
    <SocialLoginButtons onSuccess={() => router.push('/auth/onboarding?start=1')} onError={cause => setError(authError(cause, 'Не удалось войти. Попробуйте ещё раз.'))} />
  </AuthShell>;
}
