import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import WeatherSection from './Weather';
import AirConditionDetailPage from './AirConditionDetail';
import { jsonResponse, mockFetch, renderRoute, sampleForecast } from '../test/utils';

const routes = [
  { path: '/weather/:city', element: <WeatherSection /> },
  { path: '/weather/:city/air-conditions', element: <AirConditionDetailPage /> },
];

function weatherCalls(fetchMock) {
  return fetchMock.mock.calls.filter(([url]) => url.includes('/api/weather/'));
}

describe('Weather page', () => {
  it('shows loading, then the forecast for the city in the URL', async () => {
    const fetchMock = mockFetch((url) =>
      url.includes('/api/weather/') ? jsonResponse(sampleForecast) : jsonResponse([]),
    );
    renderRoute(routes, '/weather/Hue');

    expect(screen.getByText(/Fetching Data/)).toBeTruthy();
    expect(await screen.findByText('Huế, Việt Nam')).toBeTruthy();
    // default unit is Fahrenheit: 30 °C -> 86°
    expect(screen.getByText('86°')).toBeTruthy();
    expect(weatherCalls(fetchMock)[0][0]).toBe('/api/weather/Hue');
  });

  it('shows a not-found message for an unknown city', async () => {
    mockFetch((url) =>
      url.includes('/api/weather/')
        ? jsonResponse({ error: { code: 'CITY_NOT_FOUND', message: 'No weather data found for "Atlantis".' } }, 404)
        : jsonResponse([]),
    );
    renderRoute(routes, '/weather/Atlantis');
    expect(await screen.findByText('City not found')).toBeTruthy();
    expect(screen.getByText(/No weather data found/)).toBeTruthy();
  });

  it('reuses the cached forecast on the air-conditions page (no second request)', async () => {
    const fetchMock = mockFetch((url) =>
      url.includes('/api/weather/') ? jsonResponse(sampleForecast) : jsonResponse([]),
    );
    renderRoute(routes, '/weather/Hue');
    await screen.findByText('Huế, Việt Nam');

    fireEvent.click(screen.getByRole('link', { name: /See More/ }));
    expect(await screen.findByText('Air Conditions')).toBeTruthy();
    expect(screen.getByText('Sunset')).toBeTruthy();
    expect(weatherCalls(fetchMock)).toHaveLength(1);
  });

  it('saves the city through the API and marks it as saved', async () => {
    let saved = [];
    const fetchMock = mockFetch((url, options) => {
      if (url.includes('/api/weather/')) return jsonResponse(sampleForecast);
      if (options.method === 'POST') {
        saved = [{ id: 1, name: 'Hue', address: 'Huế, Việt Nam' }];
        return jsonResponse(saved[0], 201);
      }
      return jsonResponse(saved);
    });
    renderRoute(routes, '/weather/Hue');

    fireEvent.click(await screen.findByText('+ Save city'));
    expect(await screen.findByText('Saved ✓')).toBeTruthy();
    const post = fetchMock.mock.calls.find(([, opts = {}]) => opts.method === 'POST');
    expect(JSON.parse(post[1].body)).toEqual({ name: 'Hue' });
  });
});

describe('search', () => {
  it('navigates to the searched city', async () => {
    mockFetch((url) => (url.includes('/api/weather/') ? jsonResponse(sampleForecast) : jsonResponse([])));
    renderRoute(routes, '/weather/Hue');
    await screen.findByText('Huế, Việt Nam');

    const input = screen.getByLabelText('Search For A City');
    fireEvent.change(input, { target: { value: 'Da Nang' } });
    fireEvent.submit(input.closest('form'));
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/weather/Da%20Nang'));
  });
});
