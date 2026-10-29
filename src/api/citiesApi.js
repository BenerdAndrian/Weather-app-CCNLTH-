import { apiFetch } from "./client";

export function suggestCities(cityName, { signal } = {}) {
  return apiFetch(`/api/cities/suggestions?q=${encodeURIComponent(cityName)}`, { signal });
}
