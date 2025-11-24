import { Request, Response } from 'express';
import { asyncHandler, AppError, ValidationError, BusinessError } from '../middleware/errorHandler';
import { prisma } from '../config/database';
import { ApiResponseUtil, createPaginationMeta, formatPaginationParams, formatSortParams, buildSearchCondition } from '../utils/response';
import { logger } from '../utils/logger';
import { withTransaction } from '../config/database';
import { TradeType, PostStatus, PointChangeType } from '@prisma/client';

export const postController = {
  // 获取交易信息列表
  getPosts: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, offset } = formatPaginationParams(req.query);
    const { keyword, tradeType, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const { priceRange } = req.query as any;

    // 构建查询条件
    const where: any = {
      status: 'ACTIVE',
      expireAt: {
        gt: new Date()
      }
    };

    // 关键词搜索
    if (keyword) {
      where.OR = buildSearchCondition(keyword, ['title', 'keywords']);
    }

    // 交易类型筛选
    if (tradeType) {
      where.tradeType = tradeType as TradeType;
    }

    // 价格区间筛选
    if (priceRange?.min !== undefined || priceRange?.max !== undefined) {
      where.price = {};
      if (priceRange.min !== undefined) where.price.gte = priceRange.min;
      if (priceRange.max !== undefined) where.price.lte = priceRange.max;
    }

    // 排序规则：成交率降序(70%) + 发布时间倒序(30%)
    const orderBy = sortBy === 'createdAt'
      ? [{ dealRate: 'desc' as const }, { createdAt: 'desc' as const }]
      : [{ [sortBy]: sortOrder as 'asc' | 'desc' }, { dealRate: 'desc' as const }];

    // 查询总数和数据
    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              wechatId: true,
              dealRate: true,
              totalPosts: true
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      })
    ]);

    const meta = createPaginationMeta(total, page, limit);

    ApiResponseUtil.paginated(res, '获取成功', posts, meta);
  }),

  // 获取交易信息详情
  getPost: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          select: {
            id: true,
            wechatId: true,
            dealRate: true,
            totalPosts: true,
            totalDeals: true
          }
        }
      }
    });

    if (!post) {
      throw new ValidationError('交易信息不存在');
    }

    ApiResponseUtil.success(res, '获取成功', post);
  }),

  // 发布交易信息
  createPost: asyncHandler(async (req: Request, res: Response) => {
    const { title, keywords, price, tradeType, deliveryDate, extraInfo } = req.body;
    const userId = req.user!.id;

    // 验证交割时间（做多/做空必填）
    if ((tradeType === TradeType.LONG || tradeType === TradeType.SHORT) && !deliveryDate) {
      throw new ValidationError('做多/做空交易必须填写交割时间');
    }

    // 使用事务处理
    const result = await withTransaction(async (tx) => {
      // 扣除积分
      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: 10 } }
      });

      // 记录积分流水
      await tx.pointTransaction.create({
        data: {
          userId,
          changeType: 'PUBLISH',
          changeAmount: -10,
          balanceAfter: req.user!.points - 10,
          description: '发布交易信息'
        }
      });

      // 创建交易信息
      const post = await tx.post.create({
        data: {
          userId,
          title,
          keywords,
          price: parseFloat(price),
          tradeType: tradeType as TradeType,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          extraInfo,
          viewLimit: 10,
          viewCount: 0,
          expireAt: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72小时后过期
        }
      });

      // 更新用户发布数
      await tx.user.update({
        where: { id: userId },
        data: { totalPosts: { increment: 1 } }
      });

      return post;
    });

    logger.business('发布交易信息', userId.toString(), { postId: result.id, title, tradeType });

    ApiResponseUtil.created(res, '发布成功', result);
  }),

  // 更新交易信息
  updatePost: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData = req.body;

    // 检查交易信息是否存在且属于当前用户
    const post = await prisma.post.findFirst({
      where: {
        id: BigInt(id),
        userId,
        status: 'ACTIVE'
      }
    });

    if (!post) {
      throw new ValidationError('交易信息不存在或无权限修改');
    }

    // 验证交割时间（做多/做空必填）
    const { tradeType, deliveryDate } = updateData;
    if ((tradeType === TradeType.LONG || tradeType === TradeType.SHORT) && !deliveryDate) {
      throw new ValidationError('做多/做空交易必须填写交割时间');
    }

    // 转换数据类型
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.tradeType) {
      updateData.tradeType = updateData.tradeType as TradeType;
    }
    if (updateData.deliveryDate) {
      updateData.deliveryDate = new Date(updateData.deliveryDate);
    }

    const updatedPost = await prisma.post.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    logger.business('更新交易信息', userId.toString(), { postId: BigInt(id), title: updatedPost.title });

    ApiResponseUtil.success(res, '更新成功', updatedPost);
  }),

  // 删除交易信息
  deletePost: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // 检查交易信息是否存在且属于当前用户
    const post = await prisma.post.findFirst({
      where: {
        id: BigInt(id),
        userId
      }
    });

    if (!post) {
      throw new ValidationError('交易信息不存在或无权限删除');
    }

    // 使用事务处理
    await withTransaction(async (tx) => {
      // 删除交易信息
      await tx.post.delete({
        where: { id: BigInt(id) }
      });

      // 退还剩余积分
      const refundAmount = Math.max(0, post.viewLimit - post.viewCount);
      if (refundAmount > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { points: { increment: refundAmount } }
        });

        // 记录积分流水
        await tx.pointTransaction.create({
          data: {
            userId,
            changeType: 'REFUND',
            changeAmount: refundAmount,
            balanceAfter: req.user!.points + refundAmount,
            relatedId: BigInt(id),
            description: '删除交易信息退还积分'
          }
        });
      }
    });

    logger.business('删除交易信息', userId.toString(), { postId: BigInt(id), refundAmount: Math.max(0, post.viewLimit - post.viewCount) });

    ApiResponseUtil.success(res, '删除成功');
  }),

  // 更新交易状态
  updatePostStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { status } = req.body;

    const post = await prisma.post.findFirst({
      where: {
        id: BigInt(id),
        userId
      }
    });

    if (!post) {
      throw new ValidationError('交易信息不存在或无权限操作');
    }

    const updatedPost = await prisma.post.update({
      where: { id: BigInt(id) },
      data: {
        status: status as PostStatus,
        ...(status === 'DISABLED' && {
          // 下架时退还积分
          refundAmount: Math.max(0, post.viewLimit - post.viewCount)
        })
      }
    });

    ApiResponseUtil.success(res, '操作成功', updatedPost);
  }),

  // 查看联系方式
  viewContact: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const post = await prisma.post.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          select: {
            id: true,
            wechatId: true
          }
        }
      }
    });

    if (!post || post.status !== 'ACTIVE') {
      throw new ValidationError('交易信息不存在或已下架');
    }

    // 检查是否已查看过
    const existingView = await prisma.postView.findUnique({
      where: {
        postId_postId: {
          postId: BigInt(id),
          userId: userId
        }
      }
    });

    let wechatId = post.user.wechatId;

    // 使用事务处理
    await withTransaction(async (tx) => {
      if (!existingView) {
        // 扣除积分
        await tx.user.update({
          where: { id: userId },
          data: { points: { decrement: 1 } }
        });

        // 记录积分流水
        await tx.pointTransaction.create({
          data: {
            userId,
            changeType: 'VIEW',
            changeAmount: -1,
            balanceAfter: req.user!.points - 1,
            relatedId: BigInt(id),
            description: '查看联系方式'
          }
        });

        // 增加查看次数
        await tx.post.update({
          where: { id: BigInt(id) },
          data: {
            viewCount: { increment: 1 }
          }
        });

        // 创建查看记录
        await tx.postView.create({
          data: {
            postId: BigInt(id),
            userId,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        });
      }
    });

    logger.business('查看联系方式', userId.toString(), { postId: BigInt(id), postTitle: post.title });

    ApiResponseUtil.success(res, '查看成功', {
      wechatId,
      viewed: !!existingView
    });
  }),

  // 标记成交
  markDeal: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isDealt } = req.body;
    const userId = req.user!.id;

    const postView = await prisma.postView.findUnique({
      where: {
        postId_postId: {
          postId: BigInt(id),
          userId: userId
        }
      },
      include: {
        post: {
          include: {
            user: true
          }
        }
      }
    });

    if (!postView) {
      throw new ValidationError('请先查看联系方式后再标记成交');
    }

    if (postView.isDealt) {
      throw new ValidationError('已标记过成交状态');
    }

    // 更新成交状态
    const updatedView = await prisma.postView.update({
      where: { id: postView.id },
      data: {
        isDealt,
        dealtAt: isDealt ? new Date() : null
      }
    });

    if (isDealt) {
      // 更新发布者的成交统计
      await withTransaction(async (tx) => {
        // 增加成交数
        await tx.post.update({
          where: { id: BigInt(id) },
          data: { dealCount: { increment: 1 } }
        });

        // 重新计算成交率
        const totalPosts = await tx.post.count({
          where: { userId: postView.post.userId }
        });

        const totalDeals = await tx.post.aggregate({
          where: { userId: postView.post.userId },
          _sum: { dealCount: true }
        });

        const dealRate = totalPosts > 0 ?
          parseFloat(((totalDeals._sum.dealCount || 0) / totalPosts * 100).toFixed(1)) : 0;

        await tx.user.update({
          where: { id: postView.post.userId },
          data: {
            totalDeals: totalDeals._sum.dealCount || 0,
            dealRate
          }
        });
      });

      logger.business('标记成交', userId.toString(), {
        postId: BigInt(id),
        sellerId: postView.post.userId
      });
    }

    ApiResponseUtil.success(res, '标记成功', { isDealt });
  }),

  // 获取我的发布
  getMyPosts: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, offset } = formatPaginationParams(req.query);
    const userId = req.user!.id;

    const [total, posts] = await Promise.all([
      prisma.post.count({ where: { userId } }),
      prisma.post.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              wechatId: true,
              dealRate: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      })
    ]);

    const meta = createPaginationMeta(total, page, limit);

    ApiResponseUtil.paginated(res, '获取成功', posts, meta);
  }),

  // 搜索交易信息
  searchPosts: asyncHandler(async (req: Request, res: Response) => {
    const { keyword, tradeType, priceRange } = req.query;
    const { page, limit, offset } = formatPaginationParams(req.query);

    const where: any = {
      status: 'ACTIVE',
      expireAt: { gt: new Date() }
    };

    // 关键词搜索
    if (keyword) {
      where.OR = buildSearchCondition(keyword as string, ['title', 'keywords']);
    }

    // 交易类型筛选
    if (tradeType) {
      where.tradeType = tradeType as TradeType;
    }

    // 价格区间筛选
    if (priceRange?.min !== undefined || priceRange?.max !== undefined) {
      where.price = {};
      if (priceRange.min !== undefined) where.price.gte = priceRange.min;
      if (priceRange.max !== undefined) where.price.lte = priceRange.max;
    }

    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              wechatId: true,
              dealRate: true
            }
          }
        },
        orderBy: [
          { dealRate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      })
    ]);

    const meta = createPaginationMeta(total, page, limit);

    ApiResponseUtil.paginated(res, '搜索成功', posts, meta);
  })
};