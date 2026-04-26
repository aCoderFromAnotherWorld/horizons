'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function SignUpForm() {
  const router = useRouter();

  const [email,           setEmail]           = useState('');
  const [name,            setName]            = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role,            setRole]            = useState('researcher');
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);
  const [checking,        setChecking]        = useState(true);

  useEffect(() => {
    fetch('/api/auth/get-session', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user && data.user.is_active !== false) {
          router.replace('/dashboard');
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || email, role }),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      router.replace('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 gap-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Register to access the Horizons dashboard</CardDescription>
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
              <Label htmlFor="name">
                Name{' '}
                <span className="text-slate-400 font-normal text-xs">(optional)</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
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
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/dashboard/login" className="text-indigo-600 hover:underline">
          Sign in
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

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
