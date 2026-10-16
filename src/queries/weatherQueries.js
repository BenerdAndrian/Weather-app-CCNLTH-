import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../api/weatherApi';
import { queryKeys } from './queryKeys';

// Server state: the forecast for one city.
// - Weather changes slowly, so it stays fresh for 10 minutes. Opening the
//   same city again within that time (other page, other card) reads the
//   cache and sends no request.
// - After 10 minutes the data is "stale": it is still shown instantly, and
//   a background refetch replaces it (stale-while-revalidate).
export function useWeather(city) {
  return useQuery({
    queryKey: queryKeys.weather(city ?? ''),
    queryFn: () => fetchWeather(city),
    enabled: Boolean(city),
    staleTime: 10 * 60 * 1000,
  });
}
