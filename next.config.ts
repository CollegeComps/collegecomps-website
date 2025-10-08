import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds
    // This allows deployment to proceed while you fix linting issues separately
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optional: Also ignore TypeScript errors during build if needed
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;
