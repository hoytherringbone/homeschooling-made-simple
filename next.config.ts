import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.spock.replit.dev",
    "*.repl.co",
    "127.0.0.1",
  ],
};

export default nextConfig;
