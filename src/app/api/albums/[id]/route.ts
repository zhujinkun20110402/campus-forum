import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAlbumById, updateAlbum, deleteAlbum, addPhoto, removePhoto } from "@/lib/album-store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const album = await getAlbumById(id)
  if (!album) {
    return NextResponse.json({ error: "相册不存在" }, { status: 404 })
  }
  return NextResponse.json(album)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { id } = await params
  const album = await getAlbumById(id)
  if (!album) {
    return NextResponse.json({ error: "相册不存在" }, { status: 404 })
  }

  if (album.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "没有权限" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.title !== undefined) updates.title = body.title
    if (body.description !== undefined) updates.description = body.description
    if (body.coverUrl !== undefined) updates.coverUrl = body.coverUrl
    if (body.isFeatured !== undefined && session.user.role === "ADMIN") {
      updates.isFeatured = body.isFeatured
    }

    // Handle photo operations
    if (body.addPhoto) {
      const updated = await addPhoto(id, body.addPhoto)
      return NextResponse.json(updated)
    }
    if (body.removePhoto) {
      const updated = await removePhoto(id, body.removePhoto)
      return NextResponse.json(updated)
    }

    const updated = await updateAlbum(id, updates)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update album error:", error)
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { id } = await params
  const album = await getAlbumById(id)
  if (!album) {
    return NextResponse.json({ error: "相册不存在" }, { status: 404 })
  }

  if (album.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "没有权限" }, { status: 403 })
  }

  const success = await deleteAlbum(id)
  if (!success) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
