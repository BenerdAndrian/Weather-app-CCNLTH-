// Every piece of server state has one query key. TanStack Query caches by
// key, so ['weather', 'hanoi'] and ['weather', 'hue'] are separate entries,
// and every component asking for the same key shares one cache entry.
export const queryKeys = {
  weather: (city) => ['weather', normalizeCity(city)],
  savedCities: ['saved-cities'],
};

// "Hanoi", " hanoi " and "HANOI" must hit the same cache entry.
export function normalizeCity(city) {
  return city.trim().replace(/\s+/g, ' ').toLowerCase();
}
