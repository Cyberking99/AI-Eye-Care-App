import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CACHE_TIME, STALE_TIME, RETRY_ATTEMPTS } from '../services/api/env';

// Create a client with environment-based configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: RETRY_ATTEMPTS,
      staleTime: STALE_TIME,
      gcTime: CACHE_TIME, // formerly cacheTime
    },
    mutations: {
      retry: 1,
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export { queryClient };
