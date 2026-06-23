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
const CHEVERETO_PENDING_ALBUM = process.env.CHEVERETO_PENDING_ALBUM_ID || "oQSUd"

interface ParsedPhoto {
  fullUrl: string
  thumbUrl: string
  title: string
  deleteId?: string
  imageId?: string
}

/**
 * 从指定相册页面 HTML 中解析所有照片
 */
async function parseAlbumPhotos(albumId: string): Promise<ParsedPhoto[]> {
  const res = await fetch(`${CHEVERETO_URL}/album/${albumId}`, {
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

  const thumbPattern =
    /data-thumb="(https?:\/\/origin\.[^"]+\.(?:th\.)?(?:jpg|jpeg|png|gif|webp))"/gi

  const photos: ParsedPhoto[] = []
  const seen = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = thumbPattern.exec(html)) !== null) {
    const thumbUrl = match[1]
    const fullUrl = thumbUrl.replace(/\.(th)\.(jpg|jpeg|png|gif|webp)/i, ".$2")

    if (seen.has(fullUrl)) continue
    seen.add(fullUrl)

    const nearbyHtml = html.substring(match.index, match.index + 800)
    const titleMatch = nearbyHtml.match(/"display_title":"([^"]*)"/)
    const title = titleMatch ? titleMatch[1] : ""

    // 尝试提取 delete_id 和 image id
    let deleteId: string | undefined
    let imageId: string | undefined
    const objectPattern = /data-object='([^']+)'/g
    let objMatch: RegExpExecArray | null
    const objectStart = Math.max(0, match.index - 1000)
    const objectWindow = html.substring(objectStart, match.index + 1000)
    while ((objMatch = objectPattern.exec(objectWindow)) !== null) {
      const raw = objMatch[1]
      try {
        const decoded = decodeURIComponent(raw)
        if (decoded.includes(fullUrl) || decoded.includes(thumbUrl)) {
          const idMatch = decoded.match(/"id_encoded":"([^"]+)"/)
          const delMatch = decoded.match(/"delete_id":"([^"]+)"/)
          if (idMatch) imageId = idMatch[1]
          if (delMatch) deleteId = delMatch[1]
          break
        }
      } catch {
        // 忽略解码失败的
      }
    }

    photos.push({
      fullUrl,
      thumbUrl: thumbUrl,
      title: title || "",
      deleteId,
      imageId,
    })
  }

  return photos
}

/**
 * 从图床相册页面 HTML 中解析所有已审核照片
 */
export async function getPhotos(): Promise<WallPhoto[]> {
  try {
    const parsed = await parseAlbumPhotos(CHEVERETO_ALBUM)
    return parsed.map((p) => ({
      url: p.fullUrl,
      thumb: p.thumbUrl,
      caption: p.title || undefined,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "管理员",
    }))
  } catch (error) {
    console.error("Fetch photos error:", error)
    return []
  }
}

/**
 * 获取待审核照片（普通用户上传）
 * 上传时会把用户名追加在 title 中
 */
export async function getPendingPhotos(): Promise<WallPhoto[]> {
  if (!CHEVERETO_PENDING_ALBUM) {
    console.warn("CHEVERETO_PENDING_ALBUM_ID not configured")
    return []
  }

  try {
    const parsed = await parseAlbumPhotos(CHEVERETO_PENDING_ALBUM)
    return parsed.map((p) => {
      // 从 title 中分离 caption 和 uploader
      // 格式: "caption -- uploader:userName" 或纯 caption
      const title = p.title || ""
      const uploaderMatch = title.match(/-- uploader:(.+)$/)
      const caption = uploaderMatch ? title.replace(/-- uploader:.+$/, "").trim() : title
      const uploadedBy = uploaderMatch ? uploaderMatch[1].trim() : "未知用户"

      return {
        url: p.fullUrl,
        thumb: p.thumbUrl,
        caption: caption || undefined,
        uploadedAt: new Date().toISOString(),
        uploadedBy,
      }
    })
  } catch (error) {
    console.error("Fetch pending photos error:", error)
    return []
  }
}

/**
 * 删除照片 — 通过 Chevereto API 删除
 */
async function deleteCheveretoImage(
  url: string,
  albumId: string
): Promise<boolean> {
  try {
    const parsed = await parseAlbumPhotos(albumId)
    const target = parsed.find((p) => p.fullUrl === url)

    if (!target) {
      console.error("Photo not found in album:", url)
      return false
    }

    // 优先通过 API 删除
    if (target.imageId) {
      try {
        const delRes = await fetch(`${CHEVERETO_URL}/api/1/images/${target.imageId}`, {
          method: "DELETE",
          headers: {
            "X-API-Key": CHEVERETO_KEY,
          },
        })
        if (delRes.ok) return true
      } catch {
        // API 删除失败，继续尝试 delete_id
      }
    }

    // 通过 delete_id 页面删除
    if (target.deleteId) {
      try {
        await fetch(`${CHEVERETO_URL}/${target.deleteId}`, {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        })
        return true
      } catch {
        return false
      }
    }

    return false
  } catch (error) {
    console.error("Delete chevereto image error:", error)
    return false
  }
}

/**
 * 删除已审核照片
 */
export async function removePhoto(url: string): Promise<WallPhoto[]> {
  await deleteCheveretoImage(url, CHEVERETO_ALBUM)
  return getPhotos()
}

/**
 * 拒绝/删除待审核照片
 */
export async function rejectPendingPhoto(url: string): Promise<WallPhoto[]> {
  if (!CHEVERETO_PENDING_ALBUM) throw new Error("未配置待审核相册")
  await deleteCheveretoImage(url, CHEVERETO_PENDING_ALBUM)
  return getPendingPhotos()
}

/**
 * 通过待审核照片：复制到公开相册并删除原待审核照片
 */
export async function approvePendingPhoto(url: string): Promise<WallPhoto[]> {
  if (!CHEVERETO_PENDING_ALBUM) throw new Error("未配置待审核相册")

  // 获取待审核照片信息
  const pending = await parseAlbumPhotos(CHEVERETO_PENDING_ALBUM)
  const target = pending.find((p) => p.fullUrl === url)

  if (!target) {
    throw new Error("待审核照片不存在")
  }

  // 分离 caption 和 uploader
  const title = target.title || ""
  const uploaderMatch = title.match(/-- uploader:(.+)$/)
  const caption = uploaderMatch ? title.replace(/-- uploader:.+$/, "").trim() : title

  // 上传到公开相册（通过 URL）
  const formData = new FormData()
  formData.append("source", target.fullUrl)
  formData.append("album_id", CHEVERETO_ALBUM)
  formData.append("title", caption)
  formData.append("format", "json")

  const uploadRes = await fetch(`${CHEVERETO_URL}/api/1/upload`, {
    method: "POST",
    headers: {
      "X-API-Key": CHEVERETO_KEY,
    },
    body: formData,
  })

  const uploadJson = await uploadRes.json()
  if (uploadJson.status_code !== 200) {
    throw new Error(uploadJson.status_txt || "审核通过失败")
  }

  // 删除待审核照片
  await deleteCheveretoImage(url, CHEVERETO_PENDING_ALBUM)

  return getPendingPhotos()
}