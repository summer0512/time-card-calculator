import {NextResponse, type NextRequest} from 'next/server';

/**
 * Reject common automated vulnerability-scanner probes before next-intl
 * and the application router do any work. Keep this list narrow: do not
 * block ordinary JSON, XML, or extension-bearing application routes.
 */
const SENSITIVE_EXACT_PATHS = new Set([
  '/.env',
  '/.env.local',
  '/.env.production',
  '/.git/config',
  '/firebase-key.json',
  '/keyfile.json',
  '/key.json',
  '/google-key.json',
  '/google-credentials.json',
  '/credentials.json',
  '/gcp-sa.json',
  '/gcp-credentials.json',
  '/gcp-key.json',
  '/sa.json',
  '/service-account.json',
  '/application_default_credentials.json',
]);

const SENSITIVE_PATH_PATTERNS = [
  /(?:^|\\/)\\.env(?:\\.|$)/i,
  /(?:^|\\/)\\.git(?:\\/|$)/i,
  /\\.php$/i,
  /(?:^|\\/)(?:wp-admin|wp-includes|wp-content)(?:\\/|$)/i,
  /(?:^|\\/)(?:phpinfo|xmlrpc)\\.php$/i,
  /(?:^|\\/)(?:firebase-adminsdk[^/]*\\.json)$/i,
];

export function rejectCommonScannerProbe(request: NextRequest): NextResponse | null {
  const path = request.nextUrl.pathname.toLowerCase();
  const normalized = path.length > 1 ? path.replace(/\\/+$/, '') : path;

  if (
    SENSITIVE_EXACT_PATHS.has(normalized) ||
    SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(normalized))
  ) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return null;
}

/**
 * Match extension-bearing probe paths too, while leaving framework internals
 * and common public assets to Cloudflare's static asset handling.
 */
export const securityMiddlewareMatcher = [
  '/((?!api|_next|_vercel|.*\\.(?:avif|bmp|css|gif|ico|jpe?g|js|map|mjs|mp3|mp4|pdf|png|svg|txt|webp|woff2?)$).*)',
];
