import Link from "next/link"
import { ArrowLeft, Camera } from "lucide-react"
import { EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { requireUser } from "@/lib/session"

export default async function PhotowallPage() {
  await requireUser("/album")

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="04"
        eyebrow="CAMPUS ARCHIVE"
        title="校园影像档案"
        description="镜头不会让时间停下，但会替我们记住那些真实、热烈又稍纵即逝的校园现场。"
        icon={Camera}
        accentClass="bg-[#f3c84b]"
        compact
      >
        <Link href="/" className="inline-flex items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 py-2 text-xs font-bold dark:border-[#f5f0e5] dark:bg-[#191914]">
          <ArrowLeft className="h-4 w-4" /> 返回首页
        </Link>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <EditorialPanel className="px-6 py-16 text-center sm:px-10 sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-[#191914] bg-[#ffb4aa] text-[#b52f1e] dark:border-[#f5f0e5]">
              <Camera className="h-7 w-7" />
            </div>
            <p className="mt-5 font-serif text-3xl font-bold">校园相册已关闭</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#69655d] dark:text-[#aaa69c]">
              校园相册曾使用学校公众号图片资源，为规避版权问题，本功能已关闭。感谢大家曾经的参与与记录。
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-5 text-sm font-bold text-[#191914] shadow-[4px_4px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[4px_4px_0_#f5f0e5]"
            >
              <ArrowLeft className="h-4 w-4" /> 回到论坛首页
            </Link>
          </EditorialPanel>
        </div>
      </main>
    </div>
  )
}
