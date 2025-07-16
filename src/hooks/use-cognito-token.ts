import { fetchAuthSession } from '@aws-amplify/auth';
import { useState, useEffect, useCallback } from 'react';

export const useCognitoToken = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = useCallback(async () => {
    try {
      setError(null);
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      
      if (token) {
        setAccessToken(token);
        return token;
      } else {
        setAccessToken(null);
        return null;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      setError('Error al obtener el token de acceso');
      setAccessToken(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    setIsLoading(true);
    return await getAccessToken();
  }, [getAccessToken]);

  useEffect(() => {
    getAccessToken();
  }, [getAccessToken]);

  return {
    accessToken,
    isLoading,
    error,
    getAccessToken,
    refreshToken,
  };
}; 
