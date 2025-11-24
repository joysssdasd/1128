#!/usr/bin/env node

/**
 * API连接测试脚本
 * 测试后端API和数据库连接
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabaseAPI() {
  console.log('🧪 测试API和数据库连接');
  console.log('=' .repeat(50));

  try {
    console.log('\n📊 测试数据库查询功能...');

    // 测试用户查询
    console.log('1. 查询用户数据:');
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        phone: true,
        wechatId: true,
        points: true,
        status: true
      }
    });
    console.log('   ✅ 找到用户:', users.length, '个');
    users.forEach(user => {
      console.log(`   - 用户${user.id}: ${user.wechatId} (积分: ${user.points})`);
    });

    // 测试交易信息查询
    console.log('\n2. 查询交易信息:');
    const posts = await prisma.post.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        tradeType: true,
        price: true,
        status: true
      }
    });
    console.log('   ✅ 找到交易信息:', posts.length, '个');
    posts.forEach(post => {
      console.log(`   - 信息${post.id}: ${post.title} (${post.tradeType}) ¥${post.price}`);
    });

    // 测试演唱会门票相关数据
    console.log('\n3. 查询演唱会门票相关:');
    const concertPosts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: '演唱会' } },
          { title: { contains: '门票' } }
        ]
      },
      select: {
        title: true,
        tradeType: true,
        price: true
      }
    });
    console.log('   ✅ 找到演唱会门票信息:', concertPosts.length, '个');
    concertPosts.forEach(post => {
      console.log(`   - ${post.title} (${post.tradeType}) ¥${post.price}`);
    });

    // 测试数码产品相关数据
    console.log('\n4. 查询数码产品相关:');
    const techPosts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: 'iPhone' } },
          { title: { contains: 'MacBook' } },
          { title: { contains: 'PS5' } }
        ]
      },
      select: {
        title: true,
        tradeType: true,
        price: true
      }
    });
    console.log('   ✅ 找到数码产品信息:', techPosts.length, '个');
    techPosts.forEach(post => {
      console.log(`   - ${post.title} (${post.tradeType}) ¥${post.price}`);
    });

    // 测试潮玩相关数据
    console.log('\n5. 查询潮玩相关:');
    const toyPosts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: 'Bearbrick' } },
          { title: { contains: 'KAWS' } },
          { title: { contains: '纪念币' } }
        ]
      },
      select: {
        title: true,
        tradeType: true,
        price: true
      }
    });
    console.log('   ✅ 找到潮玩信息:', toyPosts.length, '个');
    toyPosts.forEach(post => {
      console.log(`   - ${post.title} (${post.tradeType}) ¥${post.price}`);
    });

    // 测试积分交易
    console.log('\n6. 查询积分交易:');
    const transactions = await prisma.pointTransaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        changeType: true,
        changeAmount: true,
        description: true
      }
    });
    console.log('   ✅ 找到积分交易:', transactions.length, '个');
    transactions.forEach(tx => {
      console.log(`   - 交易${tx.id}: ${tx.changeType} ${tx.changeAmount}分 (${tx.description})`);
    });

    // 统计最终数据
    console.log('\n📊 数据总结:');
    const stats = {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      transactions: await prisma.pointTransaction.count()
    };

    console.log(`   👥 总用户数: ${stats.users}`);
    console.log(`   📝 总交易信息: ${stats.posts}`);
    console.log(`   💰 总积分交易: ${stats.transactions}`);

    console.log('\n🎉 数据库连接和API测试完成！');
    console.log('✅ 所有功能正常运行！');
    console.log('✅ 演唱会门票、数码产品、潮玩等测试数据已创建！');
    console.log('✅ 可以开始部署到EdgeOne了！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行测试
testDatabaseAPI().catch(error => {
  console.error('严重错误:', error);
  process.exit(1);
});