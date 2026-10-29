import { HttpError } from '../errors.js';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// Searches Vietnamese place names and returns only fields the frontend needs.
export function createCitySuggestionService({ fetchImpl = fetch, timeoutMs = 8_000 } = {}) {
  async function suggest(query) {
    const url = new URL(GEOCODING_URL);
    url.searchParams.set('name', query);
    url.searchParams.set('count', '8');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');
    url.searchParams.set('countryCode', 'VN');

    let response;
    try {
      response = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
    } catch {
      throw new HttpError(502, 'CITY_SEARCH_UNAVAILABLE', 'City search provider could not be reached.');
    }

    if (!response.ok) {
      throw new HttpError(502, 'CITY_SEARCH_ERROR', 'City search provider returned an error.');
    }

    let body;
    try {
      body = await response.json();
    } catch {
      throw new HttpError(502, 'CITY_SEARCH_ERROR', 'City search provider returned invalid data.');
    }

    return (body.results ?? [])
      .filter((place) => place.country_code === 'VN')
      .map((place) => {
        const displayParts = [place.name, place.admin1, place.country]
          .filter(Boolean)
          .filter((part, index, parts) => parts.indexOf(part) === index);
        return {
          id: place.id,
          name: place.name,
          admin1: place.admin1 ?? '',
          country: place.country ?? '',
          countryCode: place.country_code ?? '',
          latitude: place.latitude,
          longitude: place.longitude,
          timezone: place.timezone,
          location: displayParts.join(', '),
          displayName: displayParts.join(', '),
        };
      });
  }

  return { suggest };
}
