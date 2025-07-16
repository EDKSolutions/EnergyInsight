'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';

export const SignInForm = () => {
  const router = useRouter();
  const { login, isLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [isEmailConfirmation, setIsEmailConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email address is required');
      return;
    }

    try {
      if (authMethod === 'otp') {
        // Para OTP, necesitarías implementar una función específica en el hook
        // Por ahora, usaremos el login normal
        const result = await login({ username: email });
        if (result.success) {
          setSuccess(true);
          setTimeout(() => router.push('/dashboard'), 1000);
        } else if (result.requiresConfirmation) {
          setShowConfirmation(true);
          setIsEmailConfirmation(true);
        }
      } else {
        const result = await login({ username: email.toLowerCase(), password });
        if (result.success) {
          setSuccess(true);
          setTimeout(() => router.push('/dashboard'), 1000);
        } else if (result.requiresConfirmation) {
          setShowConfirmation(true);
          setIsEmailConfirmation(false);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isEmailConfirmation) {
        // Para confirmación de email, necesitarías implementar una función específica
        setError('Email confirmation not implemented yet');
      } else {
        // Confirmar registro
        // Necesitarías implementar confirmRegistration en el hook
        setError('Registration confirmation not implemented yet');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during confirmation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="EDK"
              width={150}
              height={150}
              className="h-24 md:h-24 w-auto"
            />
          </div>
          
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
            {showConfirmation ? 'Verify your account' : 'Sign in'}
          </h2>

          {!showConfirmation ? (
            <>
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setAuthMethod('password')}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${authMethod === 'password'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    Use Password
                  </button>
                  <button
                    onClick={() => setAuthMethod('otp')}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${authMethod === 'otp'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    Use Email Code
                  </button>
                </nav>
              </div>

              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="relative mt-4">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                    placeholder="Correo electrónico"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-1 px-3 py-1 bg-white pointer-events-none transition-all duration-200 text-gray-600 text-xs -top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-600 peer-focus:text-xs"
                    style={{ lineHeight: '1', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
                  >
                    Email address*
                  </label>
                </div>

                {authMethod === 'password' && (
                  <>
                    <div className="relative mt-4">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <label
                        htmlFor="password"
                        className="absolute left-1 px-3 py-1 bg-white pointer-events-none transition-all duration-200 text-gray-600 text-xs -top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-600 peer-focus:text-xs"
                        style={{ lineHeight: '1', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
                      >
                        Password*
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  </>
                )}

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Loading...' : 'Sign in'}
                  </button>
                </div>
                {!showConfirmation && (
                  <p className="text-center text-sm text-gray-600 mb-6">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/sign-up" className="font-medium text-primary hover:text-blue-500">
                      Sign up
                    </Link>
                  </p>
                )}
              </form>
            </>
          ) : (
            <form className="space-y-6" onSubmit={handleConfirmation}>
              <div className="relative mt-4">
                <input
                  id="confirmationCode"
                  name="confirmationCode"
                  type="text"
                  required
                  className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                  placeholder="Code verification*"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                />
                <label
                  htmlFor="confirmationCode"
                  className="absolute left-1 px-1 py-1 bg-white pointer-events-none transition-all duration-200 text-gray-600 text-xs -top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-600 peer-focus:text-xs"
                  style={{ lineHeight: '1', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
                >
                  Code verification*
                </label>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : success ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Redirecting...
                    </>
                  ) : 'Verify code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}; 
