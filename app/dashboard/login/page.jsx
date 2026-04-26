'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const next         = searchParams.get('next') ?? '/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/get-session', { credentials: 'include', cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data?.user && data.user.is_active !== false) {
          router.replace(next);
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router, next]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (res.status === 429) {
        setPassword('');
        setError('Too many failed attempts. Please wait 15 minutes before trying again.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setPassword('');
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      router.replace(next);
    } catch {
      setPassword('');
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 gap-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Horizons Dashboard</CardTitle>
          <CardDescription>Sign in to access researcher data</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="researcher@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/dashboard/signup" className="text-indigo-600 hover:underline">
          Sign up
        </Link>
      </p>
      <Link
        href="/"
        className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        ← Back to Horizons
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
