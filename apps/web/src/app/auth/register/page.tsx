'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import '../gold-auth.css';
import { api } from '../../../services/api';
import { OrnamentFrame } from '../../../components/ornaments/OrnamentFrame';
import { PasswordVisibilityButton } from '../../../components/ornaments/PasswordVisibilityButton';
import { SocialLoginButtons } from '../../../components/SocialLoginButtons';

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

  async function register(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    if (!name.trim()) { setError('Укажите, как к вам обращаться.'); return; }
    if (password.length < 8) { setError('Пароль должен содержать минимум 8 символов.'); return; }
    if (password !== confirmation) { setError('Пароли не совпадают.'); return; }
    if (!terms) { setError('Примите условия использования и политику конфиденциальности.'); return; }
    setLoading(true); setError('');
    try {
      let timezone = 'UTC';
      try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { /* Keep the default. */ }
      await api.register({ email: email.trim(), password, full_name: name.trim(), preferredLanguage: 'ru', timezone });
      router.push('/auth/onboarding?start=1');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось создать аккаунт. Попробуйте ещё раз.');
    } finally { setLoading(false); }
  }

  return <div className="auth-shell auth-preset">
    <Link href="/" className="auth-brand-return" aria-label="На главную Mirastros"><Image src="/logo.png" alt="Mirastros" width={800} height={205} priority /></Link>
    <div className="auth-bg-wrapper" aria-hidden="true"><img src="/images/mirastros-sanctuary.webp" alt="" className="auth-bg-img" /><div className="auth-bg-overlay" /><div className="auth-bg-vignette" /></div>
    <main className="auth-warp" data-page="register" data-loading={loading}>
      <div className="auth-card auth-portal"><OrnamentFrame className="auth-preset-frame" />
        <div className="auth-card-inner">
          <h1 className="auth-title">Начало пути</h1>
          <p className="auth-subtitle">Один аккаунт для всех направлений Mirastros.<br />Впереди — три шага знакомства с собой.</p>
          <form onSubmit={register}>
            <div className="space-y-5">
              <div><label htmlFor="fullName">Как к вам обращаться</label><input id="fullName" name="name" autoComplete="given-name" value={name} onChange={e => setName(e.target.value)} required maxLength={255} placeholder="Ваше имя" /></div>
              <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" /></div>
              <div><label htmlFor="password">Пароль · от 8 символов</label><div className="auth-field"><input id="password" name="password" type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={100} value={password} onChange={e => setPassword(e.target.value)} required /><PasswordVisibilityButton controlId="password" visible={visible} onToggle={() => setVisible(v => !v)} /></div></div>
              <div><label htmlFor="confirmPassword">Повторите пароль</label><div className="auth-field"><input id="confirmPassword" name="confirmPassword" type={confirmationVisible ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required /><PasswordVisibilityButton controlId="confirmPassword" visible={confirmationVisible} onToggle={() => setConfirmationVisible(v => !v)} confirmation /></div></div>
            </div>
            <label htmlFor="acceptTerms"><span><input id="acceptTerms" type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} required /></span><span>Я принимаю <Link href="/terms" target="_blank" rel="noopener">условия использования</Link> и <Link href="/privacy" target="_blank" rel="noopener">политику конфиденциальности</Link></span></label>
            {error && <p role="alert" style={{ color: '#f3a7b3', fontSize: 13, lineHeight: 1.6 }}>{error}</p>}
            <button className="mira-action mira-action-primary" type="submit" disabled={loading}>{loading ? 'Создаём ваше пространство…' : 'Начать свой путь'} <span aria-hidden="true">✧</span></button>
          </form>
          <div className="auth-divider"><span>или</span></div>
          <SocialLoginButtons onSuccess={() => router.push('/auth/onboarding?start=1')} onError={cause => setError(cause instanceof Error ? cause.message : 'Не удалось войти. Попробуйте ещё раз.')} />
          <p>Уже есть аккаунт? <Link href="/auth/login" className="text-mirastros-gold">Войти</Link></p>
        </div>
      </div>
    </main>
  </div>;
}
