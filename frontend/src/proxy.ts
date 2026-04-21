import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const isAuthenticated = request.cookies.has('auth_hint');

    if (!isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/account/:path*'],
};
