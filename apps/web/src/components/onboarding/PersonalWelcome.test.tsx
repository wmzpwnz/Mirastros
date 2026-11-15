import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PersonalWelcome } from './PersonalWelcome';
import type { WelcomeState } from '../../services/welcomeTypes';

const mocks = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), state: vi.fn(), start: vi.fn(), save: vi.fn(), complete: vi.fn(), places: vi.fn() }));
vi.mock('next/navigation', () => { const router = { push: mocks.push, replace: mocks.replace }; return { useRouter: () => router }; });
vi.mock('../../services/api', () => ({ api: { getWelcomeState: mocks.state, startWelcome: mocks.start, saveWelcomeStep: mocks.save, completeWelcome: mocks.complete, searchBirthplaces: mocks.places } }));
const initial: WelcomeState = {
  started: false, completed: false, next_step: 1,
  profile: { full_name: 'Анна', birth_date: null, birth_time: null, birth_location: null },
  portrait: { name: { name: 'Анна', origin: 'Имя древнееврейского происхождения: благодать.', message: 'Принятие и доброта.', verified: true }, number: null, sky: null, summary: 'Анна, первая карта открыта.' },
};
beforeEach(() => {
  vi.clearAllMocks(); window.history.replaceState(null, '', '/auth/onboarding?start=1');
  mocks.state.mockResolvedValue(structuredClone(initial));
  mocks.start.mockResolvedValue({ ...structuredClone(initial), started: true });
  mocks.complete.mockResolvedValue({ ...initial, completed: true });
});
afterEach(cleanup);

it('reveals each result in place, allows unknown time, and enters only after completion saves', async () => {
  let state = structuredClone(initial);
  mocks.save.mockImplementation(async data => {
    state.started = true;
    if (data.step === 'name') { state.profile.full_name = data.full_name; state.next_step = 2; }
    if (data.step === 'birth') { state.profile.birth_date = data.birth_date; state.portrait.number = { value: 3, title: 'Выражение', message: 'Творчество и общение.', formula: '21 = 3' }; state.next_step = 3; }
    if (data.step === 'sky') { state.profile.birth_time = data.birth_time; state.profile.birth_location = data.birth_location; state.portrait.sky = { available: true, sun: ['Козерог'], moon: ['Рыбы', 'Овен'], ascendant: null, note: 'Время неизвестно.', time_known: false }; state.next_step = 4; }
    return structuredClone(state);
  });
  render(<PersonalWelcome />);
  expect(await screen.findByLabelText('Ваше имя')).toHaveValue('Анна');
  fireEvent.click(screen.getByRole('button', { name: /Узнать значение/ }));
  expect(await screen.findByText(/благодать/)).toBeInTheDocument();
  expect(screen.queryByLabelText('Дата рождения')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'К дате рождения' }));
  fireEvent.change(screen.getByLabelText('Дата рождения'), { target: { value: '1990-01-01' } });
  fireEvent.click(screen.getByRole('button', { name: /Открыть моё число/ }));
  expect(await screen.findByText('Творчество и общение.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'К месту рождения' }));
  expect(screen.getByLabelText('Не знаю время')).toBeChecked();
  expect(screen.queryByLabelText('Точное время рождения')).toBeNull();
  mocks.places.mockResolvedValue([{ city: 'Москва', country: 'Россия', latitude: 55.75, longitude: 37.62, label: 'Москва, Россия' }]);
  fireEvent.change(screen.getByLabelText('Город рождения'), { target: { value: 'Москва' } });
  expect(mocks.places).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Найти' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Москва, Россия' }));
  fireEvent.click(screen.getByRole('button', { name: /Раскрыть моё небо/ }));
  expect(await screen.findByText('Нужно время')).toBeInTheDocument();
  expect(mocks.save).toHaveBeenLastCalledWith({ step: 'sky', birth_time: null, birth_location: { city: 'Москва', country: 'Россия', latitude: 55.75, longitude: 37.62 } });
  fireEvent.click(screen.getByRole('button', { name: /Открыть мой портрет/ }));
  expect(await screen.findByText('Анна, первая карта открыта.')).toBeInTheDocument();
  mocks.complete.mockRejectedValueOnce(new Error('offline'));
  fireEvent.click(screen.getByRole('button', { name: /Открыть мой день/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Ваши данные сохранены');
  expect(mocks.push).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /Открыть мой день/ }));
  await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/dashboard'));
});

it('resumes the saved step without asking for name again', async () => {
  mocks.state.mockResolvedValue({ ...initial, started: true, next_step: 3, profile: { ...initial.profile, birth_date: '1990-01-01' } });
  render(<PersonalWelcome />);
  expect(await screen.findByLabelText('Город рождения')).toBeInTheDocument();
  expect(screen.queryByLabelText('Ваше имя')).toBeNull();
  expect(mocks.start).not.toHaveBeenCalled();
});

it('does not replay completed onboarding; the profile portrait remains accessible', async () => {
  mocks.state.mockResolvedValue({ ...initial, started: true, completed: true });
  const first = render(<PersonalWelcome />);
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/dashboard'));
  first.unmount();
  window.history.replaceState(null, '', '/auth/onboarding?view=portrait');
  render(<PersonalWelcome />);
  expect(await screen.findByText('Анна, первая карта открыта.')).toBeInTheDocument();
  expect(screen.queryByLabelText('Ваше имя')).toBeNull();
});

it('keeps input and offers retry if saving fails', async () => {
  mocks.save.mockRejectedValue(new Error('Сеть недоступна'));
  render(<PersonalWelcome />);
  const input = await screen.findByLabelText('Ваше имя');
  fireEvent.change(input, { target: { value: 'Александр' } });
  fireEvent.click(screen.getByRole('button', { name: /Узнать значение/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Сеть недоступна');
  expect(input).toHaveValue('Александр');
  expect(screen.getByRole('button', { name: /Узнать значение/ })).toBeEnabled();
});


it('sends an unauthenticated visitor to login instead of leaving a loading screen', async () => {
  mocks.state.mockRejectedValueOnce(new Error('Not authenticated'));
  render(<PersonalWelcome />);
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/auth/login'));
});
