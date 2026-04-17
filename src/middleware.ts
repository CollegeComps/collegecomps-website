import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Bot policy: allow by default, block only confirmed parasites.
 *
 * ALLOWED (do nothing — these are all fine):
 *   - Search engines (Google, Bing, DuckDuckGo, Yandex, Baidu, etc.)
 *   - Social preview crawlers (Facebook, Twitter, LinkedIn, Discord, etc.)
 *   - SEO tools that help us get backlink/visibility data (Ahrefs, Semrush, Moz)
 *   - Uptime monitors (UptimeRobot, Pingdom, StatusCake, Vercel)
 *   - Generic crawlers and curl (might be CI, devs, legitimate clients)
 *
 * BLOCKED (these scrape content but send zero traffic back):
 *   - AI training crawlers: GPTBot, ChatGPT-User, CCBot, ClaudeBot,
 *     Anthropic-AI, Google-Extended (AI training, NOT Googlebot), PerplexityBot,
 *     Bytespider (TikTok), Amazonbot, Meta-ExternalAgent
 *   - Aggressive/shady scrapers: Scrapy, python-requests, Go-http-client, etc.
 *     (but only when they hit /api/ — could be legit for static pages)
 *   - Headless browsers used for scraping
 */
const BLOCKED_USER_AGENTS = [
  // AI training crawlers — parasites. Scrape content, never drive traffic.
  'GPTBot',             // OpenAI training
  'ChatGPT-User',       // ChatGPT browsing
  'OAI-SearchBot',      // OpenAI
  'CCBot',              // Common Crawl — feeds LLM training datasets
  'ClaudeBot',          // Anthropic
  'Claude-Web',         // Anthropic
  'anthropic-ai',       // Anthropic
  'Google-Extended',    // Google's AI training crawler (NOT Googlebot)
  'PerplexityBot',      // Perplexity
  'Perplexity-User',
  'YouBot',             // You.com
  'Bytespider',         // TikTok/ByteDance — aggressive scraper
  'Amazonbot',          // Amazon AI
  'Meta-ExternalAgent', // Meta AI training
  'FacebookBot',        // Meta training (different from facebookexternalhit)
  'Diffbot',            // Data harvester
  'Omgilibot',
  'Timpibot',
  'cohere-ai',
  'ICC-Crawler',
  'ImagesiftBot',
];

// Heavier block list applied only to /api/ routes (protect data endpoints).
// These might be legitimate for static pages, but have no business hitting APIs.
const API_BLOCKED_UA_SUBSTRINGS = [
  ...BLOCKED_USER_AGENTS,
  'scrapy',
  'httpclient',
  'python-requests',
  'go-http-client',
  'libwww-perl',
  'wget',
  'httpie',
  'phantomjs',
  'headlesschrome',
  'puppeteer',
  'playwright',
  'harvest',
];

// Paths that should never be accessed in production
const BLOCKED_PATHS = [
  '/api/debug-auth',
  '/api/test-auth-flow',
  '/api/test-institution',
];

function uaMatches(userAgent: string, list: string[]): boolean {
  const ua = userAgent.toLowerCase();
  return list.some((pattern) => ua.includes(pattern.toLowerCase()));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  // Block debug/test endpoints in production
  if (BLOCKED_PATHS.some((p) => pathname.startsWith(p))) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  // Block AI training bots on ALL routes (pages too) — they steal content
  // for model training without driving any traffic back. robots.txt asks
  // them not to, this enforces it.
  if (uaMatches(userAgent, BLOCKED_USER_AGENTS)) {
    return new NextResponse('Not found', { status: 404 });
  }

  // On API routes, also block generic scraping tools
  if (pathname.startsWith('/api/')) {
    if (uaMatches(userAgent, API_BLOCKED_UA_SUBSTRINGS)) {
      return NextResponse.json(
        { error: 'Automated access not permitted' },
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

  // CORS: restrict cross-origin API access. Requests with no origin (SSR,
  // Google renderer, same-origin) pass through without a CORS header.
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://collegecomps.com',
      'https://www.collegecomps.com',
    ];

    if (origin) {
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === 'development' ||
        origin.startsWith('http://localhost')
      ) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
    }
  }

  return response;
}

// Matcher: skip Next internals, static files, and SEO route handlers
// (sitemap.xml, robots.txt, opengraph-image, icon, etc. must be publicly
// accessible without any middleware processing).
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|opengraph-image|twitter-image|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)',
  ],
};
