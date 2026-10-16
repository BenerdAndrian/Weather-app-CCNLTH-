import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { SettingsProvider } from '../settings/SettingsProvider';

// Fresh cache per test, no retries so error states show immediately.
export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

// Writes the current path into the DOM so tests can check navigation.
function LocationDisplay() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

// Uses MemoryRouter: the data router's fetch-based navigation does not work
// with jsdom's AbortSignal.
export function renderRoute(routes, initialEntry, queryClient = createTestQueryClient()) {
  const result = render(
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            {routes.map(({ path, element }) => <Route key={path} path={path} element={element} />)}
          </Routes>
          <LocationDisplay />
        </MemoryRouter>
      </SettingsProvider>
    </QueryClientProvider>,
  );
  return { ...result, queryClient };
}
export function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

// Replaces window.fetch. `handler(url, options)` returns a jsonResponse.
export function mockFetch(handler) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options = {}) => handler(String(url), options));
}

export const sampleForecast = {
  address: 'hue',
  resolvedAddress: 'Huế, Việt Nam',
  latitude: 16.46,
  longitude: 107.59,
  timezone: 'Asia/Bangkok',
  current: {
    datetimeEpoch: 1792114200,
    temp: 30,
    feelslike: 34,
    humidity: 70,
    precipprob: 20,
    windspeed: 10,
    pressure: 1010,
    visibility: 10,
    uvindex: 6,
    sunset: '17:30:00',
    icon: 'rain',
  },
  days: [
    {
      datetime: '2026-10-16',
      temp: 29,
      tempmax: 32,
      tempmin: 25,
      precipprob: 40,
      icon: 'rain',
      hours: [
        { datetime: '06:00:00', temp: 25, icon: 'rain' },
        { datetime: '12:00:00', temp: 31, icon: 'cloudy' },
      ],
    },
  ],
};
