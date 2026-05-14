import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: '/((?!_next/static|_next/image|favicon|images|manifest\\.json).*)',
};

function buildCSP(nonce: string): string {
    const isDev = process.env.NODE_ENV === 'development';

    return [
        "default-src 'self'",

        [
            "script-src 'self'",
            `'nonce-${nonce}'`,
            "'unsafe-inline'",
            isDev ? "'unsafe-eval'" : '',
            'challenges.cloudflare.com',
            isDev ? 'unpkg.com' : '',
        ].filter(Boolean).join(' '),

        "style-src 'self' 'unsafe-inline'",

        [
            "img-src 'self' data: blob:",
        ].join(' '),

        [
            "font-src 'self'",
        ].join(' '),

        [
            "connect-src 'self'",
            isDev ? 'unpkg.com' : '',
        ].filter(Boolean).join(' '),

        [
            "frame-src",
            'challenges.cloudflare.com',
            'https://www.youtube-nocookie.com',
            'https://www.google.com',
        ].join(' '),

        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        isDev ? '' : 'upgrade-insecure-requests',
    ].filter(Boolean).join('; ');
}

export function proxy(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const csp = buildCSP(nonce);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);

    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });

    response.headers.set('content-security-policy', csp);

    return response;
}
