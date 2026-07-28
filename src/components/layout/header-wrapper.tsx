"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"

const HIDDEN_PATHS = ["/auth/signin", "/auth/register"]

export function HeaderWrapper({ ownStatus }: { ownStatus?: { color: string; emoji: string | null } | null }) {
  const pathname = usePathname()
  const hideHeader = HIDDEN_PATHS.some((path) => pathname?.startsWith(path))

  if (hideHeader) return null
  return <Header ownStatus={ownStatus} />
}
