'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  getAccessToken,
  setAccessToken,
} from '../lib/axios';

type AuthStatus =
  | 'initializing'
  | 'authenticated'
  | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] =
    useState<AuthStatus>('initializing');

  useEffect(() => {
    const initializeAuth = async () => {
      // Already authenticated in this browser session
      if (getAccessToken()) {
        setStatus('authenticated');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          setAccessToken(null);
          localStorage.removeItem('userData');
          setStatus('unauthenticated');
          return;
        }

        const data = await response.json();

        const accessToken = data?.data?.accessToken;

        if (!accessToken) {
          setStatus('unauthenticated');
          return;
        }

        setAccessToken(accessToken);
        setStatus('authenticated');
      } catch (error) {
        console.error(
          'Authentication initialization failed:',
          error
        );

        // Network error != authentication failure.
        // You may choose a dedicated "offline" state later.
        setStatus('unauthenticated');
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        isAuthenticated: status === 'authenticated',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}