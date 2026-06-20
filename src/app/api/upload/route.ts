import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const CHEVERETO_URL = process.env.CHEVERETO_API_URL || "https://www.picgo.net"
const CHEVERETO_KEY = process.env.CHEVERETO_API_KEY || "chv_kkQXd_0398dadc9d770f43361d0d656a9d662c674ff9d4dd7ad7b7e7d55d2c566348ef_3599f5ac754e2bc39582c0898781e2436dedcd2fd08d1bad16f32b84b65202ab"
const CHEVERETO_ALBUM = process.env.CHEVERETO_ALBUM_ID || "otxRh"
const CHEVERETO_PHOTOWALL_ALBUM = process.env.CHEVERETO_PHOTOWALL_ALBUM_ID || "oGZTj"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("source") as File | null
    const target = formData.get("target") as string | null

    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 })
    }

    const albumId = target === "photowall" ? CHEVERETO_PHOTOWALL_ALBUM : CHEVERETO_ALBUM

    const uploadData = new FormData()
    uploadData.append("source", file)
    uploadData.append("album_id", albumId)
    uploadData.append("format", "json")

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
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}
