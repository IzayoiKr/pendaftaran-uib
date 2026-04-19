import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:9999'

const nextConfig: NextConfig = {
    reactCompiler: true,
    allowedDevOrigins: process.env.EXTRA_DEV_ORIGINS ? [process.env.EXTRA_DEV_ORIGINS] : [],
    sassOptions: {
        loadPaths: ['node_modules']
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`
            }
        ];
    },
    output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined
};

export default nextConfig;
