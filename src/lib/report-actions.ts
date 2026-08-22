"use server"

import { revalidatePath } from "next/cache"
import { banUser } from "@/lib/actions"
import { auth } from "@/lib/auth"
import { NOTIFICATION_TYPES } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { REPORT_STATUS } from "@/lib/report-config"
import { adjustRaputation, REP_POINTS } from "@/lib/reputation.server"
import { reportSchema } from "@/lib/validations"

class ReportRuleError extends Error {}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new ReportRuleError("请先登录")
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || user.role !== "ADMIN") throw new ReportRuleError("只有管理员可以处理举报")
  return session.user.id
}

type ActionResult = { success: boolean; message: string }

function fail(error: unknown): ActionResult {
  return {
    success: false,
    message: error instanceof ReportRuleError ? error.message : "操作没有完成，请稍后再试",
  }
}

/**
 * 用户提交举报（帖子或评论）。
 */
export async function submitReport(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new ReportRuleError("请先登录")
    const viewerId = session.user.id

    const validated = reportSchema.safeParse({
      targetType: formData.get("targetType"),
      targetId: formData.get("targetId"),
      reason: formData.get("reason"),
      detail: formData.get("detail"),
    })
    if (!validated.success) {
      return { success: false, message: validated.error.issues[0]?.message ?? "请检查填写内容" }
    }
    const { targetType, targetId, reason, detail } = validated.data

    // 目标存在性校验 + 不能举报自己的内容
    if (targetType === "POST") {
      const post = await prisma.post.findUnique({
        where: { id: targetId },
        select: { id: true, authorId: true },
      })
      if (!post) return { success: false, message: "帖子不存在或已被删除" }
      if (post.authorId === viewerId) return { success: false, message: "不能举报自己的内容" }
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: targetId },
        select: { id: true, authorId: true },
      })
      if (!comment) return { success: false, message: "评论不存在或已被删除" }
      if (comment.authorId === viewerId) return { success: false, message: "不能举报自己的内容" }
    }

    // 同一用户对同一内容只保留一条待处理举报
    const existing = await prisma.report.findFirst({
      where: { reporterId: viewerId, targetType, targetId, status: REPORT_STATUS.PENDING },
      select: { id: true },
    })
    if (existing) return { success: false, message: "你已举报过该内容，请等待管理员处理" }

    await prisma.report.create({
      data: { reporterId: viewerId, targetType, targetId, reason, detail: detail || null },
    })

    // 通知所有管理员
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    })
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          actorId: viewerId,
          type: NOTIFICATION_TYPES.REPORT_CREATED,
        })),
      })
    }

    revalidatePath("/admin")
    return { success: true, message: "举报已提交，管理员会尽快核实处理" }
  } catch (error) {
    return fail(error)
  }
}

/**
 * 管理员处理举报：一键删除被举报的内容并通知相关人员。
 */
export async function resolveReportByDelete(reportId: string): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    const report = await prisma.report.findFirst({
      where: { id: reportId, status: REPORT_STATUS.PENDING },
    })
    if (!report) return { success: false, message: "该举报不存在或已被处理" }

    if (report.targetType === "POST") {
      const post = await prisma.post.findUnique({
        where: { id: report.targetId },
        select: { id: true, authorId: true },
      })
      if (post) {
        await prisma.post.delete({ where: { id: post.id } })
        await adjustRaputation(post.authorId, -REP_POINTS.POST_DELETED)
        if (post.authorId !== adminId) {
          await prisma.notification.create({
            data: { userId: post.authorId, actorId: adminId, type: NOTIFICATION_TYPES.REPORT_CONTENT_DELETED },
          })
        }
      }
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: report.targetId },
        select: { id: true, authorId: true },
      })
      if (comment) {
        await prisma.comment.delete({ where: { id: comment.id } })
        await adjustRaputation(comment.authorId, -REP_POINTS.COMMENT_DELETED)
        if (comment.authorId !== adminId) {
          await prisma.notification.create({
            data: { userId: comment.authorId, actorId: adminId, type: NOTIFICATION_TYPES.REPORT_CONTENT_DELETED },
          })
        }
      }
    }

    // 同内容上的其它待处理举报一并结案
    await prisma.report.updateMany({
      where: {
        targetType: report.targetType,
        targetId: report.targetId,
        status: REPORT_STATUS.PENDING,
        id: { not: report.id },
      },
      data: { status: REPORT_STATUS.RESOLVED, handledById: adminId, handledAt: new Date() },
    })
    await prisma.report.update({
      where: { id: report.id },
      data: { status: REPORT_STATUS.RESOLVED, handledById: adminId, handledAt: new Date() },
    })

    if (report.reporterId && report.reporterId !== adminId) {
      await prisma.notification.create({
        data: { userId: report.reporterId, actorId: adminId, type: NOTIFICATION_TYPES.REPORT_RESOLVED },
      })
    }

    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/confession")
    return { success: true, message: "内容已删除，作者与举报人都已收到通知" }
  } catch (error) {
    return fail(error)
  }
}

/**
 * 管理员处理举报：封禁被举报内容的作者。
 */
export async function resolveReportByBan(reportId: string): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    const report = await prisma.report.findFirst({
      where: { id: reportId, status: REPORT_STATUS.PENDING },
    })
    if (!report) return { success: false, message: "该举报不存在或已被处理" }

    let authorId: string | null = null
    if (report.targetType === "POST") {
      const post = await prisma.post.findUnique({
        where: { id: report.targetId },
        select: { authorId: true, author: { select: { role: true } } },
      })
      if (post?.author.role === "ADMIN") return { success: false, message: "不能封禁管理员账号" }
      authorId = post?.authorId ?? null
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: report.targetId },
        select: { authorId: true, author: { select: { role: true } } },
      })
      if (comment?.author.role === "ADMIN") return { success: false, message: "不能封禁管理员账号" }
      authorId = comment?.authorId ?? null
    }
    if (!authorId) return { success: false, message: "内容已不存在，无需封禁" }

    // 复用现有封禁逻辑（声望 -50 + role=BANNED）
    await banUser(authorId)
    await prisma.notification.create({
      data: { userId: authorId, actorId: adminId, type: NOTIFICATION_TYPES.REPORT_USER_BANNED },
    })

    await prisma.report.update({
      where: { id: report.id },
      data: { status: REPORT_STATUS.RESOLVED, handledById: adminId, handledAt: new Date() },
    })
    if (report.reporterId && report.reporterId !== adminId) {
      await prisma.notification.create({
        data: { userId: report.reporterId, actorId: adminId, type: NOTIFICATION_TYPES.REPORT_RESOLVED },
      })
    }

    revalidatePath("/admin")
    revalidatePath("/leaderboard")
    return { success: true, message: "作者已封禁，举报人已收到处理通知" }
  } catch (error) {
    return fail(error)
  }
}

/**
 * 管理员处理举报：驳回（未构成违规）。
 */
export async function dismissReport(reportId: string): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin()
    const report = await prisma.report.findFirst({
      where: { id: reportId, status: REPORT_STATUS.PENDING },
    })
    if (!report) return { success: false, message: "该举报不存在或已被处理" }

    await prisma.report.update({
      where: { id: report.id },
      data: { status: REPORT_STATUS.DISMISSED, handledById: adminId, handledAt: new Date() },
    })
    if (report.reporterId && report.reporterId !== adminId) {
      await prisma.notification.create({
        data: { userId: report.reporterId, actorId: adminId, type: NOTIFICATION_TYPES.REPORT_DISMISSED },
      })
    }

    revalidatePath("/admin")
    return { success: true, message: "已驳回该举报，举报人已收到通知" }
  } catch (error) {
    return fail(error)
  }
}
