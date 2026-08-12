'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '../ui/loading-spinner';
import { getAccessToken } from '../../lib/axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication using the in-memory token store
    const token = getAccessToken();
    const authenticated = !!token;
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      router.push('/login');
    }
  }, [router]);

  // Show loading while checking auth to avoid hydration mismatch
  if (isAuthenticated === null) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
