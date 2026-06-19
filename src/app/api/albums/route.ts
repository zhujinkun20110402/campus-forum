import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllAlbums, createAlbum } from "@/lib/album-store"

export async function GET() {
  const albums = await getAllAlbums()
  return NextResponse.json(albums)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, coverUrl, photos } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 })
    }

    const album = await createAlbum({
      title: title.trim(),
      description: description?.trim() ?? "",
      coverUrl: coverUrl ?? "",
      authorId: session.user.id,
      authorName: session.user.name ?? "匿名用户",
      photos: photos ?? [],
    })

    return NextResponse.json(album, { status: 201 })
  } catch (error) {
    console.error("Create album error:", error)
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}
