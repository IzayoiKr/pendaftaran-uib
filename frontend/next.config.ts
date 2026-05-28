import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isProduction = process.env.NODE_ENV === "production";
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:9999";

const nextConfig: NextConfig = {
    reactCompiler: true,
    allowedDevOrigins: process.env.EXTRA_DEV_ORIGINS
        ? [process.env.EXTRA_DEV_ORIGINS]
        : [],
    sassOptions: {
        loadPaths: ["node_modules"],
    },
    images: {
        formats: ["image/avif", "image/webp"],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Permissions-Policy",
                        value: [
                            "camera=()",
                            "microphone=()",
                            "geolocation=()",
                            "payment=()",
                            "usb=()",
                            "interest-cohort=()",
                        ].join(", "),
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${backendUrl}/api/:path*`,
            },
        ];
    },
    output: isProduction ? "standalone" : undefined,
    outputFileTracingIncludes: {
        "/files/*": ["./src/assets/**/*"],
    },
    poweredByHeader: false,
};

export default withNextIntl(nextConfig);
