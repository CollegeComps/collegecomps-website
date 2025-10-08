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
  // Prevent better-sqlite3 from being bundled (it's a native module)
  serverExternalPackages: ['better-sqlite3'],
  // Skip database initialization during static page generation
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize native modules
      config.externals.push('better-sqlite3');
    }
    return config;
  },
};

export default nextConfig;
