import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ResetPasswordPage from './page';
const mocks = vi.hoisted(() => ({ verify: vi.fn(), confirm: vi.fn(), token: 'fixture-token' }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(mocks.token ? `token=${mocks.token}` : '') }));
vi.mock('../../../services/api', () => ({ api: { verifyPasswordResetToken: mocks.verify, confirmPasswordReset: mocks.confirm } }));
beforeEach(() => { vi.clearAllMocks(); mocks.token = 'fixture-token'; mocks.verify.mockResolvedValue({ valid: true, email: 'anna@example.com' }); mocks.confirm.mockResolvedValue({}); });
afterEach(cleanup);
it('offers a replacement link when the reset token is absent', async () => {
  mocks.token = ''; render(<ResetPasswordPage />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Ссылка недействительна');
  expect(screen.getByRole('link', { name: 'Запросить новую ссылку' })).toHaveAttribute('href', '/auth/forgot-password');
  expect(mocks.verify).not.toHaveBeenCalled(); expect(screen.queryByLabelText('Новый пароль', { selector: 'input' })).toBeNull();
});
it('honours an invalid token response without exposing the reset form', async () => {
  mocks.verify.mockResolvedValue({ valid: false }); render(<ResetPasswordPage />);
  await screen.findByRole('alert'); expect(screen.queryByLabelText('Новый пароль', { selector: 'input' })).toBeNull();
});
it('validates confirmation before calling the API and leaves a readable success screen', async () => {
  render(<ResetPasswordPage />); const password = await screen.findByLabelText('Новый пароль', { selector: 'input' });
  fireEvent.change(password, { target: { value: 'Password8300!' } });
  const confirm = screen.getByLabelText('Повторите пароль', { exact: true });
  fireEvent.change(confirm, { target: { value: 'Different8300!' } });
  const submit = () => fireEvent.submit(screen.getByRole('button', { name: 'Сохранить пароль' }).closest('form')!);
  submit(); expect(mocks.confirm).not.toHaveBeenCalled(); expect(confirm).toHaveFocus();
  fireEvent.change(confirm, { target: { value: 'Password8300!' } }); submit();
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Пароль изменён' })).toBeVisible());
  expect(mocks.confirm).toHaveBeenCalledWith('fixture-token', 'Password8300!');
  expect(screen.getByRole('link', { name: 'Войти' })).toHaveAttribute('href', '/auth/login');
});
