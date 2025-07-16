import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmRegistration } from '@/lib/auth';
import Image from 'next/image';
import { useCognitoError } from '@/hooks/useCognitoError';

export const ConfirmSignUpForm = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { getErrorMessage } = useCognitoError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await confirmRegistration(email, code);
      
      if (result.isSignUpComplete) {
        setSuccess('Account confirmed successfully! Redirecting to login...');
        setTimeout(() => router.push('/auth/sign-in'), 1500);
      }
    } catch (err: unknown) {
      console.error('Error confirming registration:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt=""
              width={100}
              height={100}
              className="h-16 md:h-18 w-auto"
            />
          </div>
          
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
            Confirm your account
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative mt-4">
              <input
                type="email"
                id="email"
                name="email"
                className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-600"
                placeholder="Email address"
                autoComplete="email"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Confirm account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 
