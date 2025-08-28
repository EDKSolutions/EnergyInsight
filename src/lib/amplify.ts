import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

// Verificar que estamos en el lado del cliente
if (typeof window !== 'undefined') {
  // Verificar variables de entorno
  if (!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 
      !process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID) {
    console.error('Missing required environment variables for Cognito configuration');
    console.error('NEXT_PUBLIC_COGNITO_USER_POOL_ID:', process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID);
    console.error('NEXT_PUBLIC_COGNITO_CLIENT_ID:', process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID);
    throw new Error('Missing required environment variables for Cognito configuration');
  }

  // Configuración de Amplify
  const config = {
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        signUpVerificationMethod: 'code' as const,
        loginWith: {
          email: true,
          phone: false,
          username: false
        }
      }
    }
  } as const;

  // Adaptador de almacenamiento compatible con KeyValueStorageInterface
  const storageAdapter = {
    async getItem(key: string): Promise<string | null> {
      try {
        return Promise.resolve(window.localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    },
    async setItem(key: string, value: string): Promise<void> {
      try {
        return Promise.resolve(window.localStorage.setItem(key, value));
      } catch {
        return Promise.resolve();
      }
    },
    async removeItem(key: string): Promise<void> {
      try {
        return Promise.resolve(window.localStorage.removeItem(key));
      } catch {
        return Promise.resolve();
      }
    },
    async clear(): Promise<void> {
      try {
        // Solo limpiar las claves relacionadas con Cognito
        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && (key.includes('Cognito') || key.includes('amplify'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => window.localStorage.removeItem(key));
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    }
  };

  try {
    cognitoUserPoolsTokenProvider.setKeyValueStorage(storageAdapter);
    Amplify.configure(config);
  } catch (error) {
    throw error;
  }
}

export { Amplify }; 
