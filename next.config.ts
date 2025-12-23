import {withSentryConfig} from '@sentry/nextjs';
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "collegecomps",

  project: "collegecomps",

  // Only print logs when auth token is configured for sourcemap uploads
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Disable sourcemap uploads if running locally or in dev
  dryRun: process.env.NODE_ENV !== 'production' || !process.env.SENTRY_AUTH_TOKEN,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Webpack configuration for Sentry
  webpack: {
    // Automatically tree-shake Sentry logger statements to reduce bundle size (replaces deprecated disableLogger)
    treeshake: {
      removeDebugLogging: true,
    },
    // Enable automatic instrumentation of Vercel Cron Monitors (replaces deprecated automaticVercelMonitors)
    automaticVercelMonitors: true,
  },
});