import { apiFetch } from './client';

export function fetchWeather(city) {
  return apiFetch(`/api/weather/${encodeURIComponent(city)}`);
}

export function fetchSavedCities() {
  return apiFetch('/api/cities');
}

export function createSavedCity(name) {
  return apiFetch('/api/cities', { method: 'POST', body: JSON.stringify({ name }) });
}

export function deleteSavedCity(id) {
  return apiFetch(`/api/cities/${id}`, { method: 'DELETE' });
}
