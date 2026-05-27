"use client"

import { useState } from "react"
import { banUser } from "@/lib/actions"
import { Button } from "@/components/ui/button"

interface BanUserButtonProps {
  userId: string
  userName: string
}

export function BanUserButton({ userId, userName }: BanUserButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleBan = async () => {
    const confirmed = window.confirm(`确定要封禁用户 "${userName}" 吗？`)
    if (!confirmed) return

    setLoading(true)
    try {
      await banUser(userId)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleBan}
      disabled={loading}
    >
      {loading ? "处理中..." : "封禁"}
    </Button>
  )
}