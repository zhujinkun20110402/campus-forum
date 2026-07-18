import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        name: { label: "用户名或邮箱", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) {
          throw new Error("请输入用户名/邮箱和密码")
        }

        const login = credentials.name as string
        const password = credentials.password as string

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { name: login },
              { email: login },
            ],
          },
        })

        if (!user || !user.password) {
          throw new Error("用户名或密码错误")
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          throw new Error("用户名或密码错误")
        }

        if (user.role === "BANNED") {
          throw new Error("账号已被封禁，请联系管理员")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (!account || account.provider === "credentials") return true

      // Invitation registration is the only account-creation path. OAuth may
      // authenticate an account that was linked previously, but never create one.
      const linkedAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        select: { user: { select: { role: true } } },
      })

      return !!linkedAccount && linkedAccount.user.role !== "BANNED"
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!
        token.role = (user as { role?: string }).role ?? "USER"
        token.picture = user.image
        token.name = user.name
      }
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name
        token.picture = session.image ?? token.picture
        token.bio = session.bio
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string | null
        session.user.image = token.picture as string | null
      }
      return session
    },
  },
})
