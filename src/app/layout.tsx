import type { Metadata } from "next"
import { Noto_Serif_SC, Noto_Sans_SC, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/layout/providers"
import { HeaderWrapper } from "@/components/layout/header-wrapper"
import { FooterWrapper } from "@/components/layout/footer-wrapper"
import { NavigationProgress } from "@/components/layout/navigation-progress"
import { auth } from "@/lib/auth"

const notoSerif = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
})

const notoSans = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "北京二中经开区学校 · 鲜活校园论坛",
  description:
    "属于北京二中经开区学校同学们的鲜活校园社区，分享学习、活动、失物招领与每一个值得记录的校园故事。",
  icons: {
    icon: "/images/school-logo.png",
    apple: "/images/school-logo.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

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
          <HeaderWrapper />
          <main className="flex-1">{children}</main>
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  )
}
