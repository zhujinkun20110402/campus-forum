import { promises as fs } from "fs"
import path from "path"

export interface WallPhoto {
  url: string
  caption?: string
  uploadedAt: string
  uploadedBy: string
}

const CHEVERETO_URL = process.env.CHEVERETO_API_URL || "https://www.picgo.net"
const CHEVERETO_KEY = process.env.CHEVERETO_API_KEY || ""
const CHEVERETO_ALBUM = process.env.CHEVERETO_PHOTOWALL_ALBUM_ID || "oGZTj"

// 本地文件仅存储 caption 覆盖
const DATA_DIR = path.join(process.cwd(), "data")
const CAPTIONS_FILE = path.join(DATA_DIR, "photowall-captions.json")

async function ensureCaptionsFile() {
  try {
    await fs.access(CAPTIONS_FILE)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(CAPTIONS_FILE, "{}", "utf-8")
  }
}

async function readCaptions(): Promise<Record<string, string>> {
  await ensureCaptionsFile()
  try {
    const raw = await fs.readFile(CAPTIONS_FILE, "utf-8")
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function writeCaptions(captions: Record<string, string>) {
  await ensureCaptionsFile()
  await fs.writeFile(CAPTIONS_FILE, JSON.stringify(captions, null, 2), "utf-8")
}

/**
 * 从图床获取相册中的所有照片
 * 先尝试 API，失败则抓取相册页面 HTML 解析
 */
export async function getPhotos(): Promise<WallPhoto[]> {
  const captions = await readCaptions()

  try {
    // 尝试 Chevereto API 获取图片列表
    const res = await fetch(
      `${CHEVERETO_URL}/api/1/images?album_id=${CHEVERETO_ALBUM}&format=json&per_page=100`,
      {
        headers: { "X-API-Key": CHEVERETO_KEY },
      }
    )

    if (res.ok) {
      const json = await res.json()
      if (json.status_code === 200 && Array.isArray(json.images)) {
        return json.images.map((img: Record<string, unknown>) => {
          const imgUrl = (img.url as string) || ((img.image as Record<string, unknown>)?.url as string) || ""
          return {
            url: imgUrl,
            caption: captions[imgUrl] ?? (img.title as string) ?? "",
            uploadedAt: (img.date_gmt as string) || new Date().toISOString(),
            uploadedBy: "管理员",
          }
        })
      }
    }
  } catch {
    // API 不可用，回退到 HTML 抓取
  }

  // 回退：抓取相册页面 HTML，解析图片链接
  try {
    const res = await fetch(`${CHEVERETO_URL}/album/${CHEVERETO_ALBUM}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    })
    const html = await res.text()

    // 提取所有图片查看页链接
    const imagePagePattern = /href="([^"]*\/image\/[^"]+)"/g
    const imagePages: string[] = []
    let match: RegExpExecArray | null
    while ((match = imagePagePattern.exec(html)) !== null) {
      const url = match[1]
      if (!imagePages.includes(url)) {
        imagePages.push(url)
      }
    }

    // 限制并发，最多取前 50 张
    const pages = imagePages.slice(0, 50)
    const photos: WallPhoto[] = []

    // 并发获取每张图片的直接 URL（每批 5 个）
    for (let i = 0; i < pages.length; i += 5) {
      const batch = pages.slice(i, i + 5)
      const results = await Promise.allSettled(
        batch.map(async (pageUrl) => {
          const fullUrl = pageUrl.startsWith("http") ? pageUrl : `${CHEVERETO_URL}${pageUrl}`
          const imgRes = await fetch(fullUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
          })
          const imgHtml = await imgRes.text()

          // 提取直接图片 URL（origin.picgo.net 域名）
          const urlMatch = imgHtml.match(/https?:\/\/origin\.[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp)/i)
          if (urlMatch) {
            return {
              url: urlMatch[0],
              caption: captions[urlMatch[0]] ?? "",
              uploadedAt: new Date().toISOString(),
              uploadedBy: "管理员",
            }
          }
          return null
        })
      )

      for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
          photos.push(result.value)
        }
      }
    }

    return photos
  } catch (error) {
    console.error("Fetch photos error:", error)
    return []
  }
}

export async function addPhoto(photo: WallPhoto): Promise<WallPhoto[]> {
  // 照片已通过上传 API 直接传到图床相册
  // 这里仅保存 caption
  if (photo.caption) {
    const captions = await readCaptions()
    captions[photo.url] = photo.caption
    await writeCaptions(captions)
  }
  return await getPhotos()
}

export async function removePhoto(url: string): Promise<WallPhoto[]> {
  // 从本地 caption 记录中移除
  const captions = await readCaptions()
  delete captions[url]
  await writeCaptions(captions)
  // 注意：不会从图床删除照片，需要管理员去图床后台删除
  return await getPhotos()
}

export async function updatePhotoCaption(url: string, caption: string): Promise<WallPhoto[]> {
  const captions = await readCaptions()
  captions[url] = caption
  await writeCaptions(captions)
  return await getPhotos()
}
