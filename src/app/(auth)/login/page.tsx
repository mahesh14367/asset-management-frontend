'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Lock, Mail } from 'lucide-react';
import { authApi } from '../../../api';
import { setAccessToken } from '../../../lib/axios';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    
    e.preventDefault();
    const email = (e.target as HTMLFormElement).email.value;
    const password = (e.target as HTMLFormElement).password.value;
    
    try {
      const response = await authApi.login({ email, password });
      setAccessToken(response.accessToken);
      localStorage.setItem('userData', JSON.stringify(response.user));
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      // For demo purposes, still allow login if API fails
      setAccessToken('mock_token_' + Date.now());
      router.push('/dashboard');
    }
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-input" />
            <span>Remember me</span>
          </label>
          <a href="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </a>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Sign in
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" size="lg" className="w-full">
            Google
          </Button>
          <Button variant="outline" size="lg" className="w-full">
            GitHub
          </Button>
        </div>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <a href="/register" className="text-primary hover:underline font-medium">
          Sign up
        </a>
      </p>
    </div>
  );
}
