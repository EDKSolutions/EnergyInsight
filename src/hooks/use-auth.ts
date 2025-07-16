import { 
  signIn, 
  signUp, 
  confirmSignUp, 
  signOut, 
  getCurrentUser,
  fetchUserAttributes,
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
      console.log('Cognito storage cleared');
    } catch (error) {
      console.error('Error clearing Cognito storage:', error);
    }
  }
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isLoggingOut: false,
  });

  const checkAuthState = useCallback(async () => {
    try {
      console.log('Checking auth state...');
      const currentUser = await getCurrentUser();
      console.log('Current user:', currentUser);
      
      const attributes = await fetchUserAttributes();
      console.log('User attributes:', attributes);
      
      const userData = {
        id: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || '',
        emailVerified: attributes.email_verified === 'true',
      };
      
      console.log('Setting auth state with user:', userData);
      
      setAuthState({
        user: userData,
        isLoading: false,
        isAuthenticated: true,
        isLoggingOut: false,
      });
    } catch (error) {
      console.log('No authenticated user found:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isLoggingOut: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const login = async (credentials: SignInInput) => {
    try {
      console.log('Attempting to sign in with:', { username: credentials.username });
      
      // Intentar diferentes flujos de autenticación
      let signInResult;
      
      try {
        // Primero intentar sin especificar flujo
        signInResult = await signIn(credentials);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'InvalidParameterException' && error.message.includes('USER_PASSWORD_AUTH')) {
          // Si falla, intentar con SRP (Secure Remote Password)
          console.log('Trying SRP authentication flow...');
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

      console.log('Sign in result:', signInResult);

      const { isSignedIn, nextStep } = signInResult;

      if (isSignedIn) {
        console.log('User signed in successfully, updating auth state...');
        
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
          
          console.log('Setting auth state with user:', userData);
          
          setAuthState({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
            isLoggingOut: false,
          });
          
          toast.success('Successfully logged in');
          return { success: true };
        } catch (error) {
          console.error('Error getting user data after login:', error);
          // Aún así, marcar como autenticado
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: true,
            isLoggingOut: false,
          });
          toast.success('Successfully logged in');
          return { success: true };
        }
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        toast.error('Please confirm your account before signing in.');
        return { success: false, requiresConfirmation: true };
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        toast.error('Password change required. Please contact administrator.');
        return { success: false, requiresPasswordChange: true };
      }

      return { success: false };
    } catch (error: unknown) {
      console.error('Error during sign in:', error);
      
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        if (error.name === 'UserNotConfirmedException') {
        toast.error('Your account has not been confirmed. Please check your email.');
        return { success: false, requiresConfirmation: true };
      } else if (error.name === 'NotAuthorizedException') {
        toast.error('Incorrect email or password.');
      } else if (error.name === 'UserNotFoundException') {
        toast.error('No account found with this email.');
      } else if (error.name === 'TooManyRequestsException') {
        toast.error('Too many attempts. Please wait a moment.');
      } else if (error.name === 'InvalidParameterException') {
        toast.error('Authentication flow not supported. Please contact administrator.');
      } else {
        toast.error('Error during sign in. Please try again.');
      }
      }

      return { success: false };
    }
  };

  const register = async (userData: SignUpInput) => {
    try {
      console.log('Attempting to register user:', { username: userData.username, email: userData.options?.userAttributes?.email });
      
      const { isSignUpComplete, userId, nextStep } = await signUp(userData);

      console.log('Registration result:', { isSignUpComplete, userId, nextStep });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        toast.success('User registered successfully. Please verify your email with the confirmation code.');
        return { success: true, requiresConfirmation: true };
      } else if (isSignUpComplete) {
        toast.success('User registered and verified successfully!');
        return { success: true };
      }

      return { success: false };
    } catch (error: unknown) {
      console.error('Error during registration:', error);
      
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        if (error.name === 'UsernameExistsException') {
        toast.error('User already exists with this email.');
      } else if (error.name === 'InvalidPasswordException') {
        toast.error('Password does not meet security requirements.');
      } else if (error.name === 'InvalidParameterException') {
        toast.error('The provided email is not valid.');
      } else {
        toast.error('Error during registration. Please try again.');
      }
      }

      return { success: false };
    }
  };

  const confirmRegistration = async (confirmationData: ConfirmSignUpInput) => {
    try {
      console.log('Attempting to confirm registration:', { username: confirmationData.username });
      
      const { isSignUpComplete } = await confirmSignUp(confirmationData);

      console.log('Confirmation result:', { isSignUpComplete });

      if (isSignUpComplete) {
        toast.success('Account verified successfully! You can now sign in.');
        return { success: true };
      }

      return { success: false };
    } catch (error: unknown) {
      console.error('Error during confirmation:', error);
      
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        if (error.name === 'CodeMismatchException') {
        toast.error('Incorrect confirmation code.');
      } else if (error.name === 'ExpiredCodeException') {
        toast.error('Confirmation code has expired.');
      } else {
        toast.error('Error during confirmation. Please try again.');
      }
      }

      return { success: false };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      
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
        isAuthenticated: false,
        isLoggingOut: false,
      });
      
      // Llamar a signOut de Amplify
      await signOut();
      console.log('User logged out successfully');
      
      toast.success('Successfully logged out');
      
      // Redirigir a la landing page después del logout
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Aún así, limpiar el estado local y el almacenamiento
      setAuthState({
        user: null,
        isLoading: false,
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

  return {
    ...authState,
    login,
    register,
    confirmRegistration,
    logout,
    checkAuthState,
  };
}; 
