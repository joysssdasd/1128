#!/usr/bin/env node

/**
 * 检查当前数据库状态并创建测试数据
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查数据库状态并创建测试数据');
  console.log('=' .repeat(50));

  try {
    // 检查当前数据
    console.log('\n📊 当前数据库状态:');

    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const adminCount = await prisma.adminUser.count();

    console.log(`   👥 用户数量: ${userCount}`);
    console.log(`   📝 交易信息数量: ${postCount}`);
    console.log(`   👨‍💼 管理员数量: ${adminCount}`);

    // 如果已经有数据，显示一些样本
    if (userCount > 0) {
      console.log('\n👤 现有用户样本:');
      const users = await prisma.user.findMany({
        take: 3,
        select: { id: true, phone: true, wechatId: true, points: true, status: true }
      });
      users.forEach(user => {
        console.log(`   - 用户${user.id}: 手机${user.phone}, 微信${user.wechatId}, 积分${user.points}, 状态${user.status}`);
      });
    }

    if (postCount > 0) {
      console.log('\n📝 现有交易信息样本:');
      const posts = await prisma.post.findMany({
        take: 3,
        select: {
          id: true,
          title: true,
          tradeType: true,
          price: true,
          status: true,
          viewCount: true,
          dealCount: true
        }
      });
      posts.forEach(post => {
        console.log(`   - 信息${post.id}: ${post.title}, 类型${post.tradeType}, 价格${post.price}, 浏览${post.viewCount}次, 成交${post.dealCount}次`);
      });
    }

    // 创建我们需要的测试数据（演唱会门票、数码产品等）
    console.log('\n🎯 创建演唱会门票、数码产品、潮玩测试数据...');

    // 创建测试用户（如果手机号不重复）
    const testUsers = [
      { phone: '13800138011', wechatId: 'concert_fan', points: 500 },
      { phone: '13800138012', wechatId: 'tech_lover', points: 800 },
      { phone: '13800138013', wechatId: 'toy_collector', points: 300 },
    ];

    for (let i = 0; i < testUsers.length; i++) {
      const userData = testUsers[i];
      try {
        const newUser = await prisma.user.create({
          data: {
            phone: userData.phone,
            wechatId: userData.wechatId,
            points: userData.points,
            inviteCode: `TEST${i + 1}2024`,
            status: 'ACTIVE'
          }
        });
        console.log(`✅ 创建用户: ${newUser.wechatId} (手机: ${newUser.phone})`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  用户已存在: ${userData.phone}`);
        } else {
          throw error;
        }
      }
    }

    // 获取刚创建的用户ID
    const users = await prisma.user.findMany({
      where: {
        phone: { in: testUsers.map(u => u.phone) }
      }
    });

    // 创建演唱会门票、数码产品、潮玩等测试数据
    const testPosts = [
      // 演唱会门票
      {
        userId: users[0]?.id,
        title: '周杰伦2024演唱会门票求购',
        keywords: '周杰伦,演唱会,门票,求购',
        price: 1200.00,
        tradeType: 'BUY',
        extraInfo: '需要2张内场票，价格可议',
        viewLimit: 20,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
      },
      {
        userId: users[0]?.id,
        title: '五月天演唱会门票出售',
        keywords: '五月天,演唱会,门票,出售',
        price: 800.00,
        tradeType: 'SELL',
        extraInfo: '2张看台票，位置很好',
        viewLimit: 15,
        expireAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      },
      // 数码产品
      {
        userId: users[1]?.id,
        title: 'iPhone 15 Pro 256G 出售',
        keywords: 'iPhone,15Pro,苹果手机,出售',
        price: 8500.00,
        tradeType: 'SELL',
        extraInfo: '99新，配件齐全，有发票',
        viewLimit: 30,
        expireAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[1]?.id,
        title: '求购MacBook Pro M3芯片',
        keywords: 'MacBook,Pro,M3,苹果电脑,求购',
        price: 12000.00,
        tradeType: 'BUY',
        extraInfo: '需要16G内存，512G硬盘',
        viewLimit: 25,
        expireAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[1]?.id,
        title: 'PS5游戏机+手柄出售',
        keywords: 'PS5,游戏机,PlayStation,手柄,出售',
        price: 3200.00,
        tradeType: 'SELL',
        extraInfo: '港版，使用半年，保养很好',
        viewLimit: 20,
        expireAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      // 潮玩和纪念币
      {
        userId: users[2]?.id,
        title: 'Bearbrick 1000% 熊模型出售',
        keywords: 'Bearbrick,熊,潮玩,模型,1000%,出售',
        price: 2800.00,
        tradeType: 'SELL',
        extraInfo: 'Medicom Toy出品，限量版，有证书',
        viewLimit: 15,
        expireAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[2]?.id,
        title: '求购2024年熊猫纪念币',
        keywords: '熊猫,纪念币,2024,金币,求购',
        price: 1800.00,
        tradeType: 'BUY',
        extraInfo: '需要全新未拆封，带证书',
        viewLimit: 10,
        expireAt: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[2]?.id,
        title: 'KAWS公仔套装出售',
        keywords: 'KAWS,公仔,潮玩,套装,出售',
        price: 3500.00,
        tradeType: 'SELL',
        extraInfo: '全新未拆封，原装进口',
        viewLimit: 18,
        expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];

    // 创建交易信息
    for (const postData of testPosts) {
      try {
        const newPost = await prisma.post.create({
          data: {
            ...postData,
            status: 'ACTIVE',
            viewCount: Math.floor(Math.random() * 50),
            dealCount: Math.floor(Math.random() * 5),
            createdAt: new Date()
          }
        });
        console.log(`✅ 创建交易信息: ${newPost.title} (${newPost.tradeType === 'BUY' ? '求购' : '出售'}) - ¥${newPost.price}`);
      } catch (error) {
        console.log(`❌ 创建信息失败: ${postData.title}`, error.message);
      }
    }

    // 创建一些积分交易记录
    console.log('\n💰 创建积分交易记录...');

    for (const user of users) {
      // 充值记录
      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          changeType: 'RECHARGE',
          changeAmount: 500,
          balanceAfter: user.points + 500,
          description: '测试充值'
        }
      });

      // 发布信息消耗
      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          changeType: 'PUBLISH',
          changeAmount: -50,
          balanceAfter: user.points - 50,
          description: '发布信息消耗'
        }
      });

      console.log(`✅ 为用户${user.wechatId}创建积分交易记录`);
    }

    // 最终统计
    const finalStats = {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      pointTransactions: await prisma.pointTransaction.count()
    };

    console.log('\n📊 数据库最终状态:');
    console.log(`   👥 总用户数: ${finalStats.users}`);
    console.log(`   📝 总交易信息: ${finalStats.posts}`);
    console.log(`   💰 总积分交易: ${finalStats.pointTransactions}`);

    // 显示我们创建的内容
    console.log('\n🎉 成功创建测试数据:');
    const newPosts = await prisma.post.findMany({
      where: { title: { contains: '演唱会' } },
      select: { title: true, tradeType: true, price: true }
    });

    console.log('🎫 演唱会门票相关:');
    newPosts.forEach(post => {
      console.log(`   - ${post.title} (${post.tradeType}) ¥${post.price}`);
    });

    const techPosts = await prisma.post.findMany({
      where: { title: { contains: 'iPhone' } },
      select: { title: true, tradeType: true, price: true }
    });

    console.log('📱 数码产品相关:');
    techPosts.forEach(post => {
      console.log(`   - ${post.title} (${post.tradeType}) ¥${post.price}`);
    });

    console.log('\n✅ 数据库测试数据创建完成！');
    console.log('🚀 现在可以启动服务进行测试了！');

  } catch (error) {
    console.error('❌ 操作失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error('严重错误:', error);
  process.exit(1);
});