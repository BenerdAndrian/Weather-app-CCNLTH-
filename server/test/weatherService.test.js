import { describe, expect, it, vi } from 'vitest';
import { createWeatherService, toForecast } from '../src/services/weatherService.js';

const upstreamPayload = {
  address: 'hanoi',
  resolvedAddress: 'Hà Nội, Việt Nam',
  latitude: 21.03,
  longitude: 105.85,
  timezone: 'Asia/Bangkok',
  description: 'not needed by the UI',
  currentConditions: { temp: 30, feelslike: 35, icon: 'rain', solarradiation: 1 },
  days: Array.from({ length: 15 }, (_, i) => ({
    datetime: `2026-10-${10 + i}`,
    temp: 28,
    icon: 'cloudy',
    hours: [{ datetime: '06:00:00', temp: 25, icon: 'rain', dew: 1 }],
  })),
};

function fakeFetch(status, body = {}) {
  return vi.fn().mockResolvedValue({ status, ok: status >= 200 && status < 300, json: async () => body });
}

describe('toForecast', () => {
  it('keeps only the fields the UI uses and at most 7 days', () => {
    const forecast = toForecast(upstreamPayload);
    expect(forecast.days).toHaveLength(7);
    expect(forecast.current).not.toHaveProperty('solarradiation');
    expect(forecast.days[0].hours[0]).toEqual({ datetime: '06:00:00', temp: 25, icon: 'rain' });
    expect(forecast).not.toHaveProperty('description');
  });
});

describe('weatherService.getForecast', () => {
  it('calls the provider with metric units and an encoded city', async () => {
    const fetchImpl = fakeFetch(200, upstreamPayload);
    const service = createWeatherService({ apiKey: 'k', fetchImpl });
    await service.getForecast('Ho Chi Minh');
    const url = fetchImpl.mock.calls[0][0];
    expect(url).toContain('/Ho%20Chi%20Minh?');
    expect(url).toContain('unitGroup=metric');
  });

  it.each([
    [400, 404, 'CITY_NOT_FOUND'],
    [429, 503, 'UPSTREAM_RATE_LIMITED'],
    [500, 502, 'UPSTREAM_ERROR'],
  ])('maps upstream %i to %i %s', async (upstream, status, code) => {
    const service = createWeatherService({ apiKey: 'k', fetchImpl: fakeFetch(upstream) });
    await expect(service.getForecast('x')).rejects.toMatchObject({ status, code });
  });

  it('reports network failures as 502', async () => {
    const service = createWeatherService({ apiKey: 'k', fetchImpl: vi.fn().mockRejectedValue(new Error('offline')) });
    await expect(service.getForecast('x')).rejects.toMatchObject({ status: 502, code: 'UPSTREAM_UNAVAILABLE' });
  });

  it('fails clearly when the API key is missing', async () => {
    const service = createWeatherService({ apiKey: '', fetchImpl: fakeFetch(200) });
    await expect(service.getForecast('x')).rejects.toMatchObject({ code: 'MISSING_API_KEY' });
  });
});
