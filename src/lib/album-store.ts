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
 * 从指定相册页面 HTML 中解析照片
 * 只解析单页 HTML，返回该页的照片
 */
async function parseAlbumPage(html: string): Promise<ParsedPhoto[]> {
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
 * 从 HTML 中提取下一页的 URL（含 peek 参数）
 * Chevereto 分页使用 peek 令牌，不能简单拼接 page=N
 */
function extractNextPageUrl(html: string): string | null {
  // 策略1: 查找 rel="next" 的链接
  const patterns = [
    /<a[^>]+href="([^"]+)"[^>]*rel="next"/i,
    /<a[^>]+rel="next"[^>]*href="([^"]+)"/i,
    /<a[^>]+data-pagination="next"[^>]*href="([^"]+)"/i,
    /<a[^>]+href="([^"]+)"[^>]*data-pagination="next"/i,
    /<a[^>]+class="[^"]*pagination-next[^"]*"[^>]*href="([^"]+)"/i,
    /<a[^>]+href="([^"]+)"[^>]*class="[^"]*pagination-next[^"]*"/i,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m && m[1] && !m[1].includes("javascript:")) {
      // 确保 URL 是完整的
      const url = m[1]
      if (url.startsWith("http")) return url
      return `${CHEVERETO_URL}${url}`
    }
  }
  return null
}

/**
 * 从指定相册分页抓取所有照片
 * Chevereto 每页显示 24 张，分页需要 peek 令牌
 */
async function parseAlbumPhotos(albumId: string): Promise<ParsedPhoto[]> {
  const allPhotos: ParsedPhoto[] = []
  const seenUrls = new Set<string>()
  const MAX_PAGES = 200 // 安全上限

  // 第一页 URL
  let pageUrl: string | null = `${CHEVERETO_URL}/album/${albumId}`

  for (let page = 1; page <= MAX_PAGES && pageUrl; page++) {
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!res.ok) {
      console.error(`Album page ${page} fetch failed:`, res.status)
      break
    }

    const html = await res.text()
    const pagePhotos = await parseAlbumPage(html)

    // 如果本页没有新照片，说明已经到最后一页
    let newCount = 0
    for (const photo of pagePhotos) {
      if (!seenUrls.has(photo.fullUrl)) {
        seenUrls.add(photo.fullUrl)
        allPhotos.push(photo)
        newCount++
      }
    }

    if (newCount === 0) {
      break
    }

    // 从 HTML 中提取下一页 URL（含 peek 参数）
    pageUrl = extractNextPageUrl(html)

    // 页间短暂等待
    await new Promise((r) => setTimeout(r, 300))
  }

  return allPhotos
}

/**
 * 从图床相册页面 HTML 中解析所有已审核照片
 * 带 5 分钟内存缓存，避免每次请求都抓取 40+ 页
 */
let photosCache: WallPhoto[] | null = null
let photosCacheTime = 0
const PHOTOS_CACHE_TTL = 5 * 60 * 1000 // 5 分钟

export async function getPhotos(): Promise<WallPhoto[]> {
  const now = Date.now()

  // 缓存有效，直接返回
  if (photosCache && now - photosCacheTime < PHOTOS_CACHE_TTL) {
    return photosCache
  }

  try {
    const parsed = await parseAlbumPhotos(CHEVERETO_ALBUM)
    const result = parsed.map((p) => ({
      url: p.fullUrl,
      thumb: p.thumbUrl,
      caption: p.title || undefined,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "管理员",
    }))

    photosCache = result
    photosCacheTime = now
    return result
  } catch (error) {
    console.error("Fetch photos error:", error)
    // 出错时返回过期缓存（比空列表好）
    return photosCache ?? []
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