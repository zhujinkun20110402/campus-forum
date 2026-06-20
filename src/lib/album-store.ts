import { promises as fs } from "fs"
import path from "path"

export interface WallPhoto {
  url: string
  caption?: string
  uploadedAt: string
  uploadedBy: string
}

const DATA_DIR = path.join(process.cwd(), "data")
const PHOTOWALL_FILE = path.join(DATA_DIR, "photowall.json")

async function ensureDataFile() {
  try {
    await fs.access(PHOTOWALL_FILE)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(PHOTOWALL_FILE, "[]", "utf-8")
  }
}

async function readPhotos(): Promise<WallPhoto[]> {
  await ensureDataFile()
  const raw = await fs.readFile(PHOTOWALL_FILE, "utf-8")
  try {
    return JSON.parse(raw) as WallPhoto[]
  } catch {
    return []
  }
}

async function writePhotos(photos: WallPhoto[]) {
  await ensureDataFile()
  await fs.writeFile(PHOTOWALL_FILE, JSON.stringify(photos, null, 2), "utf-8")
}

export async function getPhotos(): Promise<WallPhoto[]> {
  return await readPhotos()
}

export async function addPhoto(photo: WallPhoto): Promise<WallPhoto[]> {
  const photos = await readPhotos()
  photos.push(photo)
  await writePhotos(photos)
  return photos
}

export async function removePhoto(url: string): Promise<WallPhoto[]> {
  const photos = await readPhotos()
  const filtered = photos.filter((p) => p.url !== url)
  await writePhotos(filtered)
  return filtered
}

export async function updatePhotoCaption(url: string, caption: string): Promise<WallPhoto[]> {
  const photos = await readPhotos()
  const idx = photos.findIndex((p) => p.url === url)
  if (idx !== -1) {
    photos[idx].caption = caption
    await writePhotos(photos)
  }
  return photos
}
