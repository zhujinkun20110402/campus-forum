import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const CHEVERETO_URL = process.env.CHEVERETO_API_URL || "https://www.picgo.net"
const CHEVERETO_KEY = process.env.CHEVERETO_API_KEY || ""
const CHEVERETO_ALBUM = process.env.CHEVERETO_ALBUM_ID || "otxRh"
const CHEVERETO_PHOTOWALL_ALBUM = process.env.CHEVERETO_PHOTOWALL_ALBUM_ID || "oGZTj"
const CHEVERETO_PENDING_ALBUM = process.env.CHEVERETO_PENDING_ALBUM_ID || ""

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("source") as File | null
    const target = formData.get("target") as string | null
    const caption = (formData.get("caption") as string | null) || ""

    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 })
    }

    const isAdmin = session.user.role === "ADMIN"
    const isPhotowall = target === "photowall"

    // 照片墙：非管理员上传到待审核相册，管理员直接上传到公开相册
    let albumId: string
    if (isPhotowall) {
      if (isAdmin) {
        albumId = CHEVERETO_PHOTOWALL_ALBUM
      } else if (CHEVERETO_PENDING_ALBUM) {
        albumId = CHEVERETO_PENDING_ALBUM
      } else {
        return NextResponse.json({ error: "未配置待审核相册，暂时无法上传" }, { status: 500 })
      }
    } else {
      albumId = CHEVERETO_ALBUM
    }

    const uploadData = new FormData()
    uploadData.append("source", file)
    uploadData.append("album_id", albumId)
    uploadData.append("format", "json")

    // 照片墙备注：管理员只写 caption；普通用户追加 uploader 信息用于审核展示
    if (isPhotowall && caption) {
      if (isAdmin) {
        uploadData.append("title", caption)
      } else {
        const uploaderName = session.user.name || session.user.email || "未知用户"
        uploadData.append("title", `${caption} -- uploader:${uploaderName}`)
      }
    }

    const res = await fetch(`${CHEVERETO_URL}/api/1/upload`, {
      method: "POST",
      headers: {
        "X-API-Key": CHEVERETO_KEY,
      },
      body: uploadData,
    })

    const json = await res.json()

    if (json.status_code !== 200) {
      return NextResponse.json(
        { error: json.status_txt || "上传失败" },
        { status: 400 }
      )
    }

    const imageUrl = json.image?.url || json.image?.display_url || json.image?.url_viewer

    if (!imageUrl) {
      return NextResponse.json({ error: "未获取到图片地址" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
      name: json.image?.original_filename || file.name,
      pending: isPhotowall && !isAdmin,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}