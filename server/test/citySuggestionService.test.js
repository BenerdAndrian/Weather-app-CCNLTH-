import { describe, expect, it, vi } from 'vitest';
import { createCitySuggestionService } from '../src/services/citySuggestionService.js';

function response(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe('city suggestion service', () => {
  it('requests a bounded result set for Vietnam and returns only Vietnamese locations', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ results: [
      { id: 1, name: 'Đà Nẵng', admin1: 'Da Nang', country: 'Vietnam', country_code: 'VN', latitude: 16, longitude: 108 },
      { id: 2, name: 'Hanoi', country: 'Vietnam', country_code: 'VN', latitude: 21, longitude: 105 },
      { id: 3, name: 'Hanoi', country: 'United States', country_code: 'US', latitude: 42, longitude: -71 },
    ] }));
    const service = createCitySuggestionService({ fetchImpl });

    const result = await service.suggest('Đà Nẵng');

    const url = new URL(fetchImpl.mock.calls[0][0]);
    expect(url.searchParams.get('name')).toBe('Đà Nẵng');
    expect(url.searchParams.get('countryCode')).toBe('VN');
    expect(url.searchParams.get('count')).toBe('8');
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ name: 'Đà Nẵng', countryCode: 'VN', displayName: 'Đà Nẵng, Da Nang, Vietnam' });
  });

  it('maps provider failures to a stable API error', async () => {
    const service = createCitySuggestionService({ fetchImpl: vi.fn().mockResolvedValue(response({}, 503)) });
    await expect(service.suggest('Hanoi')).rejects.toMatchObject({ status: 502, code: 'CITY_SEARCH_ERROR' });
  });

  it('maps network errors to a stable API error', async () => {
    const service = createCitySuggestionService({ fetchImpl: vi.fn().mockRejectedValue(new Error('offline')) });
    await expect(service.suggest('Hanoi')).rejects.toMatchObject({ status: 502, code: 'CITY_SEARCH_UNAVAILABLE' });
  });

  it('rejects malformed provider payloads instead of leaking a server error', async () => {
    const service = createCitySuggestionService({ fetchImpl: vi.fn().mockResolvedValue(response(null)) });
    await expect(service.suggest('Hanoi')).rejects.toMatchObject({ status: 502, code: 'CITY_SEARCH_ERROR' });
  });
});
