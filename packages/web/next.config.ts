import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.eu-central-003.backblazeb2.com',
        pathname: '/objekthub-assets/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-b2.objekt-hub.workers.dev',
      },
    ],
  },
};

export default nextConfig;
