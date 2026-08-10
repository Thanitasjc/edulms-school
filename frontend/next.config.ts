import type { NextConfig } from "next";

/** Browser calls same-origin /api-proxy → avoids CORS and is more reliable on mobile. */
const apiProxyOrigin =
  process.env.API_PROXY_ORIGIN ??
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000"
    : "https://edulms-api.onrender.com");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${apiProxyOrigin}/api/:path*`,
      },
    ];
  },
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
        protocol: "https",
        hostname: "edulms-api.onrender.com",
        pathname: "/storage/**",
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
