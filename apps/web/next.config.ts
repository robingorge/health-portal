import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@health-portal/shared"],
  // The shared package uses TS-ESM style imports like `./types/index.js`
  // that actually resolve to `.ts` source files. Webpack needs this alias
  // to follow them; tsc handles it natively via moduleResolution: "nodenext".
  webpack(config) {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
