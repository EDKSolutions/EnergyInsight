import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['tailwindcss-animate'],
  },
  // Suppress React strict mode warnings for specific pages
  reactStrictMode: true,
};

export default nextConfig;
