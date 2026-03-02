import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Bundle the SQLite database file into every API route's Lambda function
  // so lib/db.ts can copy it to /tmp at cold-start time (making it writable)
  outputFileTracingIncludes: {
    '/api/**': ['./prisma/db.sqlite', './prisma/**'],
  },
};

export default nextConfig;
