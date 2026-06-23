import { promises as fs } from "fs"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "pinned-posts.json")

interface PinnedPostsData {
  postIds: string[]
  updatedAt: string
}

async function readData(): Promise<PinnedPostsData> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8")
    const parsed = JSON.parse(content) as PinnedPostsData
    return {
      postIds: Array.isArray(parsed.postIds) ? parsed.postIds : [],
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    }
  } catch {
    return { postIds: [], updatedAt: new Date().toISOString() }
  }
}

async function writeData(data: PinnedPostsData) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
}

export async function getPinnedPostIds(): Promise<string[]> {
  const data = await readData()
  return data.postIds
}

export async function pinPost(postId: string): Promise<string[]> {
  const data = await readData()
  const ids = data.postIds.filter((id) => id !== postId)
  ids.unshift(postId)
  await writeData({ postIds: ids, updatedAt: new Date().toISOString() })
  return ids
}

export async function unpinPost(postId: string): Promise<string[]> {
  const data = await readData()
  const ids = data.postIds.filter((id) => id !== postId)
  await writeData({ postIds: ids, updatedAt: new Date().toISOString() })
  return ids
}

export async function isPostPinned(postId: string): Promise<boolean> {
  const ids = await getPinnedPostIds()
  return ids.includes(postId)
}
