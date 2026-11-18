import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ClarifyButton } from './ClarifyButton';
const mocks = vi.hoisted(() => ({ get: vi.fn(), explain: vi.fn() }));
vi.mock('../services/api', () => ({ api: { getResultExplanation: mocks.get, explainResult: mocks.explain } }));
const id = '11111111-1111-4111-8111-111111111111';
const ready = { available: true, reason: 'ready', answer: null, clarification: null, can_clarify: false };
beforeEach(() => { vi.clearAllMocks(); mocks.get.mockResolvedValue(ready); });
afterEach(cleanup);
const component = () => <ClarifyButton contextType="tarot" contextData={{ reading_id: id, cards: ['FORGED CLIENT CONTEXT'] }} />;
it('sends only a stored result identifier and allows one bounded followup', async () => {
  mocks.explain.mockResolvedValueOnce({ ...ready, answer: 'Первое пояснение.', can_clarify: true })
    .mockResolvedValueOnce({ ...ready, answer: 'Первое пояснение.', clarification: { question: 'Почему эта карта?', answer: 'Уточнение.' }, can_clarify: false });
  render(component());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Разъяснить' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Разъяснить' }));
  await screen.findByText('Первое пояснение.');
  expect(mocks.explain).toHaveBeenCalledWith('tarot', id, undefined);
  fireEvent.click(screen.getByRole('button', { name: 'Можно уточнить?' }));
  fireEvent.change(screen.getByLabelText('Что в этом результате разъяснить подробнее?'), { target: { value: 'Почему эта карта?' } });
  fireEvent.click(screen.getByRole('button', { name: 'Уточнить' }));
  await screen.findByText('Уточнение.');
  expect(mocks.explain).toHaveBeenLastCalledWith('tarot', id, 'Почему эта карта?');
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Можно уточнить?' })).toBeNull();
});
it('does not call a provider or open a chat when not configured', async () => {
  mocks.get.mockResolvedValue({ ...ready, available: false, reason: 'not_configured' });
  render(component());
  expect(await screen.findByText(/пока недоступны/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Разъяснить' })).toBeDisabled();
  expect(screen.queryByRole('textbox')).toBeNull();
  mocks.explain.mockClear(); expect(mocks.explain).not.toHaveBeenCalled();
});
it('does not send unpersisted or unsupported context', () => {
  const { container } = render(<ClarifyButton contextType="runes" contextData={{ runes: [] }} />);
  expect(container).toBeEmptyDOMElement(); expect(mocks.get).not.toHaveBeenCalled();
});
it('ignores a late response after the displayed result changes', async () => {
  let resolve!: (value: unknown) => void;
  mocks.explain.mockImplementation(() => new Promise(done => { resolve = done; }));
  const view = render(component());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Разъяснить' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Разъяснить' }));
  view.rerender(<ClarifyButton contextType="tarot" contextData={{ reading_id: '22222222-2222-4222-8222-222222222222' }} />);
  await act(async () => resolve({ ...ready, answer: 'Ответ от старого результата' }));
  expect(screen.queryByText('Ответ от старого результата')).toBeNull();
});
it('reopens a saved response without another paid generation', async () => {
  mocks.get.mockResolvedValue({ ...ready, answer: 'Сохранённое пояснение', can_clarify: true });
  render(component());
  expect(await screen.findByText('Сохранённое пояснение')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Разъяснить' })).toBeNull();
  expect(mocks.explain).not.toHaveBeenCalled();
});
