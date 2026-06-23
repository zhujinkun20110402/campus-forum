import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "picgo.net",
      },
      {
        protocol: "https",
        hostname: "*.picgo.net",
      },
    ],
  },
}

export default nextConfig