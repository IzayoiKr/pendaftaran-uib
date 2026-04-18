import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const refreshToken = request.cookies.get('refresh_token');

    if (!refreshToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/account/:path*',
        '/transferproof/:path*',
        '/uploadtransferproof/:path*',
        '/prasyaratospek/:path*',
        '/changeprodi/:path*',
        '/requestchangeprodi/:path*',
        '/profilechange/:path*',
        '/login/passwordchange',
    ]
}
