import { Camera, Images } from "lucide-react"
import { PhotowallAdmin } from "@/components/album/photowall-admin"
import { PhotowallGrid } from "@/components/album/photowall-grid"
import { PhotowallUploader } from "@/components/album/photowall-uploader"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { auth } from "@/lib/auth"
import { getPhotos } from "@/lib/album-store"

export const dynamic = "force-dynamic"

export default async function PhotowallPage() {
  const [photos, session] = await Promise.all([getPhotos(), auth()])
  const isAdmin = session?.user?.role === "ADMIN"
  const isLoggedIn = !!session?.user?.id

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="04"
        eyebrow="CAMPUS ARCHIVE"
        title="校园影像档案"
        description="镜头不会让时间停下，但会替我们记住那些真实、热烈又稍纵即逝的校园现场。"
        icon={Camera}
        accentClass="bg-[#f3c84b]"
      >
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] font-bold tracking-[0.12em]">
          <span className="flex items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 py-2 dark:border-[#f5f0e5] dark:bg-[#191914]">
            <Images className="h-3.5 w-3.5 text-[#e4532f]" /> {photos.length} FRAMES
          </span>
          <span className="border border-[#191914]/25 px-3 py-2 text-[#777268] dark:border-white/25 dark:text-[#989389]">CONTINUOUSLY UPDATED</span>
        </div>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <EditorialHeading
            index="01"
            eyebrow="PHOTO WALL"
            title="在场证明"
            meta={<span className="font-mono text-[10px] font-bold tracking-[0.12em]">CLICK A PHOTO TO EXPLORE</span>}
          />

          <div className="mt-8">
            {photos.length === 0 ? (
              <EditorialPanel className="py-24 text-center">
                <Camera className="mx-auto h-12 w-12 text-[#ff6b43]" />
                <p className="mt-4 font-serif text-2xl font-bold">影像档案正在筹备</p>
                <p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">第一张照片，也许就由你来上传。</p>
              </EditorialPanel>
            ) : (
              <PhotowallGrid photos={photos} isAdmin={isAdmin} />
            )}
          </div>

          {isLoggedIn && !isAdmin && <PhotowallUploader />}
          {isAdmin && <PhotowallAdmin />}
        </div>
      </main>
    </div>
  )
}
