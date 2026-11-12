'use client';

export function PasswordVisibilityButton({ controlId, visible, onToggle, confirmation = false }: {
  controlId: string; visible: boolean; onToggle: () => void; confirmation?: boolean;
}) {
  return <button type="button" className="auth-password-toggle" onClick={onToggle} aria-controls={controlId} aria-pressed={visible} aria-label={`${visible ? 'Скрыть' : 'Показать'} ${confirmation ? 'подтверждение пароля' : 'пароль'}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{visible && <path d="m3 3 18 18" />}</svg>
  </button>;
}
