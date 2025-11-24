import { PrismaClient, AdminRole, UserStatus, TradeType, PostStatus, PointChangeType, InviteStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建种子数据...');

  // 创建默认管理员
  const hashedPassword = await bcrypt.hash('admin123456', 12);
  const adminUser = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@trading-platform.com',
      role: AdminRole.SUPER_ADMIN,
      permissions: ['*'],
    },
  });

  console.log('创建管理员:', adminUser.username);

  // 创建敏感词
  const sensitiveWords = [
    { word: '违法', category: '违法', level: 3 },
    { word: '诈骗', category: '金融诈骗', level: 3 },
    { word: '洗钱', category: '金融诈骗', level: 3 },
    { word: '暴力', category: '违法', level: 2 },
    { word: '色情', category: '违法', level: 2 },
    { word: '赌博', category: '违法', level: 2 },
    { word: '毒品', category: '违法', level: 3 },
    { word: '枪支', category: '违法', level: 3 },
    { word: '高收益', category: '金融诈骗', level: 1 },
    { word: '无风险', category: '金融诈骗', level: 1 },
    { word: '稳赚', category: '金融诈骗', level: 1 },
    { word: '内幕', category: '金融诈骗', level: 2 },
  ];

  for (const wordData of sensitiveWords) {
    await prisma.sensitiveWord.upsert({
      where: { word: wordData.word },
      update: {},
      create: wordData,
    });
  }

  console.log('创建敏感词:', sensitiveWords.length, '个');

  // 创建系统公告
  const announcement = await prisma.systemAnnouncement.create({
    data: {
      title: '欢迎使用交易信息撮合平台',
      content: '本平台致力于为用户提供安全、高效的交易信息撮合服务。请遵守平台规则，诚信交易。',
      priority: 1,
      isActive: true,
      createdBy: adminUser.id,
    },
  });

  console.log('创建系统公告:', announcement.title);

  // 创建测试用户
  const testUsers = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        phone: `1380013800${i}`,
        wechatId: `user${i}`,
        inviteCode: `INV${i}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        points: 100 + i * 50,
        dealRate: parseFloat((70 + Math.random() * 25).toFixed(1)),
        totalPosts: Math.floor(Math.random() * 10) + 1,
        totalDeals: Math.floor(Math.random() * 8) + 1,
        status: UserStatus.ACTIVE,
      },
    });
    testUsers.push(user);

    // 为用户创建一些积分流水
    await prisma.pointTransaction.create({
      data: {
        userId: user.id,
        changeType: PointChangeType.INVITED_BONUS,
        changeAmount: 100,
        balanceAfter: user.points,
        description: '注册奖励',
      },
    });
  }

  console.log('创建测试用户:', testUsers.length, '个');

  // 创建一些测试交易信息
  const samplePosts = [
    {
      title: 'iPhone 15 Pro Max 256GB',
      keywords: 'iPhone,苹果,手机,5G',
      price: 8999,
      tradeType: TradeType.SELL,
      extraInfo: '全新未拆封，原装正品',
    },
    {
      title: '求购华为Mate 60 Pro',
      keywords: '华为,Mate,手机,5G',
      price: 6999,
      tradeType: TradeType.BUY,
      extraInfo: '颜色不限，要求全新',
    },
    {
      title: '比特币看涨，目标10万',
      keywords: '比特币,BTC,加密货币,做多',
      price: 65000,
      tradeType: TradeType.LONG,
      deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      extraInfo: '技术面看涨，专业分析',
    },
    {
      title: '以太坊短期看跌',
      keywords: '以太坊,ETH,加密货币,做空',
      price: 3200,
      tradeType: TradeType.SHORT,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
      extraInfo: '市场调整，短期承压',
    },
    {
      title: '二手MacBook Pro M2',
      keywords: 'MacBook,苹果,笔记本,电脑',
      price: 12000,
      tradeType: TradeType.SELL,
      extraInfo: '9成新，功能完好',
    },
    {
      title: '求购AirPods Pro 2',
      keywords: 'AirPods,苹果,耳机,降噪',
      price: 1500,
      tradeType: TradeType.BUY,
      extraInfo: '全新或99新均可',
    },
  ];

  for (let i = 0; i < samplePosts.length; i++) {
    const postData = samplePosts[i];
    const user = testUsers[i % testUsers.length];

    // 计算过期时间（72小时后）
    const expireAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const post = await prisma.post.create({
      data: {
        ...postData,
        userId: user.id,
        expireAt,
        status: PostStatus.ACTIVE,
      },
    });

    // 为发布者扣除积分
    await prisma.pointTransaction.create({
      data: {
        userId: user.id,
        changeType: PointChangeType.PUBLISH,
        changeAmount: -10,
        balanceAfter: user.points - 10,
        relatedId: post.id,
        description: '发布交易信息',
      },
    });

    // 更新用户积分
    await prisma.user.update({
      where: { id: user.id },
      data: { points: { decrement: 10 } },
    });
  }

  console.log('创建测试交易信息:', samplePosts.length, '条');

  console.log('种子数据创建完成！');
}

main()
  .catch((e) => {
    console.error('创建种子数据时出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });