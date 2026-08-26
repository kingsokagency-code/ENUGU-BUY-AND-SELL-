import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict production build configuration — zero build errors ignored (Remediating M4)
  allowedDevOrigins: [
    '10.69.207.46',
    '*.trycloudflare.com',
    '*.loca.lt',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
