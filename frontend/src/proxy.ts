import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const isDev = process.env.NODE_ENV === "development";
const intlMiddleware = createMiddleware(routing);

function buildCSP(nonce: string): string {
    return [
        "default-src 'self'",
        [
            "script-src 'self'",
            `'nonce-${nonce}'`,
            "'strict-dynamic'",
            "'unsafe-inline'",
            isDev ? "'unsafe-eval'" : "",
        ]
            .filter(Boolean)
            .join(" "),
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        ["connect-src 'self'", isDev ? "unpkg.com" : ""]
            .filter(Boolean)
            .join(" "),
        [
            "frame-src",
            "challenges.cloudflare.com",
            "https://www.youtube-nocookie.com",
            "https://www.google.com",
        ].join(" "),
        "frame-ancestors 'none'",
        "object-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        isDev ? "" : "upgrade-insecure-requests",
    ]
        .filter(Boolean)
        .join("; ");
}

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const bypassPaths = [
        "/api",
        "/search",
        "/files",
        "/_next",
        "/favicon",
        "/images",
        "/docs",
        "/manifest.json",
    ];
    const shouldBypass = bypassPaths.some((path) => pathname.startsWith(path));

    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const csp = buildCSP(nonce);

    if (shouldBypass) {
        const response = NextResponse.next();
        response.headers.set("x-nonce", nonce);
        response.headers.set("content-security-policy", csp);
        return response;
    }

    const response = intlMiddleware(request) || NextResponse.next();

    response.headers.set("x-nonce", nonce);
    response.headers.set("content-security-policy", csp);

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};
