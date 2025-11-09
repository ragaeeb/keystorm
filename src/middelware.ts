import { type NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://keystorm.vercel.app',
];

/**
 * Validates request origin against allowed domains
 * @param request - Incoming request
 * @returns true if origin is allowed
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
 * Middleware for CORS validation on API routes
 * @param request - Incoming request
 * @returns Response with CORS headers or 403 Forbidden
 */
export const middleware = (request: NextRequest) => {
    if (request.nextUrl.pathname.startsWith('/api/generate-lessons')) {
        if (!isOriginAllowed(request)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

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

        const response = NextResponse.next();
        response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        return response;
    }

    return NextResponse.next();
};

export const config = { matcher: '/api/:path*' };
