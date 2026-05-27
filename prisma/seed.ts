import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const categories = [
    { name: "学习交流", slug: "study" },
    { name: "二手交易", slug: "secondhand" },
    { name: "失物招领", slug: "lostfound" },
    { name: "校园活动", slug: "activity" },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  console.log("已创建分类:", categories.map((c) => c.name).join(", "))

  const adminEmail = "admin@bje2school.cn"
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10)
    await prisma.user.create({
      data: {
        name: "管理员",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    })
    console.log(`已创建管理员账号: ${adminEmail} / admin123`)
  } else {
    console.log("管理员账号已存在")
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })