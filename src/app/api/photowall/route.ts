import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPhotos, addPhoto, removePhoto, updatePhotoCaption } from "@/lib/album-store"

export async function GET() {
  const photos = await getPhotos()
  return NextResponse.json(photos)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "需要管理员权限" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { url, caption } = body

    if (!url) {
      return NextResponse.json({ error: "缺少图片地址" }, { status: 400 })
    }

    const photos = await addPhoto({
      url,
      caption: caption ?? "",
      uploadedAt: new Date().toISOString(),
      uploadedBy: session.user.name ?? "管理员",
    })

    return NextResponse.json(photos, { status: 201 })
  } catch (error) {
    console.error("Add photo error:", error)
    return NextResponse.json({ error: "添加失败" }, { status: 500 })
  }
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
    return NextResponse.json(photos)
  } catch (error) {
    console.error("Remove photo error:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "需要管理员权限" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { url, caption } = body

    if (!url) {
      return NextResponse.json({ error: "缺少图片地址" }, { status: 400 })
    }

    const photos = await updatePhotoCaption(url, caption ?? "")
    return NextResponse.json(photos)
  } catch (error) {
    console.error("Update photo error:", error)
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}
