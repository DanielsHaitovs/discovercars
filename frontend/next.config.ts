import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "booking-test.dev-dch.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
