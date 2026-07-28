import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ users: [] }, { status: 401 })

  const viewer = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!viewer || viewer.role === "BANNED") return Response.json({ users: [] }, { status: 403 })

  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 40) ?? ""
  if (!query) return Response.json({ users: [] })

  const users = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      role: { not: "BANNED" },
      name: { contains: query, mode: "insensitive" },
    },
    orderBy: [{ role: "asc" }, { raputation: "desc" }],
    take: 8,
    select: { id: true, name: true, image: true, role: true, raputation: true },
  })

  return Response.json({ users })
}
