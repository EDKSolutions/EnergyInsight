"use client";

import '@/lib/amplify';

interface AmplifyProviderProps {
  children: React.ReactNode;
}

export const AmplifyProvider = ({ children }: AmplifyProviderProps) => {
  return <>{children}</>;
}; 
