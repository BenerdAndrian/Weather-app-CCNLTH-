import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSavedCity, deleteSavedCity, fetchSavedCities } from '../api/weatherApi';
import { queryKeys } from './queryKeys';

// Server state: the list of saved cities stored in SQLite by the backend.
export function useSavedCities() {
  return useQuery({
    queryKey: queryKeys.savedCities,
    queryFn: fetchSavedCities,
  });
}

// Mutation: save a city. Optimistic update with rollback:
// 1. onMutate  - show the city in the list immediately (marked pending)
// 2. onError   - the server refused (e.g. unknown city): restore the old list
// 3. onSettled - success or not, refetch the list so the cache matches the
//                database (real id, resolved address)
export function useAddCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSavedCity,
    onMutate: async (name) => {
      // Stop in-flight refetches so they cannot overwrite the optimistic list.
      await queryClient.cancelQueries({ queryKey: queryKeys.savedCities });
      const previous = queryClient.getQueryData(queryKeys.savedCities);
      const optimisticCity = { id: `temp-${Date.now()}`, name, address: name, pending: true };
      queryClient.setQueryData(queryKeys.savedCities, (old = []) => [optimisticCity, ...old]);
      return { previous };
    },
    onError: (error, name, context) => {
      queryClient.setQueryData(queryKeys.savedCities, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.savedCities }),
  });
}

// Mutation: remove a saved city, same optimistic pattern.
export function useDeleteCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedCity,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.savedCities });
      const previous = queryClient.getQueryData(queryKeys.savedCities);
      queryClient.setQueryData(queryKeys.savedCities, (old = []) => old.filter((city) => city.id !== id));
      return { previous };
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(queryKeys.savedCities, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.savedCities }),
  });
}
