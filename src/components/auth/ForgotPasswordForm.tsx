import { useState, useEffect } from 'react';
import { resetPassword, confirmResetPassword, resendResetPasswordCode } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useCognitoError } from '@/hooks/useCognitoError';
import Image from 'next/image';

export const ForgotPasswordForm = () => {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const { getErrorMessage } = useCognitoError();

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

  const validatePasswords = () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setStep('confirm');
      setSuccess('Verification code sent to your email');
      setCooldown(120); // 2 minutes cooldown
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting a new code`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resendResetPasswordCode(email);
      setSuccess('New verification code sent to your email');
      setCooldown(120); // 2 minutes cooldown
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePasswords()) {
      return;
    }

    setLoading(true);
    try {
      await confirmResetPassword(email, code, newPassword);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/auth/sign-in'), 1500);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
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
              src="/logo.png"
              alt="EDK"
              width={100}
              height={100}
              className="h-16 md:h-18 w-auto"
            />
          </div>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
            {step === 'request' ? 'Reset your password' : 'Enter verification code'}
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
          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="relative mt-4">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <label
                  htmlFor="email"
                  className="absolute left-1 px-3 py-1 bg-white pointer-events-none transition-all duration-200 text-gray-600 text-xs -top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-600 peer-focus:text-xs"
                  style={{ lineHeight: '1', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
                >
                  Email address*
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div className="relative mt-4">
                <input
                  type="text"
                  id="code"
                  name="code"
                  className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                  placeholder="Verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={loading}
                />
                <label
                  htmlFor="code"
                  className="absolute left-1 px-3 py-1 bg-white pointer-events-none transition-all duration-200 text-gray-600 text-xs -top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-600 peer-focus:text-xs"
                  style={{ lineHeight: '1', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
                >
                  Verification code*
                </label>
              </div>

              <div className="relative mt-4">
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <label
                  htmlFor="newPassword"
                  className="absolute left-1 px-3 py-1 bg-white pointer-events-none transition-all duration-200 text-gray-600 text-xs -top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-600 peer-focus:text-xs"
                  style={{ lineHeight: '1', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
                >
                  New password*
                </label>
              </div>

              <div className="relative mt-4">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-1 px-3 py-1 bg-white pointer-events-none transition-all duration-200 text-gray-600 text-xs -top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-600 peer-focus:text-xs"
                  style={{ lineHeight: '1', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
                >
                  Confirm new password*
                </label>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading || cooldown > 0}
                  className="w-full flex justify-center py-4 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {cooldown > 0
                    ? `Resend code in ${formatTime(cooldown)}`
                    : 'Resend verification code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}; 
