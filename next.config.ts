import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { hostname: 'upload.wikimedia.org', pathname: '/wikipedia/commons/thumb/**', protocol: 'https' },
        ],
    },
    reactStrictMode: false,
};

export default nextConfig;
