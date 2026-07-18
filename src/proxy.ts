import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const PUBLIC_PATHS = ["/", "/auth/signin", "/auth/register"]

export default auth((request) => {
  const { pathname, search } = request.nextUrl
  const isAuthApi = pathname.startsWith("/api/auth")
  const isPublicPage = PUBLIC_PATHS.includes(pathname)

  if (!request.auth?.user && !isPublicPage && !isAuthApi) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "请先登录校园论坛" }, { status: 401 })
    }

    const signInUrl = new URL("/auth/signin", request.nextUrl.origin)
    signInUrl.searchParams.set("reason", "members-only")
    signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`)
    return NextResponse.redirect(signInUrl)
  }

  if (request.auth?.user && (pathname === "/auth/signin" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|avatars/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
