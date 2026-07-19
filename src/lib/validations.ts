import { z } from "zod"

export const loginSchema = z.object({
  name: z.string().min(1, "请输入用户名或邮箱"),
  password: z.string().min(6, "密码至少 6 个字符"),
})

export const registerSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .min(1, "请输入邀请码")
    .max(32, "邀请码格式不正确"),
  name: z
    .string()
    .min(2, "用户名至少 2 个字符")
    .max(30, "用户名最多 30 个字符")
    .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, "用户名只能包含中英文、数字和下划线"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少 6 个字符"),
})

export const postSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200, "标题最多 200 个字符"),
  content: z.string().min(1, "内容不能为空"),
  categoryId: z.string().min(1, "请选择分类"),
})

export const commentSchema = z.object({
  content: z.string().min(1, "评论不能为空").max(5000, "评论最多 5000 个字符"),
  parentId: z.string().cuid("回复目标无效").optional().or(z.literal("")),
})

export const confessionSchema = z.object({
  content: z.string().min(1, "内容不能为空").max(2000, "表白内容最多 2000 个字符"),
})

export const profileSchema = z.object({
  name: z.string().min(2, "用户名至少 2 个字符").max(30, "用户名最多 30 个字符"),
  bio: z.string().max(200, "个人简介最多 200 个字符").optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type PostInput = z.infer<typeof postSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type ConfessionInput = z.infer<typeof confessionSchema>
export type ProfileInput = z.infer<typeof profileSchema>
