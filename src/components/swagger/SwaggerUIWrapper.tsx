'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'swagger-ui-react/swagger-ui.css';
import '@/styles/swagger-custom.css';
import { getValidAuthToken } from '@/utils/auth-token';

// Dynamically import SwaggerUI with specific configurations to minimize warnings
const SwaggerUI = dynamic(
  () => import('swagger-ui-react').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Swagger UI...</p>
        </div>
      </div>
    )
  }
);

interface SwaggerUIWrapperProps {
  spec?: object;
}

export default function SwaggerUIWrapper({ spec }: SwaggerUIWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [suppressWarnings, setSuppressWarnings] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Temporarily suppress console warnings for Swagger UI legacy lifecycle methods
    if (!suppressWarnings) {
      const originalWarn = console.warn;
      const originalError = console.error;
      
      console.warn = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' && 
          (message.includes('UNSAFE_componentWillReceiveProps') ||
           message.includes('componentWillReceiveProps') ||
           message.includes('ModelCollapse') ||
           message.includes('OperationContainer') ||
           message.includes('ContentType') ||
           message.includes('ExamplesSelect') ||
           message.includes('ParameterRow') ||
           message.includes('Using UNSAFE_componentWillReceiveProps') ||
           message.includes('escaping deep link whitespace with `_` will be unsupported') ||
           message.includes('use `%20` instead'))
        ) {
          return; // Suppress these specific warnings
        }
        originalWarn.apply(console, args);
      };

      console.error = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' && 
          (message.includes('UNSAFE_componentWillReceiveProps') ||
           message.includes('componentWillReceiveProps') ||
           message.includes('escaping deep link whitespace'))
        ) {
          return; // Suppress these specific errors
        }
        originalError.apply(console, args);
      };

      setSuppressWarnings(true);

      // Cleanup function
      return () => {
        console.warn = originalWarn;
        console.error = originalError;
      };
    }
  }, [suppressWarnings]);

  if (!mounted || !spec) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!mounted ? 'Initializing...' : 'Loading API specification...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="swagger-ui-wrapper" suppressHydrationWarning>
      {/* Wrap in a div that suppresses hydration warnings */}
      <div suppressHydrationWarning>
        <SwaggerUI
          spec={spec}
          deepLinking={false}
          displayOperationId={false}
          defaultModelsExpandDepth={1}
          defaultModelExpandDepth={1}
          tryItOutEnabled={true}
          filter={true}
          docExpansion="list"
          requestInterceptor={async (request) => {
            // Auto-inject Bearer token from AWS Amplify session
            try {
              const token = await getValidAuthToken();
              if (token && !request.headers.Authorization) {
                request.headers.Authorization = `Bearer ${token}`;
              }
            } catch (error) {
              console.debug('Could not get auth token for request:', error);
            }
            return request;
          }}
          onComplete={async (swaggerApi) => {
            console.log('Swagger UI loaded successfully');
            // Auto-populate auth with current JWT token
            try {
              const token = await getValidAuthToken();
              if (token) {
                swaggerApi.preauthorizeApiKey('BearerAuth', token);
                console.log('JWT token automatically configured for API requests');
              }
            } catch (error) {
              console.debug('Could not auto-configure auth token:', error);
            }
          }}
        />
      </div>
    </div>
  );
}