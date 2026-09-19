import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
