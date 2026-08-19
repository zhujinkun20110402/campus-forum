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
    // 限制可能的输出尺寸组合，减少 Vercel 图片优化转换次数（省额度）
    deviceSizes: [640, 1080, 1920],
    imageSizes: [48, 96, 128],
  },
}

export default nextConfig
