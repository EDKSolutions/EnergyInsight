"use client"
import React, { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { generateCSVFilename } from '@/lib/utils/csv-export';

interface ExportButtonProps {
  className?: string;
  format?: 'basic' | 'detailed';
  dateFormat?: 'iso' | 'us' | 'short';
  precision?: number;
}

export default function ExportButton({
  className = '',
  format = 'detailed',
  dateFormat = 'iso',
  precision = 2
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      // Get the access token from Cognito
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      if (!accessToken) {
        throw new Error('No access token available. Please log in again.');
      }

      // Build URL with query parameters
      const params = new URLSearchParams({
        format,
        dateFormat,
        precision: precision.toString()
      });

      const response = await fetch(`/api/calculations/export?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the CSV content
      const csvContent = await response.text();

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      // Get filename from response headers or generate one
      const contentDisposition = response.headers.get('content-disposition');
      let filename = generateCSVFilename('calculations-export');

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]*)"/) ||
                             contentDisposition.match(/filename=([^;]*)/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        // Chrome
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      } else {
        // Other browsers
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error('Export error:', error);
      setError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:cursor-not-allowed ${className}`}
        aria-label="Export calculations to CSV"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 max-w-xs text-center">
          {error}
        </div>
      )}
    </div>
  );
}

export function ExportButtonWithOptions() {
  const [showOptions, setShowOptions] = useState(false);
  const [format, setFormat] = useState<'basic' | 'detailed'>('detailed');
  const [dateFormat, setDateFormat] = useState<'iso' | 'us' | 'short'>('iso');
  const [precision, setPrecision] = useState(2);

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <ExportButton
          format={format}
          dateFormat={dateFormat}
          precision={precision}
        />

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="inline-flex items-center px-2 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-label="Export options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 0L9 8.25m0 0L7.5 9.75M7.5 6v3.75m13.5-3.75L19.5 8.25m0 0L21 9.75M19.5 6v3.75m-7.5 0L10.5 12m0 0L9 13.5M10.5 12L12 13.5m7.5-1.5L19.5 12m0 0L21 13.5M19.5 12L18 13.5" />
          </svg>
        </button>
      </div>

      {showOptions && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 w-64">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Export Options</h3>

          <div className="space-y-3">
            {/* Format Selection */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'basic' | 'detailed')}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="detailed">Detailed (all fields)</option>
                <option value="basic">Basic (core fields only)</option>
              </select>
            </div>

            {/* Date Format */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Date Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as 'iso' | 'us' | 'short')}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="iso">ISO 8601 (2024-01-15T10:30:00Z)</option>
                <option value="us">US Format (1/15/2024)</option>
                <option value="short">Short (2024-01-15)</option>
              </select>
            </div>

            {/* Precision */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Decimal Precision
              </label>
              <select
                value={precision}
                onChange={(e) => setPrecision(parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value={0}>0 (1234)</option>
                <option value={1}>1 (1234.5)</option>
                <option value={2}>2 (1234.56)</option>
                <option value={3}>3 (1234.567)</option>
                <option value={4}>4 (1234.5678)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowOptions(false)}
            className="mt-3 w-full px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}