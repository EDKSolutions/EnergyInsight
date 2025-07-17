"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { SignInInput, SignUpInput, ConfirmSignUpInput } from '@aws-amplify/auth';

interface AuthContextType {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  login: (credentials: SignInInput) => Promise<{ success: boolean; requiresConfirmation?: boolean; requiresPasswordChange?: boolean }>;
  register: (userData: SignUpInput) => Promise<{ success: boolean; requiresConfirmation?: boolean }>;
  confirmRegistration: (confirmationData: ConfirmSignUpInput) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean }>;
  forgotPasswordSubmit: (email: string, code: string, newPassword: string) => Promise<{ success: boolean }>;
  forgotPasswordResendCode: (email: string) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 
