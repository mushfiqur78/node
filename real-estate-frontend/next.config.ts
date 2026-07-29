import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/webp', 'image/avif'], // Use modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Optimize for common device sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Optimize for common image sizes
  },
  // Optimize production builds
  swcMinify: true,
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize fonts
  optimizeFonts: true,
};

export default nextConfig;
