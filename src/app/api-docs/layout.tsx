import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Energy Insight API Documentation',
  description: 'Interactive API documentation for Energy Insight - NYC building energy efficiency analysis',
  keywords: 'API, documentation, energy efficiency, NYC buildings, PTAC, PTHP, swagger',
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="api-docs-layout">
      <header className="bg-gray-900 text-white p-4 border-b">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Energy Insight API</h1>
          <p className="text-gray-300 mt-1">
            Interactive API documentation for NYC building energy analysis
          </p>
        </div>
      </header>
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading API Documentation...</p>
            </div>
          </div>
        }>
          {children}
        </Suspense>
      </main>
    </div>
  );
}