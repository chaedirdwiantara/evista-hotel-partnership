/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bhisa-dev-v1.evista.id',
      },
      {
        protocol: 'https',
        hostname: 'evista.id',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Common placeholder source
      }
    ],
  },
};

export default nextConfig;
