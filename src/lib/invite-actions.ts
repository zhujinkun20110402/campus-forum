"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { createAdminInviteCodes, MAX_ADMIN_INVITE_BATCH } from "@/lib/invitations"

const generateInviteSchema = z.object({
  count: z.coerce.number().int().min(1).max(MAX_ADMIN_INVITE_BATCH),
})

export async function generateAdminInviteCodes(_previousState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false as const, message: "需要管理员权限" }
  }

  const validated = generateInviteSchema.safeParse({ count: formData.get("count") })
  if (!validated.success) {
    return { success: false as const, message: `每次可生成 1-${MAX_ADMIN_INVITE_BATCH} 个邀请码` }
  }

  try {
    const codes = await createAdminInviteCodes(session.user.id, validated.data.count)
    revalidatePath("/invites")
    revalidatePath("/admin")
    return { success: true as const, message: `已生成 ${codes.length} 个永久邀请码`, codes }
  } catch (error) {
    console.error("Generate invite codes failed:", error)
    return { success: false as const, message: "生成失败，请稍后重试" }
  }
}
