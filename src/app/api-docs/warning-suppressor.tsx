'use client';

import { useEffect } from 'react';

export default function WarningSuppressor() {
  useEffect(() => {
    // Immediately suppress warnings when this component mounts
    const originalWarn = console.warn;
    const originalError = console.error;
    
    const shouldSuppress = (message: any) => {
      if (typeof message === 'string') {
        return (
          message.includes('Using UNSAFE_componentWillReceiveProps') ||
          message.includes('UNSAFE_componentWillReceiveProps') ||
          message.includes('componentWillReceiveProps') ||
          message.includes('ModelCollapse') ||
          message.includes('OperationContainer') ||
          message.includes('ContentType') ||
          message.includes('ExamplesSelect') ||
          message.includes('ParameterRow') ||
          message.includes('Please update the following components:') ||
          message.includes('Move data fetching code or side effects to componentDidUpdate') ||
          message.includes('refactor your code to use memoization techniques') ||
          message.includes('https://react.dev/link/unsafe-component-lifecycles') ||
          message.includes('https://react.dev/link/derived-state') ||
          message.includes('escaping deep link whitespace') ||
          message.includes('use `%20` instead')
        );
      }
      return false;
    };

    console.warn = function(...args) {
      if (!shouldSuppress(args[0])) {
        originalWarn.apply(console, args);
      }
    };

    console.error = function(...args) {
      if (!shouldSuppress(args[0])) {
        originalError.apply(console, args);
      }
    };

    // Store originals for cleanup
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null; // This component doesn't render anything
}