'use client';

import { fetchAuthSession } from '@aws-amplify/auth';

/**
 * Obtiene el token JWT del usuario autenticado
 * @returns Promise<string | null> - Token JWT o null si no está autenticado
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    
    if (session.tokens?.accessToken) {
      return session.tokens.accessToken.toString();
    }
    
    if (session.tokens?.idToken) {
      return session.tokens.idToken.toString();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Obtiene el token JWT sincrónicamente desde localStorage/sessionStorage
 * Nota: Esta es una función de respaldo, se recomienda usar getAuthToken() cuando sea posible
 * @returns string | null - Token JWT o null si no se encuentra
 */
export function getAuthTokenSync(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Buscar tokens de Amplify en localStorage
    const keys = Object.keys(localStorage);
    const amplifyKeys = keys.filter(key => 
      key.includes('amplify') && 
      (key.includes('accessToken') || key.includes('idToken'))
    );
    
    // Intentar obtener el token más reciente
    for (const key of amplifyKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === 'string' && parsed.startsWith('eyJ')) {
            return parsed;
          } else if (parsed?.payload && typeof parsed.payload === 'string') {
            return parsed.payload;
          }
        } catch {
          // Si no es JSON válido, podría ser el token directamente
          if (value.startsWith('eyJ')) {
            return value;
          }
        }
      }
    }
    
    // Buscar en sessionStorage como respaldo
    const sessionKeys = Object.keys(sessionStorage);
    const sessionAmplifyKeys = sessionKeys.filter(key => 
      key.includes('amplify') && 
      (key.includes('accessToken') || key.includes('idToken'))
    );
    
    for (const key of sessionAmplifyKeys) {
      const value = sessionStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === 'string' && parsed.startsWith('eyJ')) {
            return parsed;
          } else if (parsed?.payload && typeof parsed.payload === 'string') {
            return parsed.payload;
          }
        } catch {
          if (value.startsWith('eyJ')) {
            return value;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting auth token sync:', error);
    return null;
  }
}

/**
 * Verifica si un token JWT está expirado
 * @param token - Token JWT
 * @returns boolean - true si está expirado, false si es válido
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // Considerar expirado si no se puede parsear
  }
}

/**
 * Obtiene un token válido (no expirado)
 * @returns Promise<string | null> - Token válido o null
 */
export async function getValidAuthToken(): Promise<string | null> {
  // Primero intentar obtener token fresco de Amplify
  const freshToken = await getAuthToken();
  if (freshToken && !isTokenExpired(freshToken)) {
    return freshToken;
  }
  
  // Como respaldo, verificar token síncrono
  const syncToken = getAuthTokenSync();
  if (syncToken && !isTokenExpired(syncToken)) {
    return syncToken;
  }
  
  return null;
}
