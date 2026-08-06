// src/providers/app-providers.tsx
'use client'; // Redux + React Query providers must be client components

import { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from '../store';
import { Toaster } from 'sonner';

export function AppProviders({ children }: { children: React.ReactNode }) {
  // useState ensures one QueryClient per browser session, not shared
  // across requests on the server (important for Next.js SSR correctness)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // 30s — tune per-query later for slow-changing data (e.g. asset categories)
            retry: 1,
          },
        },
      })
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ReduxProvider>
  );
}