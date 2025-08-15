import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/hospreal-front' : '',
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/hospreal-front' : '',
  // Ensure all pages are pre-rendered
  generateBuildId: async () => {
    return 'build'
  }
};

export default nextConfig;
