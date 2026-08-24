import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Workers 上不运行 next/image 的 Node 优化器，关闭优化
    // （本分支用于 Cloudflare 部署；Vercel 走 main 分支不受影响）
    unoptimized: true,
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

// 注意：本地开发不使用 Cloudflare 绑定（prisma 走 DATABASE_URL 直连），
// 因此不调用 initOpenNextCloudflareForDev()——它会在构建/开发时要求
// Hyperdrive 的本地模拟连接串，对当前双模式方案没有收益。
