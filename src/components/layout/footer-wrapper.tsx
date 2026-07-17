"use client"

import { usePathname } from "next/navigation"
import { Footer } from "./footer"

const HIDDEN_PATHS = ["/auth/signin", "/auth/register"]

export function FooterWrapper() {
  const pathname = usePathname()
  const hideFooter = HIDDEN_PATHS.some((path) => pathname?.startsWith(path))

  if (hideFooter) return null
  return <Footer />
}
