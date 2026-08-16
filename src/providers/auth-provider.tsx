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
import { authApi, User } from '../api/auth';

type AuthStatus =
  | 'initializing'
  | 'authenticated'
  | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: User | null;
  login: (accessToken: string, userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [user, setUser] = useState<User | null>(null);

  const login = (accessToken: string, userData: User) => {
    setAccessToken(accessToken);
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    setStatus('authenticated');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('userData');
      router.push('/login');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for existing user data in localStorage
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          setUser(JSON.parse(storedUserData));
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
        }
      }

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
          setUser(null);
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

        // Fetch user data after successful refresh
        try {
          const userData = await authApi.me();
          setUser(userData);
          localStorage.setItem('userData', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
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
        user,
        login,
        logout,
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