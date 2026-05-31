const { PrismaClient } = require('./src/generated/prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const categories = [
    { name: '学习交流', slug: 'study' },
    { name: '二手交易', slug: 'secondhand' },
    { name: '失物招领', slug: 'lostfound' },
    { name: '校园活动', slug: 'activity' },
    { name: '校园公告', slug: 'announcement' },
    { name: '难题讨论', slug: 'problem-discussion' },
    { name: '表白墙', slug: 'confession' },
  ]

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } })
    if (!existing) {
      await prisma.category.create({ data: cat })
      console.log(`✅ 已添加分类: ${cat.name}`)
    } else {
      console.log(`⏭️ 分类已存在，跳过: ${cat.name}`)
    }
  }

  console.log('🎉 分类数据处理完毕！')
}

main()
  .catch((e) => {
    console.error('❌ 插入失败:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())