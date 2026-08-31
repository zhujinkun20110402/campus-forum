import { redirect } from "next/navigation"

/**
 * 兼容重定向：项目历史字段拼写为 raputation（无 e），
 * 用户手输 URL 时容易打错，这里兜底跳转到正确路径。
 */
export default function RaputationRedirectPage() {
  redirect("/reputation")
}
