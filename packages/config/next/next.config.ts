import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@tasco/ui",
    "@tasco/db",
    "@tasco/lyzr",
    "@tasco/i18n",
    "@tasco/api",
    "@tasco/agents",
    "@tasco/export",
    "@tasco/tours",
    "@tasco/rag",
  ],
};

export default nextConfig;
