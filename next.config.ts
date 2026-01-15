import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 优化 CSS 加载
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 启用现代优化
  experimental: {
    optimizePackageImports: ['antd'],
  },
};

export default nextConfig;
