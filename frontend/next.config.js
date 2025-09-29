/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '127.0.0.1','sidai-enkop-farm.onrender.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://sidai-enkop-farm.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
