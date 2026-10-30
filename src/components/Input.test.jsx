import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InputSection } from './Input';
import { createTestQueryClient, jsonResponse, mockFetch } from '../test/utils';

function renderInput(props = {}) {
  const queryClient = createTestQueryClient();
  const onSubmit = vi.fn();
  render(
    <QueryClientProvider client={queryClient}>
      <InputSection onSubmit={onSubmit} {...props} />
    </QueryClientProvider>,
  );
  return { onSubmit, queryClient };
}

describe('city search suggestions', () => {
  it('shows saved matches before external Vietnamese results and avoids duplicates', async () => {
    const fetchMock = mockFetch((url) => {
      expect(url).toContain('/api/cities/suggestions?q=Ha');
      return jsonResponse([
        { id: 1, name: 'Hanoi', displayName: 'Hanoi, Vietnam' },
        { id: 2, name: 'Ha Tinh', displayName: 'Ha Tinh, Vietnam' },
      ]);
    });
    const { onSubmit } = renderInput({ includeSavedSuggestions: true, savedCities: [{ id: 1, name: 'Hanoi', address: 'Hanoi, Vietnam' }] });
    fireEvent.change(screen.getByRole('textbox', { name: 'Search For A City' }), { target: { value: 'Ha' } });

    await screen.findByRole('option', { name: /Ha Tinh, Vietnam/ });
    const options = screen.getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'Hanoi, VietnamSaved city',
      'Ha Tinh, VietnamVietnam',
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(options[0]);
    expect(onSubmit).toHaveBeenCalledWith('Hanoi');
  });

  it('lets the user select an external location', async () => {
    mockFetch(() => jsonResponse([
      { id: 10, name: 'Đà Nẵng', displayName: 'Đà Nẵng, Da Nang, Vietnam' },
    ]));
    const { onSubmit } = renderInput();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search For A City' }), { target: { value: 'Da Nang' } });

    fireEvent.click(await screen.findByRole('option', { name: /Đà Nẵng, Da Nang, Vietnam/ }));
    expect(onSubmit).toHaveBeenCalledWith('Đà Nẵng, Da Nang, Vietnam');
  });

  it('does not request suggestions until the debounced query has at least two characters', async () => {
    const fetchMock = mockFetch(() => jsonResponse([]));
    renderInput();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search For A City' }), { target: { value: 'H' } });
    await new Promise((resolve) => setTimeout(resolve, 350));
    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled());
  });
});
