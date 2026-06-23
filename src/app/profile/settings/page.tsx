import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ProfileForm } from "@/components/profile/profile-form"
import { UserAvatar } from "@/components/user/user-avatar"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { Shield, Sparkles, Crown } from "lucide-react"

export default async function ProfileSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      bio: true,
      role: true,
    },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  const profileUser = {
    name: user.name,
    email: user.email ?? "",
    image: user.image,
    bio: user.bio,
    role: user.role,
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-indigo-950">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 pt-28 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.06),_transparent_60%)]" />
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <UserAvatar
                name={user.name}
                image={user.image}
                role={user.role}
                size="xl"
              />
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    账号设置
                  </h1>
                  {user.role === "ADMIN" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">
                      <Crown className="h-3 w-3" />
                      管理员
                    </span>
                  )}
                </div>
                <p className="text-sm text-indigo-300/50">
                  管理你的个人资料和头像
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Form */}
      <div className="relative -mt-6 mx-auto max-w-2xl px-4 sm:px-6 pb-20">
        <ScrollReveal>
          <div className="rounded-3xl bg-white dark:bg-indigo-900/40 border border-slate-200 dark:border-indigo-800/60 shadow-xl shadow-slate-200/20 dark:shadow-indigo-950/30 p-6 sm:p-8">
            <ProfileForm user={profileUser} />
          </div>
        </ScrollReveal>

        {/* Security Note */}
        <ScrollReveal delay={0.1}>
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-950 border border-indigo-800/40 p-5">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-800/50 flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-gold-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">账号安全</h3>
                <p className="text-xs text-indigo-300/50 leading-relaxed">
                  你的个人信息受到保护。我们不会向第三方分享你的数据。
                  邮箱地址用于登录和找回密码，不可修改。
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-gold-400" />
            <span>北京二中经开区学校 · 校园论坛</span>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
