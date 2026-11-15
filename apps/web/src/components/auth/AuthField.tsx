import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string; label: string; error?: string; hint?: string; action?: ReactNode;
}
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField({ id, label, error, hint, action, ...input }, ref) {
  return <div className="auth-field-group">
    <label className="auth-field-label" htmlFor={id}>{label}</label>
    <div className="auth-field" data-action={Boolean(action)}>
      <input {...input} id={id} ref={ref} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} />
      {action}
    </div>
    {error ? <p className="auth-field-error" id={`${id}-error`}>{error}</p> : hint && <p className="auth-field-hint" id={`${id}-hint`}>{hint}</p>}
  </div>;
});

export function AuthNotice({ children, success = false }: { children: ReactNode; success?: boolean }) {
  return <div className="auth-notice" data-tone={success ? 'success' : 'error'} role={success ? 'status' : 'alert'}>{children}</div>;
}
