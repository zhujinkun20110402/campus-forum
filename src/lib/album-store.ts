import { promises as fs } from "fs"
import path from "path"
import { randomUUID } from "crypto"

export interface Photo {
  url: string
  caption?: string
  uploadedAt: string
}

export interface Album {
  id: string
  title: string
  description: string
  coverUrl: string
  photos: Photo[]
  authorId: string
  authorName: string
  createdAt: string
  updatedAt: string
  isFeatured: boolean
}

const DATA_DIR = path.join(process.cwd(), "data")
const ALBUMS_FILE = path.join(DATA_DIR, "albums.json")

async function ensureDataFile() {
  try {
    await fs.access(ALBUMS_FILE)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(ALBUMS_FILE, "[]", "utf-8")
  }
}

async function readAlbums(): Promise<Album[]> {
  await ensureDataFile()
  const raw = await fs.readFile(ALBUMS_FILE, "utf-8")
  try {
    return JSON.parse(raw) as Album[]
  } catch {
    return []
  }
}

async function writeAlbums(albums: Album[]) {
  await ensureDataFile()
  await fs.writeFile(ALBUMS_FILE, JSON.stringify(albums, null, 2), "utf-8")
}

export async function getAllAlbums(): Promise<Album[]> {
  const albums = await readAlbums()
  return albums.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const albums = await readAlbums()
  return albums.find((a) => a.id === id) ?? null
}

export async function createAlbum(data: {
  title: string
  description: string
  coverUrl: string
  authorId: string
  authorName: string
  photos?: Photo[]
}): Promise<Album> {
  const albums = await readAlbums()
  const now = new Date().toISOString()

  const album: Album = {
    id: randomUUID(),
    title: data.title,
    description: data.description,
    coverUrl: data.coverUrl,
    photos: data.photos ?? [],
    authorId: data.authorId,
    authorName: data.authorName,
    createdAt: now,
    updatedAt: now,
    isFeatured: false,
  }

  albums.push(album)
  await writeAlbums(albums)
  return album
}

export async function updateAlbum(
  id: string,
  updates: Partial<Pick<Album, "title" | "description" | "coverUrl" | "photos" | "isFeatured">>
): Promise<Album | null> {
  const albums = await readAlbums()
  const index = albums.findIndex((a) => a.id === id)
  if (index === -1) return null

  albums[index] = {
    ...albums[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  await writeAlbums(albums)
  return albums[index]
}

export async function deleteAlbum(id: string): Promise<boolean> {
  const albums = await readAlbums()
  const filtered = albums.filter((a) => a.id !== id)
  if (filtered.length === albums.length) return false
  await writeAlbums(filtered)
  return true
}

export async function addPhoto(
  albumId: string,
  photo: Photo
): Promise<Album | null> {
  const albums = await readAlbums()
  const index = albums.findIndex((a) => a.id === albumId)
  if (index === -1) return null

  albums[index].photos.push(photo)
  albums[index].updatedAt = new Date().toISOString()
  if (!albums[index].coverUrl && albums[index].photos.length === 1) {
    albums[index].coverUrl = photo.url
  }
  await writeAlbums(albums)
  return albums[index]
}

export async function removePhoto(
  albumId: string,
  photoUrl: string
): Promise<Album | null> {
  const albums = await readAlbums()
  const index = albums.findIndex((a) => a.id === albumId)
  if (index === -1) return null

  albums[index].photos = albums[index].photos.filter((p) => p.url !== photoUrl)
  albums[index].updatedAt = new Date().toISOString()
  if (albums[index].coverUrl === photoUrl) {
    albums[index].coverUrl = albums[index].photos[0]?.url ?? ""
  }
  await writeAlbums(albums)
  return albums[index]
}
