"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getFeatureRep, hasFeature } from "@/lib/reputation-milestones"

const DAY_MS = 24 * 60 * 60 * 1000

const challengeSchema = z.object({
  title: z.string().trim().min(4, "标题至少 4 个字").max(60, "标题最多 60 个字"),
  description: z.string().trim().max(200, "说明最多 200 个字").optional().or(z.literal("")),
  endsAt: z.string().min(1, "请选择结束时间"),
})

/** 发起话题挑战（声望 6800 解锁；同一时间只能有一个进行中的挑战） */
export async function createChallenge(_previousState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { raputation: true, role: true },
  })
  if (!user) redirect("/auth/signin")
  if (user.role === "BANNED") return { message: "账号已被封禁" }

  if (!hasFeature(user.raputation, "topicChallenge")) {
    return { message: `声望达到 ${getFeatureRep("topicChallenge")} 才能发起话题挑战` }
  }

  const validated = challengeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    endsAt: formData.get("endsAt"),
  })
  if (!validated.success) {
    return { message: validated.error.issues[0]?.message ?? "请检查表单填写" }
  }

  const endsAt = new Date(validated.data.endsAt)
  const now = Date.now()
  if (Number.isNaN(endsAt.getTime())) return { message: "结束时间格式不正确" }
  if (endsAt.getTime() < now + DAY_MS) return { message: "结束时间至少要在 1 天之后" }
  if (endsAt.getTime() > now + 30 * DAY_MS) return { message: "结束时间最多 30 天之后" }

  const active = await prisma.topicChallenge.findFirst({
    where: { createdById: session.user.id, endsAt: { gt: new Date() } },
    select: { id: true },
  })
  if (active) return { message: "你已经有一个进行中的话题挑战，等它结束后再发起" }

  const challenge = await prisma.topicChallenge.create({
    data: {
      title: validated.data.title,
      description: validated.data.description ? validated.data.description : null,
      createdById: session.user.id,
      endsAt,
    },
    select: { id: true },
  })

  revalidatePath("/challenges")
  redirect(`/challenges/${challenge.id}`)
}
