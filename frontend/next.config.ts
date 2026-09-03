import type { NextConfig } from "next";

function formatBackendUrl(url: string | undefined): string {
  if (!url || !url.trim()) return 'http://localhost:3001';
  let trimmed = url.trim().replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

const backendBase = formatBackendUrl(process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL);

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return [
      {
        source: '/transfer-money',
        destination: '/remittance',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendBase}/api/v1/:path*`, // Proxy to Live Backend
      },
      {
        source: '/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`, // Proxy uploads static assets
      },
    ];
  },
};

export default nextConfig;
