import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import RegisterPage from './page';
const mocks = vi.hoisted(() => ({ register: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('../../../services/api', () => ({ api: { register: mocks.register } }));
vi.mock('../../../components/SocialLoginButtons', () => ({ SocialLoginButtons: () => null }));
beforeEach(() => { vi.clearAllMocks(); mocks.register.mockResolvedValue({}); });
afterEach(cleanup);
const submit = () => fireEvent.submit(screen.getByRole('button', { name: /Начать свой путь/ }).closest('form')!);
function fill() {
  fireEvent.change(screen.getByLabelText('Как к вам обращаться'), { target: { value: ' Анна ' } });
  fireEvent.change(screen.getByLabelText('Email', { exact: true }), { target: { value: 'anna@example.com' } });
  fireEvent.change(screen.getByLabelText('Пароль · от 8 символов'), { target: { value: 'Password8300!' } });
  fireEvent.change(screen.getByLabelText('Повторите пароль', { exact: true }), { target: { value: 'Password8300!' } });
  fireEvent.click(screen.getByRole('checkbox'));
}
it('keeps invalid submissions local, describes errors and focuses the first field', () => {
  render(<RegisterPage />); submit();
  expect(mocks.register).not.toHaveBeenCalled();
  const name = screen.getByLabelText('Как к вам обращаться');
  expect(name).toHaveFocus(); expect(name).toHaveAttribute('aria-invalid', 'true');
  expect(name).toHaveAccessibleDescription('Укажите, как к вам обращаться.');
  fireEvent.change(name, { target: { value: 'Анна' } });
  expect(name).toHaveAttribute('aria-invalid', 'false');
});
it('does not submit mismatched passwords and focuses confirmation', () => {
  render(<RegisterPage />); fill();
  fireEvent.change(screen.getByLabelText('Повторите пароль', { exact: true }), { target: { value: 'Different8300!' } }); submit();
  expect(mocks.register).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Повторите пароль', { exact: true })).toHaveFocus();
  expect(screen.getByText('Пароли не совпадают.')).toBeVisible();
});
it('submits normalized profile data once and continues into the short welcome flow', async () => {
  let finish!: (value: unknown) => void;
  mocks.register.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  render(<RegisterPage />); fill(); const form = screen.getByRole('button', { name: /Начать свой путь/ }).closest('form')!; fireEvent.submit(form); fireEvent.submit(form);
  expect(mocks.register).toHaveBeenCalledTimes(1);
  expect(mocks.register).toHaveBeenCalledWith(expect.objectContaining({ email: 'anna@example.com', full_name: 'Анна', password: 'Password8300!', preferredLanguage: 'ru' }));
  expect(screen.getByLabelText('Email', { exact: true })).toBeDisabled();
  expect(mocks.push).not.toHaveBeenCalled(); finish({});
  await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/auth/onboarding?start=1'));
});
it('translates duplicate email and allows a retry without losing entered data', async () => {
  mocks.register.mockRejectedValueOnce(new Error('Email already registered'));
  render(<RegisterPage />); fill(); submit();
  await screen.findByRole('alert');
  expect(screen.getByRole('alert')).toHaveTextContent('Этот email уже зарегистрирован');
  expect(screen.getByLabelText('Email', { exact: true })).toHaveValue('anna@example.com');
  expect(screen.getByRole('button', { name: /Начать свой путь/ })).toBeEnabled();
  submit(); await waitFor(() => expect(mocks.push).toHaveBeenCalled());
});
it('keeps technical server instructions out of the registration error', async () => {
  mocks.register.mockRejectedValue(new Error('Запустите PostgreSQL localhost:5432 DATABASE_URL apps/backend/.env'));
  render(<RegisterPage />); fill(); submit();
  expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось связаться с Mirastros');
  expect(screen.getByRole('alert')).not.toHaveTextContent(/PostgreSQL|DATABASE_URL|localhost/);
});

it('reads Safari autofill values even when no React change event was fired', async () => {
  render(<RegisterPage />);
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  fireEvent.click(screen.getByRole('checkbox'));
  // Fill after React's checkbox render, as a password manager would.
  for (const [label, value] of [
    ['Как к вам обращаться', 'Азиз'], ['Email', 'fixture@example.com'],
    ['Пароль · от 8 символов', 'Fixture8300!'], ['Повторите пароль', 'Fixture8300!'],
  ]) setValue.call(screen.getByLabelText(label, { exact: true }), value);
  submit();
  await waitFor(() => expect(mocks.register).toHaveBeenCalledWith(expect.objectContaining({ full_name: 'Азиз', email: 'fixture@example.com', password: 'Fixture8300!' })));
  expect(mocks.push).toHaveBeenCalledWith('/auth/onboarding?start=1');
});
