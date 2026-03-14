/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/**': ['./src/data/**/*'],
  },
  images: {
    remotePatterns: [
      { hostname: 'cards.scryfall.io' },
      { hostname: 'img.youtube.com' },
      { hostname: 'api.scryfall.com' },
    ],
  },
};

export default nextConfig;
