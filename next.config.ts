import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['tailwindcss-animate'],
  },
};

export default nextConfig;
