'use client'

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';

const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Obtener la URL de redirección desde los parámetros de búsqueda
  const redirectTo = searchParams.get('redirect') || '/panel/search';

  const validateForm = () => {
    if (!email || !password) {
      setError('All fields are required');
      return false;
    }
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const result = await login({
        username: email.toLowerCase(),
        password,
      });

      if (result.success) {
        setSuccess('Successfully logged in! Redirecting...');
        // Redirigir a la URL especificada o al dashboard por defecto
        setTimeout(() => router.push(redirectTo), 1000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo.png"
              alt="EDK"
              width={150}
              height={150}
              className="h-24 md:h-24 w-auto"
            />
          </div>
          
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="relative mt-4">
              <input
                type="email"
                id="email"
                name="email"
                className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                placeholder="Email address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
                disabled={isLoading}
              />
              <label
                htmlFor="email"
                className="absolute left-1 px-3 py-1 bg-white pointer-events-none transition-all duration-200 text-gray-600 text-xs -top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-600 peer-focus:text-xs"
                style={{ lineHeight: '1', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
              >
                Email address*
              </label>
            </div>

            <div className="relative mt-4">
              <input
                type="password"
                id="password"
                name="password"
                className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <label
                htmlFor="password"
                className="absolute left-1 px-3 py-1 bg-white pointer-events-none transition-all duration-200 text-gray-600 text-xs -top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-600 peer-focus:text-xs"
                style={{ lineHeight: '1', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
              >
                Password*
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/sign-up"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm; 
