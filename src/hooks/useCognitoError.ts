type CognitoError = {
  name: string;
  message: string;
};

export function useCognitoError() {
  function getErrorMessage(error: CognitoError | unknown): string {
    if (!error || typeof error !== 'object' || !('name' in error)) {
      return 'An unexpected error occurred. Please try again.';
    }
    switch ((error as CognitoError).name) {
      case 'UserNotFoundException':
        return 'User does not exist.';
      case 'NotAuthorizedException':
        return 'Incorrect email or password.';
      case 'UserNotConfirmedException':
        return 'Your account is not confirmed. Please check your email.';
      case 'UsernameExistsException':
        return 'This email is already registered.';
      case 'InvalidPasswordException':
        return 'The password does not meet the security requirements.';
      case 'CodeMismatchException':
        return 'The verification code is incorrect.';
      case 'ExpiredCodeException':
        return 'The verification code has expired. Please request a new one.';
      case 'LimitExceededException':
        return 'Too many attempts. Please wait a few minutes and try again.';
      case 'InvalidParameterException':
        return 'Incorrect email or password.';
      case 'EmptySignInUsername':
        return 'Email address is required.';
      case 'UserNotConfirmedException':
        return 'Your account is not confirmed. Please check your email.';
      case 'UsernameExistsException':
        return 'This email is already registered.';
      case 'InvalidPasswordException':
        return 'The password does not meet the security requirements.';
      case 'ExpiredCodeException':
        return 'The verification code has expired. Please request a new one.';
      case 'UserLambdaValidationException':
        return (error as CognitoError).message;

      // Add more cases as needed
      default:
        return (error as CognitoError).message || 'An error occurred. Please try again.';
    }
  }

  return { getErrorMessage };
} 
