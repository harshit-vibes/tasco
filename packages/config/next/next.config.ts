import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tasco/ui", "@tasco/db", "@tasco/lyzr"],
};

export default nextConfig;
