import type { MetadataRoute } from "next"

/**
 * PWA Web App Manifest
 * Next.js 自动生成 /manifest.webmanifest 路由并在 <head> 注入 <link rel="manifest">
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "学生论坛 · 鲜活校园",
    short_name: "学生论坛",
    description:
      "属于同学们的学生论坛社区，分享学习、活动、失物招领与每一个值得记录的校园故事。",
    lang: "zh-CN",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fffaf0",
    theme_color: "#191914",
    icons: [
      { src: "/images/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/app-icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/images/app-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
