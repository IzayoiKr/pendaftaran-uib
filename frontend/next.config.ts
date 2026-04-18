import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:9999'

const nextConfig: NextConfig = {
    reactCompiler: true,
    allowedDevOrigins: ['*'],
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
    output: 'standalone'
};

export default nextConfig;
