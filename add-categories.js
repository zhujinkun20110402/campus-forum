const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: '学习交流', slug: 'study' },
    { name: '校园活动', slug: 'campus-event' },
    { name: '二手交易', slug: 'flea-market' },
    { name: '失物招领', slug: 'lost-found' },
  ];

  for (const cat of categories) {
    // 如果 slug 已存在就跳过，避免重复报错
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({ data: cat });
      console.log(`✅ 已添加分类: ${cat.name}`);
    } else {
      console.log(`⏭️ 分类已存在，跳过: ${cat.name}`);
    }
  }

  console.log('🎉 分类数据处理完毕！');
}

main()
  .catch((e) => {
    console.error('❌ 插入失败:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());