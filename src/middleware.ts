import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // Block known scraper bots on API routes
  if (pathname.startsWith('/api/')) {
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

  // CORS: restrict API access to own domain
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://collegecomps.com',
      'https://www.collegecomps.com',
    ];

    // Allow same-origin requests (no origin header) and allowed origins
    if (origin && !allowedOrigins.includes(origin)) {
      // In dev, allow localhost
      if (
        process.env.NODE_ENV !== 'development' &&
        !origin.startsWith('http://localhost')
      ) {
        response.headers.set('Access-Control-Allow-Origin', 'https://collegecomps.com');
      }
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
