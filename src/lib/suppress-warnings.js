// Warning suppression for third-party libraries
// This file is injected early in the client bundle to suppress known warnings from libraries

if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  const shouldSuppressMessage = (message) => {
    if (typeof message === 'string') {
      return (
        // React lifecycle warnings
        message.includes('Using UNSAFE_componentWillReceiveProps in strict mode') ||
        message.includes('UNSAFE_componentWillReceiveProps') ||
        message.includes('componentWillReceiveProps') ||
        message.includes('Move data fetching code or side effects to componentDidUpdate') ||
        message.includes('refactor your code to use memoization techniques') ||
        message.includes('https://react.dev/link/unsafe-component-lifecycles') ||
        message.includes('https://react.dev/link/derived-state') ||
        
        // Specific Swagger UI components
        message.includes('ModelCollapse') ||
        message.includes('OperationContainer') ||
        message.includes('ContentType') ||
        message.includes('ExamplesSelect') ||
        message.includes('ParameterRow') ||
        
        // General React warnings
        message.includes('componentWillReceiveProps has been renamed') ||
        message.includes('Please update the following components:') ||
        
        // Deep link warnings
        message.includes('escaping deep link whitespace with `_` will be unsupported') ||
        message.includes('use `%20` instead')
      );
    }
    return false;
  };
  
  console.warn = function(...args) {
    if (!shouldSuppressMessage(args[0])) {
      originalWarn.apply(console, args);
    }
  };
  
  console.error = function(...args) {
    if (!shouldSuppressMessage(args[0])) {
      originalError.apply(console, args);
    }
  };
  
  // Store originals for potential cleanup
  window.__originalConsoleWarn = originalWarn;
  window.__originalConsoleError = originalError;
  
  // Also suppress on document ready
  document.addEventListener('DOMContentLoaded', function() {
    console.warn = function(...args) {
      if (!shouldSuppressMessage(args[0])) {
        originalWarn.apply(console, args);
      }
    };
  });
}