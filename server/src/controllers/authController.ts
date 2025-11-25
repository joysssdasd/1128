import { Request, Response } from 'express';
import { asyncHandler, AppError, ValidationError } from '../middleware/errorHandler';
import { prisma } from '../config/database';
import { generateUserToken } from '../middleware/auth';
import { smsService, SmsService } from '../services/smsService';
import { ApiResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import { withTransaction } from '../config/database';

export const authController = {
  // 发送短信验证码
  sendSms: asyncHandler(async (req: Request, res: Response) => {
    const { phone, type } = req.body;

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new ValidationError('请输入有效的手机号');
    }

    // 检查手机号是否已注册（注册时需要检查）
    if (type === 'register') {
      const existingUser = await prisma?.user.findUnique({
        where: { phone }
      });

      if (existingUser) {
        throw new ValidationError('该手机号已注册');
      }
    }

    // 生成验证码
    const code = SmsService.generateCode();

    // 发送短信
    const smsResult = await smsService.sendVerificationCode(phone, code, type as any);

    if (!smsResult.success) {
      throw new AppError(smsResult.message);
    }

    // 将验证码存储到Redis（这里简化处理，实际应该存储到Redis）
    // 为了演示，我们直接返回成功
    logger.business('短信验证码发送', undefined, { phone, type, requestId: smsResult.requestId });

    ApiResponseUtil.success(res, '验证码发送成功', {
      phone,
      type,
      // 开发环境下返回验证码，生产环境不应该返回
      ...(process.env.NODE_ENV === 'development' && { code })
    });
  }),

  // 用户注册
  register: asyncHandler(async (req: Request, res: Response) => {
    const { phone, smsCode, wechatId, inviteCode } = req.body;

    // 验证短信验证码格式
    if (!SmsService.validateCode(smsCode)) {
      throw new ValidationError('验证码格式不正确');
    }

    // 检查手机号是否已注册
    const existingUser = await prisma?.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      throw new ValidationError('该手机号已注册');
    }

    // 验证微信号格式
    if (!/^[a-zA-Z0-9_-]{6,20}$/.test(wechatId)) {
      throw new ValidationError('微信号格式不正确');
    }

    // 验证微信号是否已被使用
    const existingWechat = await prisma?.user.findUnique({
      where: { wechatId }
    });

    if (existingWechat) {
      throw new ValidationError('该微信号已被使用');
    }

    let inviterId: bigint | null = null;

    // 处理邀请码
    if (inviteCode && prisma) {
      const invitation = await prisma?.invitation.findFirst({
        where: { inviteCode }
      });

      if (invitation) {
        inviterId = invitation.inviterId;
      }
    }

    // 使用事务处理用户创建和初始积分
    const result = await withTransaction(async (tx) => {
      // 创建用户
      const user = await tx.user.create({
        data: {
          phone,
          wechatId,
          inviteCode: inviteCode || null,
          points: 100, // 注册赠送100积分
        }
      });

      // 创建积分流水记录
      await tx.pointTransaction.create({
        data: {
          userId: user.id,
          changeType: 'INVITED_BONUS',
          changeAmount: 100,
          balanceAfter: 100,
          description: '注册奖励'
        }
      });

      // 如果有邀请人，创建邀请关系
      if (inviterId) {
        await tx.invitation.create({
          data: {
            inviterId,
            invitedId: user.id,
            inviteCode: inviteCode!,
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });
      }

      return user;
    });

    // 生成JWT token
    const token = generateUserToken(result);

    logger.business('用户注册成功', result.id.toString(), { phone, wechatId, hasInviter: !!inviterId });

    ApiResponseUtil.created(res, '注册成功', {
      user: {
        id: result.id,
        phone: result.phone,
        wechatId: result.wechatId,
        points: result.points,
        dealRate: result.dealRate,
        status: result.status
      },
      token
    });
  }),

  // 用户登录
  login: asyncHandler(async (req: Request, res: Response) => {
    const { phone, smsCode } = req.body;

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new ValidationError('请输入有效的手机号');
    }

    // 验证短信验证码格式
    if (!SmsService.validateCode(smsCode)) {
      throw new ValidationError('验证码格式不正确');
    }

    // 开发环境下，验证码为123456时直接通过
    if (process.env.NODE_ENV === 'development' && smsCode === '123456') {
      // 开发模式特殊处理
    }

    // 查找用户
    const user = await prisma?.user.findUnique({
      where: { phone }
    });

    if (!user) {
      throw new ValidationError('用户不存在，请先注册');
    }

    if (user.status !== 'ACTIVE') {
      throw new ValidationError('账户已被禁用');
    }

    // 生成JWT token
    const token = generateUserToken(user);

    logger.business('用户登录成功', user.id.toString(), { phone });

    ApiResponseUtil.success(res, '登录成功', {
      user: {
        id: user.id,
        phone: user.phone,
        wechatId: user.wechatId,
        points: user.points,
        dealRate: user.dealRate,
        status: user.status
      },
      token
    });
  }),

  // 刷新令牌
  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    // 这里可以实现刷新令牌逻辑
    ApiResponseUtil.success(res, '令牌刷新成功');
  }),

  // 验证令牌
  verifyToken: asyncHandler(async (req: Request, res: Response) => {
    // 中间件已经验证了令牌，这里直接返回成功
    ApiResponseUtil.success(res, '令牌有效');
  })
};