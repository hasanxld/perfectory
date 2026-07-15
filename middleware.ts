import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Set cache headers for static assets
  if (
    request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
  ) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Set cache headers for pages
  if (request.nextUrl.pathname.match(/^\/(favicon|robots|sitemap)/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Default cache for HTML pages
  response.headers.set(
    'Cache-Control',
    'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
  )

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon\\.ico).*)',
  ],
}
