'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      router.push('/home');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#0c0b14] p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#2b264a] bg-[#18152b] p-8 shadow-2xl">
        <div className="space-y-2 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-600/30">
            <Sparkles size={20} className="shrink-0" />
          </div>
          <h1 className="text-xl font-bold text-[#f5f6fa]">Sign in to BugTracker</h1>
          <p className="text-[13px] text-[#9fa1b8]">Enter your credentials to access the workspace</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            icon={Mail}
            placeholder="developer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" loading={loading} className="mt-2 w-full">
            Sign In
          </Button>
        </form>

        <div className="border-t border-[#211c3a] pt-4 text-center">
          <p className="text-[13px] text-[#656185]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-violet-400 hover:text-violet-300">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
