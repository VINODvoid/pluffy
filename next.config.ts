import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // Ignore TypeScript declaration files from node_modules
    config.module.rules.push({
      test: /\.d\.ts$/,
      loader: "ignore-loader",
    });

    return config;
  },
};

export default nextConfig;
