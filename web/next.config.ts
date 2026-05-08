import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Unsplash (used in onboarding templates)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
