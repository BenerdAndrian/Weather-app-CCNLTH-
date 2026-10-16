import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data counts as "fresh" for 1 minute: no refetch while fresh.
        staleTime: 60 * 1000,
        // Cache entries nobody uses are removed after 30 minutes.
        gcTime: 30 * 60 * 1000,
        // Retry network/server errors twice, but never 4xx errors
        // (an unknown city will not become valid by retrying).
        retry: (failureCount, error) => {
          if (error?.status >= 400 && error?.status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}
