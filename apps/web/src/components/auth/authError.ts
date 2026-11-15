/** Keep infrastructure details and raw upstream errors out of the account UI. */
export function authError(cause: unknown, fallback: string): string {
  const message = cause instanceof Error ? cause.message : '';
  if (/email already registered/i.test(message)) return 'Этот email уже зарегистрирован. Войдите или восстановите пароль.';
  if (/incorrect email|неверный email/i.test(message)) return 'Неверный email или пароль. Проверьте данные и попробуйте снова.';
  if (/token.*(invalid|expired)|недействител|ист[её]к/i.test(message)) return 'Ссылка недействительна или устарела. Запросите новую.';
  if (/network|fetch|timeout|таймаут|сервер|бэкенд|database|postgres|localhost|npm|503|500/i.test(message)) return 'Не удалось связаться с Mirastros. Попробуйте ещё раз чуть позже.';
  return fallback;
}
