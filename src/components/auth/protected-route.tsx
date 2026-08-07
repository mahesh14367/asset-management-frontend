'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '../ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const authenticated = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');

  useEffect(() => {
    if (!authenticated) {
      router.push('/login');
    }
  }, [authenticated, router]);

  if (!authenticated) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
