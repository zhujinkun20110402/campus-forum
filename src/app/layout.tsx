import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { Providers } from "@/components/layout/providers"
import { HeaderWrapper } from "@/components/layout/header-wrapper"
import { FooterWrapper } from "@/components/layout/footer-wrapper"
import { NavigationProgress } from "@/components/layout/navigation-progress"
import { ImportantNotice } from "@/components/layout/important-notice"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// CF 分支使用自托管字体（latin 子集，中文回退系统字体）：
// 本机构建/Cloudflare 构建都不依赖 Google Fonts 网络，渲染效果与之前一致。
const notoSerif = localFont({
  variable: "--font-noto-serif-sc",
  src: [
    { path: "../fonts/noto-serif-sc-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/noto-serif-sc-latin-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/noto-serif-sc-latin-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
})

const notoSans = localFont({
  variable: "--font-noto-sans-sc",
  src: [
    { path: "../fonts/noto-sans-sc-latin-300.woff2", weight: "300", style: "normal" },
    { path: "../fonts/noto-sans-sc-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/noto-sans-sc-latin-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/noto-sans-sc-latin-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
})

const jetbrainsMono = localFont({
  variable: "--font-jetbrains-mono",
  src: [
    { path: "../fonts/jetbrains-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/jetbrains-mono-latin-500.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
})

export const metadata: Metadata = {
  title: "学生论坛 · 鲜活校园",
  description:
    "属于同学们的学生论坛社区，分享学习、活动、失物招领与每一个值得记录的校园故事。",
  icons: {
    icon: "/images/app-icon.png",
    apple: "/images/app-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  const ownStatus = session?.user?.id
    ? await prisma.campusStatus.findFirst({
        where: { userId: session.user.id, expiresAt: { gt: new Date() } },
        select: { color: true, emoji: true },
      })
    : null

  return (
    <html
      lang="zh-CN"
      className={`${notoSerif.variable} ${notoSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.add('light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f4efe4] text-[#191914] dark:bg-[#11110f] dark:text-[#f5f0e5]">
        <Providers session={session}>
          <NavigationProgress />
          <HeaderWrapper ownStatus={ownStatus} />
          <main className="flex-1">{children}</main>
          <FooterWrapper />
          <ImportantNotice />
        </Providers>
      </body>
    </html>
  )
}
