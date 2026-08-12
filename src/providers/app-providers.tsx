// src/providers/app-providers.tsx
'use client'; // Redux + React Query providers must be client components

import { useState, useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from '../store';
import { Toaster } from 'sonner';
import { setAuthFailureHandler } from '../lib/axios';
import { useRouter } from 'next/navigation';
import { AuthProvider } from './auth-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
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

  // Set up auth failure handler
  useEffect(() => {
    setAuthFailureHandler(() => {
      localStorage.removeItem('userData');
      router.push('/login');
    });
  }, [router]);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>

        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ReduxProvider>
  );
}