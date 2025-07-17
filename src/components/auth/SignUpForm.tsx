'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';

const SignUpForm = () => {
  const router = useRouter();
  const { register, confirmRegistration, isLoading } = useAuthContext();
  const [step, setStep] = useState<'signup' | 'confirm'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const result = await register({
        username: email.toLowerCase(),
        password,
        options: {
          userAttributes: {
            email: email.toLowerCase(),
          }
        }
      });

      if (result.requiresConfirmation) {
        setStep('confirm');
        setSuccess('Verification code sent to your email');
        setCooldown(120); // 2 minutes cooldown
      } else if (result.success) {
        setSuccess('Account created successfully! Redirecting to Sign In...');
        setTimeout(() => router.push('/auth/sign-in'), 1000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting a new code`);
      return;
    }

    setError(null);
    try {
      // Necesitarías implementar resendSignUpCode en el hook
      setError('Resend code functionality not implemented yet');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while resending code');
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await confirmRegistration({
        username: email.toLowerCase(),
        confirmationCode
      });

      if (result.success) {
        setSuccess('Account confirmed successfully! Redirecting to Sign In...');
        setTimeout(() => router.push('/auth/sign-in'), 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during confirmation');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            {step === 'signup' ? 'Registration' : 'Confirm your account'}
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

          {step === 'signup' ? (
            <form onSubmit={handleSignUp} className="space-y-4">
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

              <div className="relative mt-4">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-1 px-3 py-1 bg-white pointer-events-none transition-all duration-200 text-gray-600 text-xs -top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-600 peer-focus:text-xs"
                  style={{ lineHeight: '1', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
                >
                  Confirm password*
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Registering...' : 'Register as Surgeon'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmation} className="space-y-4">
              <div className="relative mt-4">
                <input
                  type="text"
                  id="confirmationCode"
                  name="confirmationCode"
                  className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                  placeholder="Verification code"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <label
                  htmlFor="confirmationCode"
                  className="absolute left-1 px-3 py-1 bg-white pointer-events-none transition-all duration-200 text-gray-600 text-xs -top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-600 peer-focus:text-xs"
                  style={{ lineHeight: '1', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
                >
                  Verification code*
                </label>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Confirming...' : 'Confirm account'}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading || cooldown > 0}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {cooldown > 0
                    ? `Resend code in ${formatTime(cooldown)}`
                    : 'Resend verification code'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/auth/sign-in"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default SignUpForm;
