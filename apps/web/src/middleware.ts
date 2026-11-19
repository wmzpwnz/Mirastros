import { NextResponse } from 'next/server';

/** Entry documents and React navigation payloads must belong to the current
 * release. Keep immutable caching for fingerprinted JS/CSS/images separately. */
export function middleware() {
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
