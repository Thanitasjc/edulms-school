import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 blocks private/local IPs (127.0.0.1) by default (SSRF protection).
    // Needed so uploaded Laravel /storage images can be optimized in local dev.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
