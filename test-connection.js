#!/usr/bin/env node

/**
 * 数据库连接测试脚本
 * 测试Supabase数据库连接
 */

const { PrismaClient } = require('@prisma/client');

console.log('🧪 数据库连接测试');
console.log('=' .repeat(50));

async function testConnection() {
  const prisma = new PrismaClient();

  try {
    console.log('📍 测试数据库连接...');

    // 尝试连接数据库
    await prisma.$connect();

    console.log('✅ 数据库连接成功!');

    // 测试查询
    console.log('📊 测试数据库查询...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ 数据库查询成功:', result);

    // 获取数据库信息
    console.log('ℹ️  数据库信息:');
    const dbInfo = await prisma.$queryRaw`SELECT version()`;
    console.log('   PostgreSQL版本:', dbInfo[0].version);

    // 检查表是否存在
    console.log('📋 检查数据库表...');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

    console.log(`✅ 找到 ${tables.length} 个表`);
    if (tables.length > 0) {
      console.log('   表列表:');
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    }

    console.log('\n🎉 数据库连接测试完成!');
    console.log('✅ 数据库运行正常，可以开始下一步操作');

  } catch (error) {
    console.log('\n❌ 数据库连接失败!');
    console.log('错误信息:', error.message);

    if (error.message.includes('P1001')) {
      console.log('\n💡 可能的原因:');
      console.log('   1. Supabase网络配置未完成');
      console.log('   2. 数据库服务未启动');
      console.log('   3. 连接字符串配置错误');
      console.log('   4. 网络连接问题');

      console.log('\n🔧 解决方案:');
      console.log('   1. 检查Supabase项目状态');
      console.log('   2. 配置网络访问权限');
      console.log('   3. 尝试使用Docker本地数据库');
      console.log('   4. 查看supabase-setup-guide.md获取帮助');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行测试
testConnection().catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
});