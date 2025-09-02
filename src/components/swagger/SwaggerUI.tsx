'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

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

interface SwaggerUIComponentProps {
  spec?: object;
}

export default function SwaggerUIComponent({ spec }: SwaggerUIComponentProps) {
  useEffect(() => {
    // Suppress React strict mode warnings for Swagger UI components
    const originalConsoleWarn = console.warn;
    console.warn = (message, ...args) => {
      // Filter out specific Swagger UI React warnings
      if (
        typeof message === 'string' && 
        (message.includes('UNSAFE_componentWillReceiveProps') ||
         message.includes('componentWillReceiveProps') ||
         message.includes('ModelCollapse') ||
         message.includes('OperationContainer'))
      ) {
        return; // Suppress these warnings
      }
      originalConsoleWarn.apply(console, [message, ...args]);
    };

    return () => {
      console.warn = originalConsoleWarn;
    };
  }, []);

  if (!spec) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API specification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swagger-ui-wrapper">
      <SwaggerUI
        spec={spec}
        deepLinking={true}
        displayOperationId={true}
        defaultModelsExpandDepth={1}
        defaultModelExpandDepth={1}
        displayRequestDuration={true}
        tryItOutEnabled={true}
        filter={true}
        showRequestHeaders={true}
        showCommonExtensions={true}
        persistAuthorization={true}
        docExpansion="list"
        supportedSubmitMethods={['get', 'post', 'put', 'delete', 'patch']}
        validatorUrl={null}
        showMutatedRequest={false}
        syntaxHighlight={{
          activated: true,
          theme: 'agate'
        }}
        presets={[]}
        plugins={[]}
        requestInterceptor={(request) => {
          // Auto-inject Bearer token if available in localStorage
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (token && !request.headers.Authorization) {
              request.headers.Authorization = `Bearer ${token}`;
            }
          }
          return request;
        }}
        onComplete={(swaggerApi) => {
          console.log('Swagger UI loaded successfully');
          // Auto-populate auth if token is available
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (token) {
              swaggerApi.preauthorizeApiKey('BearerAuth', token);
            }
          }
        }}
      />
      <style jsx global>{`
        .swagger-ui-wrapper {
          width: 100%;
          height: 100vh;
          overflow-y: auto;
        }
        
        /* Custom Swagger UI styling */
        .swagger-ui .topbar {
          background-color: #1f2937;
          border-bottom: 2px solid #374151;
        }
        
        .swagger-ui .topbar .download-url-wrapper {
          display: none;
        }
        
        .swagger-ui .info {
          margin: 20px 0;
        }
        
        .swagger-ui .info .title {
          color: #1f2937;
          font-size: 2.5rem;
          font-weight: bold;
        }
        
        .swagger-ui .info .description {
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 15px 0;
        }
        
        .swagger-ui .scheme-container {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        
        .swagger-ui .opblock {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 15px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .swagger-ui .opblock.opblock-post {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }
        
        .swagger-ui .opblock.opblock-get {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }
        
        .swagger-ui .opblock.opblock-put {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }
        
        .swagger-ui .opblock.opblock-delete {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
        
        .swagger-ui .opblock .opblock-summary-method {
          min-width: 80px;
          font-weight: bold;
          border-radius: 6px;
        }
        
        .swagger-ui .opblock-summary-description {
          font-weight: 500;
        }
        
        .swagger-ui .parameters-container {
          background: #f8fafc;
          border-radius: 6px;
          padding: 15px;
          margin: 10px 0;
        }
        
        .swagger-ui .response-container {
          background: #f8fafc;
          border-radius: 6px;
          padding: 15px;
          margin: 10px 0;
        }
        
        .swagger-ui .responses-wrapper {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-top: 10px;
        }
        
        .swagger-ui .btn.execute {
          background-color: #059669;
          border-color: #059669;
          color: white;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 6px;
        }
        
        .swagger-ui .btn.execute:hover {
          background-color: #047857;
          border-color: #047857;
        }
        
        .swagger-ui .btn.btn-clear {
          background-color: #6b7280;
          border-color: #6b7280;
          color: white;
          border-radius: 6px;
        }
        
        .swagger-ui .btn.btn-clear:hover {
          background-color: #4b5563;
          border-color: #4b5563;
        }
        
        .swagger-ui .authorization__btn {
          background-color: #3b82f6;
          border-color: #3b82f6;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: 600;
        }
        
        .swagger-ui .authorization__btn:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        
        .swagger-ui .model-container {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin: 10px 0;
        }
        
        .swagger-ui .model .model-title {
          color: #1f2937;
          font-weight: 600;
        }
        
        .swagger-ui .parameter__name {
          font-weight: 600;
          color: #1f2937;
        }
        
        .swagger-ui .parameter__type {
          font-size: 0.9rem;
          color: #6b7280;
        }
        
        .swagger-ui .response-col_description {
          color: #374151;
        }
        
        .swagger-ui .response-col_status {
          font-weight: 600;
        }
        
        .swagger-ui .tab {
          border-radius: 6px 6px 0 0;
        }
        
        .swagger-ui .tab.active {
          background-color: white;
          border-bottom: 1px solid white;
        }
        
        .swagger-ui .opblock-body pre {
          background: #1f2937;
          color: #f3f4f6;
          border-radius: 6px;
          padding: 15px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .swagger-ui .copy-to-clipboard {
          background: #374151;
          border: 1px solid #4b5563;
          color: #f3f4f6;
          border-radius: 4px;
        }
        
        .swagger-ui .copy-to-clipboard:hover {
          background: #4b5563;
        }
        
        .swagger-ui .loading-container {
          padding: 40px;
          text-align: center;
        }
        
        .swagger-ui .errors-wrapper {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #991b1b;
        }
        
        .swagger-ui .download-contents {
          background: #10b981;
          border-color: #10b981;
          color: white;
          border-radius: 6px;
        }
        
        .swagger-ui .download-contents:hover {
          background: #059669;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .swagger-ui-wrapper {
            padding: 10px;
          }
          
          .swagger-ui .info .title {
            font-size: 2rem;
          }
          
          .swagger-ui .opblock-summary {
            flex-wrap: wrap;
          }
          
          .swagger-ui .opblock-summary-method {
            margin-bottom: 10px;
          }
        }
      `}</style>
    </div>
  );
}