import { auth } from "@/lib/auth"
import { getUnreadNotificationCount } from "@/lib/notifications"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ count: 0 }, { status: 401 })
  }

  const count = await getUnreadNotificationCount(session.user.id)
  return Response.json(
    { count },
    { headers: { "Cache-Control": "private, no-store" } }
  )
}
