import { redirect } from "next/navigation"
import { Crown, Settings, Shield } from "lucide-react"
import { ProfileForm } from "@/components/profile/profile-form"
import { LevelBadge } from "@/components/reputation/level-badge"
import { ReputationBar } from "@/components/reputation/reputation-bar"
import { UserAvatar } from "@/components/user/user-avatar"
import { EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"

export default async function ProfileSettingsPage() {
  const sessionUser = await requireUser("/profile/settings")

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { name: true, email: true, image: true, bio: true, role: true, raputation: true },
  })

  if (!user) redirect("/auth/signin")

  const profileUser = {
    name: user.name,
    email: user.email ?? "",
    image: user.image,
    bio: user.bio,
    role: user.role,
  }

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="06"
        eyebrow="PROFILE STUDIO"
        title="把主页整理成你自己"
        description="更新头像、名字和个人简介，让同学们更容易认识屏幕另一边真实而鲜活的你。"
        icon={Settings}
        accentClass="bg-[#b9ddbd]"
        compact
      >
        <div className="flex flex-wrap items-center gap-3">
          <UserAvatar name={user.name} image={user.image} role={user.role} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold">{user.name ?? "未命名用户"}</span>
              {user.role === "ADMIN" && <Crown className="h-4 w-4 text-[#e4532f]" />}
              <LevelBadge raputation={user.raputation} role={user.role} size="xs" />
            </div>
            <p className="mt-1 font-mono text-[9px] tracking-[0.12em] text-[#777268] dark:text-[#989389]">SIGNED IN AS {user.email}</p>
          </div>
        </div>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-5xl items-start gap-7 lg:grid-cols-[minmax(0,1fr)_310px]">
          <EditorialPanel className="p-6 sm:p-8">
            <div className="mb-7 border-b-2 border-[#191914] pb-5 dark:border-[#f5f0e5]">
              <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">BASIC INFORMATION</p>
              <h2 className="mt-2 font-serif text-2xl font-bold">个人资料</h2>
            </div>
            <ProfileForm user={profileUser} />
          </EditorialPanel>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <ReputationBar raputation={user.raputation} role={user.role} className="rounded-none border-2 border-[#191914] bg-[#f3c84b] text-[#191914] shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#292821] dark:shadow-[5px_5px_0_#f5f0e5]" />

            <div className="border-2 border-[#191914] bg-[#191914] p-5 text-[#f5f0e5] shadow-[5px_5px_0_#ff6b43] dark:border-[#f5f0e5]">
              <div className="flex h-9 w-9 items-center justify-center border border-white/40 bg-[#d9ef61] text-[#191914]">
                <Shield className="h-4 w-4" />
              </div>
              <p className="mt-4 font-mono text-[9px] font-bold tracking-[0.16em] text-[#ff8a68]">PRIVACY NOTE</p>
              <h3 className="mt-2 font-serif text-xl font-bold">账号安全</h3>
              <p className="mt-3 text-xs leading-6 text-white/55">
                邮箱仅用于登录与账号识别，不会在个人主页公开，也不会向第三方分享。
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
