import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestQueryClient, jsonResponse, mockFetch } from '../test/utils';
import { useAddCity, useDeleteCity } from './cityQueries';
import { queryKeys } from './queryKeys';

const HUE = { id: 1, name: 'Hue', address: 'Huế, Việt Nam' };
const HANOI = { id: 2, name: 'Hanoi', address: 'Hà Nội, Việt Nam' };

function setup(hook) {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(queryKeys.savedCities, [HUE, HANOI]);
  const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const { result } = renderHook(hook, { wrapper });
  const cachedNames = () => queryClient.getQueryData(queryKeys.savedCities).map((c) => c.name);
  return { queryClient, result, cachedNames };
}

// A promise we resolve by hand, to look at the cache while the request is in flight.
function deferred() {
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  return { promise, resolve };
}

describe('useDeleteCity', () => {
  it('removes the city from the cache before the server answers, then invalidates the list', async () => {
    const server = deferred();
    mockFetch((url, options) => (options.method === 'DELETE' ? server.promise : jsonResponse([HANOI])));
    const { result, queryClient, cachedNames } = setup(() => useDeleteCity());

    act(() => result.current.mutate(1));
    await waitFor(() => expect(cachedNames()).toEqual(['Hanoi'])); // optimistic
    expect(queryClient.getQueryState(queryKeys.savedCities).isInvalidated).toBe(false);

    server.resolve(jsonResponse(null, 204));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // onSettled marked ['saved-cities'] stale. Components using the list
    // refetch it immediately; here no component uses it, so it is only marked.
    expect(queryClient.getQueryState(queryKeys.savedCities).isInvalidated).toBe(true);
  });

  it('rolls back when the server fails', async () => {
    mockFetch((url, options) =>
      options.method === 'DELETE'
        ? jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'boom' } }, 500)
        : jsonResponse([HUE, HANOI]),
    );
    const { result, cachedNames } = setup(() => useDeleteCity());

    act(() => result.current.mutate(1));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(cachedNames()).toEqual(['Hue', 'Hanoi']);
    expect(result.current.error.message).toBe('boom');
  });
});

describe('useAddCity', () => {
  it('shows the new city as pending, then rolls back an unknown city', async () => {
    const server = deferred();
    mockFetch((url, options) => (options.method === 'POST' ? server.promise : jsonResponse([HUE, HANOI])));
    const { result, queryClient, cachedNames } = setup(() => useAddCity());

    act(() => result.current.mutate('Atlantis'));
    await waitFor(() => expect(cachedNames()).toEqual(['Atlantis', 'Hue', 'Hanoi']));
    expect(queryClient.getQueryData(queryKeys.savedCities)[0].pending).toBe(true);

    server.resolve(jsonResponse({ error: { code: 'CITY_NOT_FOUND', message: 'No weather data found for "Atlantis".' } }, 404));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(cachedNames()).toEqual(['Hue', 'Hanoi']);
    expect(result.current.error.code).toBe('CITY_NOT_FOUND');
  });
});
