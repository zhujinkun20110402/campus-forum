import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPhotos, removePhoto } from "@/lib/album-store"

export async function GET() {
  const photos = await getPhotos()
  return NextResponse.json(photos)
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "需要管理员权限" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "缺少图片地址" }, { status: 400 })
    }

    const photos = await removePhoto(url)
    return NextResponse.json({ success: true, photos })
  } catch (error) {
    console.error("Remove photo error:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
