import { useQuery } from '@tanstack/react-query';
import { suggestCities } from '../api/citiesApi';
import { normalizeCity, queryKeys } from './queryKeys';

export function useCitySuggestions(query) {
  const normalizedQuery = normalizeCity(query ?? '');
  return useQuery({
    queryKey: queryKeys.citySuggestions(normalizedQuery),
    queryFn: ({ signal }) => suggestCities(query, { signal }),
    enabled: normalizedQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}
