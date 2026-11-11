import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextResponse, type NextRequest} from 'next/server';
import {isAuxiliaryPage} from './lib/auxiliary-pages';
import {rejectCommonScannerProbe, securityMiddlewareMatcher} from './lib/security/request-guard';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const rejected = rejectCommonScannerProbe(request);
  if (rejected) return rejected;

  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  const [locale, page] = segments;
  if (
    segments.length === 2 &&
    locale !== 'en' &&
    routing.locales.includes(locale as typeof routing.locales[number]) &&
    isAuxiliaryPage(page)
  ) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {'X-Robots-Tag': 'noindex'},
    });
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: securityMiddlewareMatcher,
};
