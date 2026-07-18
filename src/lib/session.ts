import "server-only"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export async function requireUser(callbackUrl: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/auth/signin?reason=members-only&callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }
  return session.user
}
