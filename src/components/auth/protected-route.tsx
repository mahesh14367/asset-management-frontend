'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '../ui/loading-spinner';
import { useAuth } from '../../providers/auth-provider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  const {
    status,
    isAuthenticated,
  } = useAuth();

  useEffect(() => {
    if (
      status === 'unauthenticated'
    ) {
      router.replace('/login');
    }
  }, [status, router]);

  // IMPORTANT:
  // Don't redirect while authentication is being restored.
  if (status === 'initializing') {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
