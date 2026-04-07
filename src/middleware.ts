import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Legitimate crawlers that should NEVER be blocked
const ALLOWED_BOTS = [
  'Googlebot',
  'Google-InspectionTool',
  'Storebot-Google',
  'GoogleOther',
  'AdsBot-Google',
  'Mediapartners-Google',
  'APIs-Google',
  'google-site-verification',
  'Bingbot',
  'Slurp',           // Yahoo
  'DuckDuckBot',
  'facebookexternalhit',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Discordbot',
  'Slackbot',
  'TelegramBot',
  'Applebot',
  'Vercel',
];

// Known malicious or aggressive bot user agents to block
const BLOCKED_BOTS = [
  'AhrefsBot',
  'SemrushBot',
  'DotBot',
  'MJ12bot',
  'BLEXBot',
  'DataForSeoBot',
  'serpstatbot',
  'Bytespider',
  'PetalBot',
  'YandexBot',
  'ZoominfoBot',
  'GPTBot',
  'CCBot',
  'ClaudeBot',
  'anthropic-ai',
  'Scrapy',
  'python-requests',
  'Go-http-client',
  'Java/',
  'libwww-perl',
  'wget',
  'curl/',
];

// Paths that should never be accessed in production
const BLOCKED_PATHS = [
  '/api/debug-auth',
  '/api/test-auth-flow',
  '/api/test-institution',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  // Block debug/test endpoints in production
  if (BLOCKED_PATHS.some((p) => pathname.startsWith(p))) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  // Check if this is a legitimate crawler (always allow)
  const isAllowedBot = ALLOWED_BOTS.some((bot) =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );

  // Block known scraper bots on API routes (but never block allowed bots)
  if (pathname.startsWith('/api/') && !isAllowedBot) {
    const isBlockedBot = BLOCKED_BOTS.some((bot) =>
      userAgent.toLowerCase().includes(bot.toLowerCase())
    );
    if (isBlockedBot) {
      return NextResponse.json(
        { error: 'Automated access not permitted' },
        { status: 403 }
      );
    }

    // Block requests with no user agent on API routes (likely scripts)
    if (!userAgent || userAgent.length < 10) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // CORS: restrict cross-origin API access
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://collegecomps.com',
      'https://www.collegecomps.com',
    ];

    if (origin) {
      if (allowedOrigins.includes(origin) ||
          process.env.NODE_ENV === 'development' ||
          origin.startsWith('http://localhost')) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      // No origin header = same-origin or server-side request (Google renderer, SSR) — always allowed
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match pages (for security headers) but skip static files and Next internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)',
  ],
};
