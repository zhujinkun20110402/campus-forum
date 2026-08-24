"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { auth } from "@/lib/auth"
import { getBeijingMonthKey } from "@/lib/beijing-time"
import { NOTIFICATION_TYPES } from "@/lib/notifications"
import { getMonthlyPostcardQuota, POSTCARD_THEMES } from "@/lib/postcard-constants"
import { cleanupExpiredPostcards } from "@/lib/postcards"
import { prisma } from "@/lib/prisma"
import { awardRelationshipXp } from "@/lib/relationship-actions"

const postcardSchema = z.object({
  recipientId: z.string().trim().min(1, "请选择收件人").max(64, "收件人信息无效"),
  message: z.string().trim().min(1, "写几句话再寄出").max(500, "明信片最多 500 个字"),
  theme: z.enum(POSTCARD_THEMES.map((theme) => theme.value)),
  emoji: z.string().trim().max(16, "Emoji 太长了").optional(),
})

class PostcardRuleError extends Error {}
class PostcardQuotaRaceError extends Error {}

async function requireActiveUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new PostcardRuleError("请先登录")
  return session.user.id
}

export async function sendPostcard(_previousState: unknown, formData: FormData) {
  try {
    const senderId = await requireActiveUserId()
    const parsed = postcardSchema.safeParse({
      recipientId: formData.get("recipientId"),
      message: formData.get("message"),
      theme: formData.get("theme"),
      emoji: formData.get("emoji"),
    })

    if (!parsed.success) {
      return { success: false as const, message: parsed.error.issues[0]?.message ?? "请检查明信片内容" }
    }
    if (parsed.data.recipientId === senderId) {
      return { success: false as const, message: "明信片要寄给另一位校园成员" }
    }

    await cleanupExpiredPostcards()
    const now = new Date()
    const month = getBeijingMonthKey(now)
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    let result: { quota: number; used: number } | null = null
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        result = await prisma.$transaction(async (tx) => {
          const [sender, recipient] = await Promise.all([
            tx.user.findUnique({
              where: { id: senderId },
              select: { role: true, raputation: true, postcardQuotaMonth: true, postcardsSentThisMonth: true },
            }),
            tx.user.findUnique({
              where: { id: parsed.data.recipientId },
              select: { id: true, role: true },
            }),
          ])

          if (!sender || sender.role === "BANNED") throw new PostcardRuleError("当前账号无法寄送明信片")
          if (!recipient || recipient.role === "BANNED") throw new PostcardRuleError("收件人不存在或暂时无法收信")

          const quota = getMonthlyPostcardQuota(sender.raputation, sender.role)
          const used = sender.postcardQuotaMonth === month ? sender.postcardsSentThisMonth : 0
          if (used >= quota) throw new PostcardRuleError("本月的明信片已经全部寄出")

          const claim = sender.postcardQuotaMonth === month
            ? await tx.user.updateMany({
                where: {
                  id: senderId,
                  role: { not: "BANNED" },
                  postcardQuotaMonth: month,
                  postcardsSentThisMonth: { lt: quota },
                },
                data: { postcardsSentThisMonth: { increment: 1 } },
              })
            : await tx.user.updateMany({
                where: {
                  id: senderId,
                  role: { not: "BANNED" },
                  OR: [{ postcardQuotaMonth: null }, { postcardQuotaMonth: { not: month } }],
                },
                data: { postcardQuotaMonth: month, postcardsSentThisMonth: 1 },
              })

          if (claim.count === 0) throw new PostcardQuotaRaceError("QUOTA_CHANGED")

          await tx.postcard.create({
            data: {
              senderId,
              recipientId: parsed.data.recipientId,
              message: parsed.data.message,
              theme: parsed.data.theme,
              emoji: parsed.data.emoji || null,
              expiresAt,
            },
          })
          await tx.notification.create({
            data: {
              userId: parsed.data.recipientId,
              actorId: senderId,
              type: NOTIFICATION_TYPES.POSTCARD_RECEIVED,
            },
          })

          return { quota, used: used + 1 }
        })
        break
      } catch (error) {
        if (error instanceof PostcardQuotaRaceError && attempt === 0) continue
        throw error
      }
    }

    if (!result) throw new PostcardRuleError("额度状态发生变化，请重试")

    // 关系升温：给互绑好友寄明信片 +6 经验
    await awardRelationshipXp(senderId, parsed.data.recipientId, "POSTCARD")

    revalidatePath("/postcards")
    revalidatePath("/notifications")
    return {
      success: true as const,
      message: `明信片已寄出，将保留 7 天。本月还可寄 ${Math.max(0, result.quota - result.used)} 张`,
    }
  } catch (error) {
    if (error instanceof PostcardRuleError) return { success: false as const, message: error.message }
    return { success: false as const, message: "寄送没有完成，请稍后再试" }
  }
}

export async function openPostcard(postcardId: string) {
  try {
    const userId = await requireActiveUserId()
    const message = await prisma.$transaction(async (tx) => {
      const postcard = await tx.postcard.findFirst({
        where: { id: postcardId, recipientId: userId, expiresAt: { gt: new Date() } },
        select: { id: true, message: true, openedAt: true },
      })
      if (!postcard) throw new PostcardRuleError("这封明信片已经过期或不属于你")
      if (!postcard.openedAt) {
        await tx.postcard.update({ where: { id: postcard.id }, data: { openedAt: new Date() } })
      }
      return postcard.message
    })
    revalidatePath("/postcards")
    return { success: true as const, message }
  } catch (error) {
    return { success: false as const, message: error instanceof PostcardRuleError ? error.message : "暂时无法打开这封明信片" }
  }
}
