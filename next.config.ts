import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["opencc-js"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "wsrv.nl",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
