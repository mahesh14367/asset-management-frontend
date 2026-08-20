'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../../api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess(true);
    } catch (error: any) {
      console.error('Reset password failed:', error);
      setError(error?.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Invalid reset link</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <Button variant="ghost" size="lg" className="w-full" onClick={() => router.push('/forgot-password')}>
          Request new reset link
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <CheckCircle2 className="size-16 text-green-600 mx-auto" />
          <h1 className="text-3xl font-bold tracking-tight">Password reset successful</h1>
          <p className="text-muted-foreground">
            Your password has been reset. You can now log in with your new password.
          </p>
        </div>

        <Button size="lg" className="w-full" onClick={() => router.push('/login')}>
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Set new password</h1>
        <p className="text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset password'}
        </Button>

        <Button type="button" variant="ghost" size="lg" className="w-full" onClick={() => router.push('/login')}>
          <ArrowLeft className="mr-2 size-4" />
          Back to login
        </Button>
      </form>
    </div>
  );
}
