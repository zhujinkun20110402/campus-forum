const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功！');
    await prisma.$disconnect();
  } catch (e) {
    console.log('❌ 连接失败:', e.message);
    process.exit(1);
  }
}

main();