import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@creit-tech/stellar-wallets-kit": false,
      "@creit-tech/stellar-wallets-kit/modules/utils": false,
    };
    return config;
  },
};

export default nextConfig;
