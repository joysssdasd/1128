import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { AuthenticationError, AuthorizationError } from './errorHandler';
import { config } from '../config/env';
import { logger } from '../utils/logger';

// 扩展Request接口，添加用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: bigint;
        phone: string;
        wechatId: string;
        points: number;
        dealRate: number;
        status: string;
      };
      admin?: {
        id: bigint;
        username: string;
        role: string;
        permissions: string[];
      };
    }
  }
}

// JWT载荷接口
interface JWTPayload {
  userId: bigint;
  phone: string;
  iat: number;
  exp: number;
}

// 管理员JWT载荷接口
interface AdminJWTPayload {
  adminId: bigint;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

// 生成用户访问令牌
export const generateUserToken = (user: { id: bigint; phone: string }): string => {
  const payload: JWTPayload = {
    userId: user.id,
    phone: user.phone,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30天
  };

  return jwt.sign(payload, config.jwt.secret);
};

// 生成管理员访问令牌
export const generateAdminToken = (admin: { id: bigint; username: string; role: string }): string => {
  const payload: AdminJWTPayload = {
    adminId: admin.id,
    username: admin.username,
    role: admin.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24小时
  };

  return jwt.sign(payload, config.jwt.secret);
};

// 验证用户JWT令牌
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('请提供有效的访问令牌');
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证JWT令牌
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        wechatId: true,
        points: true,
        dealRate: true,
        status: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('用户不存在');
    }

    if (user.status !== 'ACTIVE') {
      throw new AuthenticationError('用户账户已被禁用');
    }

    // 将用户信息添加到请求对象
    req.user = user;

    logger.security('User authenticated', user.id.toString(), req.ip);

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('无效的访问令牌'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('访问令牌已过期'));
    } else if (error instanceof AuthenticationError) {
      next(error);
    } else {
      logger.error('Authentication error:', error);
      next(new AuthenticationError('认证失败'));
    }
  }
};

// 验证管理员JWT令牌
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('请提供有效的管理员令牌');
    }

    const token = authHeader.substring(7);

    // 验证JWT令牌
    const decoded = jwt.verify(token, config.jwt.secret) as AdminJWTPayload;

    // 从数据库获取管理员信息
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        username: true,
        role: true,
        permissions: true,
        isActive: true,
      },
    });

    if (!admin) {
      throw new AuthenticationError('管理员不存在');
    }

    if (!admin.isActive) {
      throw new AuthenticationError('管理员账户已被禁用');
    }

    // 将管理员信息添加到请求对象
    req.admin = admin;

    logger.security('Admin authenticated', admin.id.toString(), req.ip, { role: admin.role });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('无效的管理员令牌'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('管理员令牌已过期'));
    } else if (error instanceof AuthenticationError) {
      next(error);
    } else {
      logger.error('Admin authentication error:', error);
      next(new AuthenticationError('管理员认证失败'));
    }
  }
};

// 可选的用户认证（不强制要求登录）
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        wechatId: true,
        points: true,
        dealRate: true,
        status: true,
      },
    });

    if (user && user.status === 'ACTIVE') {
      req.user = user;
    }

    next();
  } catch (error) {
    // 可选认证失败时不抛出错误，继续执行
    logger.debug('Optional authentication failed:', error);
    next();
  }
};

// 权限检查中间件
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new AuthenticationError('需要管理员权限'));
    }

    // 超级管理员拥有所有权限
    if (req.admin.role === 'SUPER_ADMIN') {
      return next();
    }

    // 检查权限
    if (!req.admin.permissions.includes('*') && !req.admin.permissions.includes(permission)) {
      logger.security('Permission denied', req.admin.id.toString(), req.ip, {
        requiredPermission: permission,
        userPermissions: req.admin.permissions,
      });
      return next(new AuthorizationError('权限不足'));
    }

    next();
  };
};

// 角色检查中间件
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new AuthenticationError('需要管理员权限'));
    }

    if (req.admin.role !== role && req.admin.role !== 'SUPER_ADMIN') {
      logger.security('Role access denied', req.admin.id.toString(), req.ip, {
        requiredRole: role,
        userRole: req.admin.role,
      });
      return next(new AuthorizationError('角色权限不足'));
    }

    next();
  };
};

// 检查用户积分
export const checkUserPoints = (requiredPoints: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('需要用户登录'));
    }

    if (req.user.points < requiredPoints) {
      return next(new AuthorizationError(`积分不足，需要 ${requiredPoints} 积分`));
    }

    next();
  };
};