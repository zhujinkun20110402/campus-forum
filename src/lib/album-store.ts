export interface WallPhoto {
  url: string
  thumb: string
  caption?: string
  uploadedAt: string
  uploadedBy: string
}

const CHEVERETO_URL = process.env.CHEVERETO_API_URL || "https://www.picgo.net"
const CHEVERETO_KEY = process.env.CHEVERETO_API_KEY || ""
const CHEVERETO_ALBUM = process.env.CHEVERETO_PHOTOWALL_ALBUM_ID || "oGZTj"

/**
 * 从图床相册页面 HTML 中解析所有照片
 * 直接提取 data-thumb 属性，无需逐个抓取图片页面
 */
export async function getPhotos(): Promise<WallPhoto[]> {
  try {
    const res = await fetch(`${CHEVERETO_URL}/album/${CHEVERETO_ALBUM}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!res.ok) {
      console.error("Album page fetch failed:", res.status)
      return []
    }

    const html = await res.text()

    // 提取 data-thumb 属性中的缩略图 URL
    // 模式: data-thumb="https://origin.picgo.net/2026/06/20/filename.th.jpg"
    const thumbPattern =
      /data-thumb="(https?:\/\/origin\.[^"]+\.(?:th\.)?(?:jpg|jpeg|png|gif|webp))"/gi

    const photos: WallPhoto[] = []
    const seen = new Set<string>()
    let match: RegExpExecArray | null

    while ((match = thumbPattern.exec(html)) !== null) {
      const thumbUrl = match[1]

      // 从缩略图 URL 构造完整图 URL：去掉 .th
      // https://origin.picgo.net/.../filename.th.jpg -> https://origin.picgo.net/.../filename.jpg
      const fullUrl = thumbUrl.replace(/\.(th)\.(jpg|jpeg|png|gif|webp)/i, ".$2")

      if (seen.has(fullUrl)) continue
      seen.add(fullUrl)

      // 尝试从 data-object 提取标题
      // 在 data-thumb 附近查找 data-object 中的 display_title
      const nearbyHtml = html.substring(match.index, match.index + 500)
      const titleMatch = nearbyHtml.match(/"display_title":"([^"]*)"/)
      const title = titleMatch ? titleMatch[1] : ""

      photos.push({
        url: fullUrl,
        thumb: thumbUrl,
        caption: title || "",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "管理员",
      })
    }

    return photos
  } catch (error) {
    console.error("Fetch photos error:", error)
    return []
  }
}

/**
 * 删除照片 — 通过 Chevereto API 删除
 * 需要图片的 delete_id，从 data-object 中提取
 */
export async function removePhoto(url: string): Promise<WallPhoto[]> {
  try {
    // 先获取相册页面，找到该图片的 delete_id
    const res = await fetch(`${CHEVERETO_URL}/album/${CHEVERETO_ALBUM}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })
    const html = await res.text()

    // 在 HTML 中查找包含该 URL 的 data-object，提取 delete_id
    // data-object 是 URL 编码的 JSON
    const encodedUrl = url.replace(/\//g, "\\u002F")

    // 查找所有 data-object 并解析
    const objectPattern = /data-object='([^']+)'/g
    let objMatch: RegExpExecArray | null
    let deleteId: string | null = null
    let imageId: string | null = null

    while ((objMatch = objectPattern.exec(html)) !== null) {
      const raw = objMatch[1]
      // URL 解码
      const decoded = decodeURIComponent(raw)
      if (decoded.includes(url) || decoded.includes(encodedUrl)) {
        // 提取 id_encoded 和 delete_id
        const idMatch = decoded.match(/"id_encoded":"([^"]+)"/)
        const delMatch = decoded.match(/"delete_id":"([^"]+)"/)
        if (idMatch) imageId = idMatch[1]
        if (delMatch) deleteId = delMatch[1]
        break
      }
    }

    // 尝试通过 API 删除
    if (imageId) {
      try {
        const delRes = await fetch(`${CHEVERETO_URL}/api/1/images/${imageId}`, {
          method: "DELETE",
          headers: {
            "X-API-Key": CHEVERETO_KEY,
          },
        })
        if (delRes.ok) {
          // 删除成功，重新获取照片列表
          return await getPhotos()
        }
      } catch {
        // API 删除失败，忽略
      }
    }

    // 如果 API 删除失败，尝试通过 delete_id 页面删除
    if (deleteId) {
      try {
        await fetch(`${CHEVERETO_URL}/${deleteId}`, {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        })
      } catch {
        // 忽略
      }
    }

    // 无论如何重新获取列表
    return await getPhotos()
  } catch (error) {
    console.error("Remove photo error:", error)
    return await getPhotos()
  }
}
