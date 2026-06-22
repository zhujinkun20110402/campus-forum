"use client"

import { useState } from "react"
import { banUser, unbanUser } from "@/lib/actions"
import { Button } from "@/components/ui/button"

interface BanUserButtonProps {
  userId: string
  userName: string
  isBanned: boolean
}

export function BanUserButton({ userId, userName, isBanned }: BanUserButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    const confirmed = isBanned
      ? window.confirm(`确定要解封用户 "${userName}" 吗？`)
      : window.confirm(`确定要封禁用户 "${userName}" 吗？`)
    if (!confirmed) return

    setLoading(true)
    try {
      if (isBanned) {
        await unbanUser(userId)
      } else {
        await banUser(userId)
      }
    } catch (error) {
      console.error(error)
      alert("操作失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={isBanned ? "outline" : "destructive"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={isBanned ? "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" : ""}
    >
      {loading ? "处理中..." : (isBanned ? "解封" : "封禁")}
    </Button>
  )
}