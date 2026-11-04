import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: ["lucide-react"] },

  /**
   * Pages are rendered per request, so a cached copy is always a stale copy —
   * which is how a client ends up looking at last week's shop and thinking
   * nothing shipped. Build assets keep their immutable caching.
   */
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
