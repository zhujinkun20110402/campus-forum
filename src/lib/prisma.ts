import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { getCloudflareContext } from "@opennextjs/cloudflare"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * 数据库连接双模式：
 * - Cloudflare Workers（环境变量 CLOUDFLARE_HYPERDRIVE=1）：通过 Hyperdrive
 *   的 socket 工厂连接（Workers 没有原生 TCP，node-postgres 走 Hyperdrive 套接字）
 * - 本地开发 / Vercel：直连 DATABASE_URL（行为与原来完全一致）
 */
const isCloudflare = process.env.CLOUDFLARE_HYPERDRIVE === "1"

const adapter = isCloudflare
  ? new PrismaPg({
      connectionString: getCloudflareContext().env.HYPERDRIVE.connectionString,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stream: () => getCloudflareContext().env.HYPERDRIVE.connect() as any,
    })
  : new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    })

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
