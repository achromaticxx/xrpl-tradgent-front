/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/user/:path*',
        destination: 'http://localhost:8000/user/api/user/:path*',
      },
      {
        source: '/api/agent/:path*',
        destination: 'http://localhost:8000/agent/:path*',
      },
    ];
  },
}

export default nextConfig
