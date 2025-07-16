"use client";

import { useEffect } from 'react';
import '@/lib/amplify';

interface AmplifyProviderProps {
  children: React.ReactNode;
}

export const AmplifyProvider = ({ children }: AmplifyProviderProps) => {
  useEffect(() => {
    // La configuración se ejecuta automáticamente al importar el archivo
    console.log('Amplify configuration loaded');

    // Función de limpieza cuando el componente se desmonte
    return () => {
      console.log('AmplifyProvider unmounting');
    };
  }, []);

  return <>{children}</>;
}; 
