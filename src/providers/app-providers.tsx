// src/providers/app-providers.tsx
'use client'; // Redux + React Query providers must be client components

import { useState, useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from '../store';
import { Toaster } from 'sonner';
import { setAccessToken, getAccessToken, setAuthFailureHandler } from '../lib/axios';
import { useRouter } from 'next/navigation';

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

  // Attempt token refresh on app boot if no token in memory
  useEffect(() => {
    const refreshOnBoot = async () => {
      // Only attempt refresh if we don't have a token in memory
      if (!getAccessToken()) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data?.data?.accessToken) {
              setAccessToken(data.data.accessToken);
            }
          } else if (response.status === 401) {
            // Only clear auth on 401, not on network errors
            localStorage.removeItem('userData');
            router.push('/login');
          }
        } catch (error) {
          // Network errors should not trigger auth failure - just log and continue
          console.error('Token refresh on boot failed (network error):', error);
        }
      }
    };

    refreshOnBoot();
  }, [router]);

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