import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPendingPhotos } from "@/lib/album-store"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "需要管理员权限" }, { status: 403 })
  }

  try {
    const photos = await getPendingPhotos()
    return NextResponse.json({ success: true, photos })
  } catch (error) {
    console.error("Fetch pending photos error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "获取待审核照片失败" },
      { status: 500 }
    )
  }
}