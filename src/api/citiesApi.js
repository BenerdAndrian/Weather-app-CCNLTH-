import { apiFetch } from './client';

export function suggestCities(query, { signal } = {}) {
  return apiFetch(`/api/cities/suggestions?q=${encodeURIComponent(query)}`, { signal });
}
