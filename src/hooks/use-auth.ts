import { 
  signIn, 
  signUp, 
  confirmSignUp, 
  signOut, 
  getCurrentUser,
  fetchUserAttributes,
  resetPassword,
  confirmResetPassword,
  type SignInInput,
  type SignUpInput,
  type ConfirmSignUpInput
} from '@aws-amplify/auth';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoadingLogin: boolean;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
}

// Función para limpiar el almacenamiento local de Cognito
const clearCognitoStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const keysToRemove = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && (key.includes('Cognito') || key.includes('amplify'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => window.localStorage.removeItem(key));
    } catch (error) {
      throw error;
    }
  }
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isLoadingLogin: false,
    isAuthenticated: false,
    isLoggingOut: false,
  });

  const checkAuthState = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      
      const attributes = await fetchUserAttributes();
      
      const userData = {
        id: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || '',
        emailVerified: attributes.email_verified === 'true',
      };
      
      setAuthState({
        user: userData,
        isLoading: false,
        isLoadingLogin: false,
        isAuthenticated: true,
        isLoggingOut: false,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        isLoadingLogin: false,
        isAuthenticated: false,
        isLoggingOut: false,
      });
      throw error;
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const login = async (credentials: SignInInput) => {
    try {
      // Activar estado de carga
      setAuthState(prev => ({
        ...prev,
        isLoadingLogin: true,
      }));

      // Intentar diferentes flujos de autenticación
      let signInResult;
      
      try {
        // Primero intentar sin especificar flujo
        signInResult = await signIn(credentials);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'InvalidParameterException' && error.message.includes('USER_PASSWORD_AUTH')) {
          // Si falla, intentar con SRP (Secure Remote Password)
          signInResult = await signIn({
            ...credentials,
            options: {
              authFlowType: 'USER_SRP_AUTH'
            }
          });
        } else {
          throw error;
        }
      }

      const { isSignedIn, nextStep } = signInResult;

      if (isSignedIn) {
        // Obtener información del usuario inmediatamente
        try {
          const currentUser = await getCurrentUser();
          const attributes = await fetchUserAttributes();
          
          const userData = {
            id: currentUser.userId,
            email: attributes.email || '',
            name: attributes.name || '',
            emailVerified: attributes.email_verified === 'true',
          };
          
          setAuthState({
            user: userData,
            isLoading: false,
            isLoadingLogin: false,
            isAuthenticated: true,
            isLoggingOut: false,
          });
          
          toast.success('Successfully logged in');
          return { success: true };
        } catch {
          // Aún así, marcar como autenticado
          setAuthState({
            user: null,
            isLoading: false,
            isLoadingLogin: false,
            isAuthenticated: true,
            isLoggingOut: false,
          });
          toast.success('Successfully logged in');
          return { success: true };
        }
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        setAuthState(prev => ({
          ...prev,
          isLoadingLogin: false,
        }));
        toast.error('Please confirm your account before signing in.');
        return { success: false, requiresConfirmation: true };
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setAuthState(prev => ({
          ...prev,
          isLoadingLogin: false,
        }));
        toast.error('Password change required. Please contact administrator.');
        return { success: false, requiresPasswordChange: true };
      }

      setAuthState(prev => ({
        ...prev,
        isLoadingLogin: false,
      }));
      return { success: false };
    } catch (error: unknown) {
      // Desactivar estado de carga en caso de error
      setAuthState(prev => ({
        ...prev,
        isLoadingLogin: false,
      }));
      let message = ''

      if (error instanceof Error) {
        if (error.name === 'UserNotConfirmedException') {
          message = 'Your account has not been confirmed. Please check your email.';
        } else if (error.name === 'NotAuthorizedException') {
          message = 'Incorrect email or password.';
      } else if (error.name === 'UserNotFoundException') {
          message = 'No account found with this email.';
        } else if (error.name === 'TooManyRequestsException') {
          message = 'Too many attempts. Please wait a moment.';
      } else if (error.name === 'InvalidParameterException') {
          message = 'Authentication flow not supported. Please contact administrator.';
        } else {
          message = 'Error during sign in. Please try again.';
      }
      }

      return { success: false, message: message };
    }
  };

  const register = async (userData: SignUpInput) => {
    try {
      const { isSignUpComplete, nextStep } = await signUp(userData);

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        toast.success('User registered successfully. Please verify your email with the confirmation code.');
        return { success: true, requiresConfirmation: true };
      } else if (isSignUpComplete) {
        toast.success('User registered and verified successfully!');
        return { success: true };
      }

      return { success: false };
    } catch (error: unknown) {
      let message = ''
      if (error instanceof Error) {
        if (error.name === 'UsernameExistsException') {
          message = 'User already exists with this email.';
        } else if (error.name === 'InvalidPasswordException') {
          message = 'Password does not meet security requirements.';
      } else if (error.name === 'InvalidParameterException') {
          message = 'The provided email is not valid.';
        } else {
          message = 'Error during registration. Please try again.';
      }
      }

      return { success: false, message: message };
    }
  };

  const confirmRegistration = async (confirmationData: ConfirmSignUpInput) => {
    try {
      const { isSignUpComplete } = await confirmSignUp(confirmationData);

      if (isSignUpComplete) {
        toast.success('Account verified successfully! You can now sign in.');
        return { success: true };
      }

      return { success: false };
    } catch (error: unknown) {
      let message = ''
      if (error instanceof Error) {
        if (error.name === 'CodeMismatchException') {
          message = 'Incorrect confirmation code.';
        } else if (error.name === 'ExpiredCodeException') {
          message = 'Confirmation code has expired.';
      } else {
          message = 'Error during confirmation. Please try again.';
      }
      }

      return { success: false, message: message || 'Error during confirmation. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      // Marcar como en proceso de logout
      setAuthState(prev => ({
        ...prev,
        isLoggingOut: true,
      }));
      
      // Limpiar el almacenamiento local de Cognito primero
      clearCognitoStorage();
      
      // Limpiar el estado inmediatamente
      setAuthState({
        user: null,
        isLoading: false,
        isLoadingLogin: false,
        isAuthenticated: false,
        isLoggingOut: false,
      });
      
      // Llamar a signOut de Amplify
      await signOut();
      
      toast.success('Successfully logged out');
      
      // Redirigir a la landing page después del logout
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch {
      // Aún así, limpiar el estado local y el almacenamiento
      setAuthState({
        user: null,
        isLoading: false,
        isLoadingLogin: false,
        isAuthenticated: false,
        isLoggingOut: false,
      });
      clearCognitoStorage();
      
      toast.error('Error logging out');
      
      // Redirigir a la landing page incluso si hay error
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  // --- FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA ---
  const forgotPassword = async (email: string) => {
    try {
      await resetPassword({ username: email });
      return { success: true };
    } catch (error) {
      let message = ''
      if (error instanceof Error) {
        message = 'Error al solicitar recuperación de contraseña';
      }
      return { success: false, message: message };
    }
  };

  const forgotPasswordSubmit = async (email: string, code: string, newPassword: string) => {
    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
      return { success: true };
    } catch (error) {
      let message = ''
      if (error instanceof Error) {
        message = 'Error during password reset. Please try again.';
      }
      return { success: false, message: message };
    }
  };

  const forgotPasswordResendCode = async (email: string) => {
    try {
      await resetPassword({ username: email });
      return { success: true };
    } catch (error) {
      let message = ''
      if (error instanceof Error) {
        message = 'Error resending verification code. Please try again.';
      }
      return { success: false, message: message };
    }
  };

  const resendSignUpCode = async (username: string) => {
    try {
      await resendSignUpCode(username);
      toast.success('Verification code resent to your email');
      return { success: true };
    } catch (error: unknown) {
      let message = ''
      if (error instanceof Error) {
        if (error.name === 'UserNotFoundException') {
          message = 'No account found with this email.';
        } else if (error.name === 'TooManyRequestsException') {
          message = 'Too many attempts. Please wait a moment.';
        } else {
          message = 'Error resending verification code. Please try again.';
        }
      }
      return { success: false, message: message };
    }
  };

  return {
    ...authState,
    login,
    register,
    confirmRegistration,
    resendSignUpCode,
    logout,
    checkAuthState,
    forgotPassword,
    forgotPasswordSubmit,
    forgotPasswordResendCode,
  };
}; 
