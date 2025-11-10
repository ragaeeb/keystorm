import { type NextRequest, NextResponse } from 'next/server';

/**
 * Allowed origins for CORS validation
 * Loaded from ALLOWED_ORIGINS environment variable or defaults to localhost and production domain
 */
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://keystorm.vercel.app',
];

/**
 * Validates if a request origin is in the allowed list
 * Checks both origin header and referer header as fallback
 *
 * @param request - Incoming Next.js request
 * @returns true if origin is allowed, false otherwise
 */
const isOriginAllowed = (request: NextRequest): boolean => {
    const origin = request.headers.get('origin');

    if (!origin) {
        const referer = request.headers.get('referer');
        if (referer) {
            try {
                const refererUrl = new URL(referer);
                return ALLOWED_ORIGINS.some((allowed) => {
                    const allowedUrl = new URL(allowed);
                    return refererUrl.origin === allowedUrl.origin;
                });
            } catch {
                return false;
            }
        }
        return false;
    }

    return ALLOWED_ORIGINS.includes(origin);
};

/**
 * Proxy function for handling CORS on API routes
 *
 * Next.js 16 renamed middleware.ts to proxy.ts to clarify network boundary.
 * This proxy runs on Node.js runtime and handles:
 * - CORS validation for /api/generate-lessons endpoint
 * - OPTIONS preflight requests
 * - Adding CORS headers to allowed responses
 * - Rejecting requests from unauthorized origins
 *
 * @param request - Incoming Next.js request
 * @returns NextResponse with CORS headers or 403 Forbidden
 */
export function proxy(request: NextRequest) {
    // Only apply CORS to lesson generation API
    if (request.nextUrl.pathname.startsWith('/api/generate-lessons')) {
        // Reject requests from unauthorized origins
        if (!isOriginAllowed(request)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Handle preflight OPTIONS requests
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                headers: {
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
                },
                status: 200,
            });
        }

        // Add CORS headers to successful responses
        const response = NextResponse.next();
        response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        return response;
    }

    // Pass through all other requests
    return NextResponse.next();
}

/**
 * Proxy configuration
 * Applies to all /api routes
 */
export const config = { matcher: '/api/:path*' };
