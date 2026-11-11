import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: ["lucide-react"] },

  /**
   * Pages are rendered per request, so a cached copy is always a stale copy —
   * which is how a client ends up looking at last week's shop and thinking
   * nothing shipped. Build assets keep their immutable caching.
   */
  /**
   * The shop traded as Kagorim before it traded as Bello Beauty, and the old
   * address is still attached to the project and still shared around. Rather
   * than detach it — which frees the name for anyone to claim — it is sent on
   * to the new one, path and all, permanently.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: "kagorim-boutique.vercel.app" }],
        destination: "https://bellobeauty.vercel.app/:path*",
        permanent: true,
      },
    ];
  },

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
