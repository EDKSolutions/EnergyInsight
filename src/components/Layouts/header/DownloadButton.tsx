"use client";

import { DownloadIcon } from "@/components/shared/icons";
import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";

export function DownloadButton() {
  const { isAuthenticated, isLoading } = useAuthContext();

  // Don't render if user is not authenticated or still loading
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/documents/energy-calculations.pdf"
      download="energy-calculations.pdf"
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
      title="Download Energy Calculations PDF"
    >
      <DownloadIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Download PDF</span>
    </Link>
  );
}