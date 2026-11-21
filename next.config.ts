import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  async rewrites() {
    const useApi = process.env.NEXT_PUBLIC_USE_API !== "false";
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!useApi || !backendUrl || (siteUrl && backendUrl === siteUrl)) {
      return [];
    }
    return {
      fallback: [
        {
          source: "/api/v1/:path*",
          destination: `${backendUrl}/api/v1/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
