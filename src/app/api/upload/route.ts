import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "未上传文件" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    const ext = path.extname(file.name) || ".bin"
    const uniqueName = `${crypto.randomUUID()}${ext}`
    const filePath = path.join(uploadsDir, uniqueName)

    await writeFile(filePath, buffer)

    return NextResponse.json({ url: `/uploads/${uniqueName}` })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}