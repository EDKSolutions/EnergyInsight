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
  isLoadingLogin: boolean;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  login: (credentials: SignInInput) => Promise<{ success: boolean; requiresConfirmation?: boolean; requiresPasswordChange?: boolean; message?: string }>;
  register: (userData: SignUpInput) => Promise<{ success: boolean; requiresConfirmation?: boolean; message?: string }>;
  confirmRegistration: (confirmationData: ConfirmSignUpInput) => Promise<{ success: boolean; message?: string }>;
  resendSignUpCode: (username: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  forgotPasswordSubmit: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  forgotPasswordResendCode: (email: string) => Promise<{ success: boolean; message?: string }>;
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
