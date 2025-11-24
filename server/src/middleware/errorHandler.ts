import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 验证错误类
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

// 认证错误类
export class AuthenticationError extends AppError {
  constructor(message: string = '认证失败') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

// 授权错误类
export class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

// 资源未找到错误类
export class NotFoundError extends AppError {
  constructor(message: string = '资源未找到') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

// 业务逻辑错误类
export class BusinessError extends AppError {
  constructor(message: string, statusCode: number = 422) {
    super(message, statusCode);
    this.name = 'BusinessError';
  }
}

// 数据库错误处理
export const handleDatabaseError = (error: any): AppError => {
  // Prisma错误处理
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        // 唯一约束违反
        const field = error.meta?.target?.[0] || '字段';
        return new BusinessError(`${field}已存在，请使用其他值`);
      case 'P2025':
        // 记录未找到
        return new NotFoundError('记录未找到');
      case 'P2003':
        // 外键约束违反
        return new BusinessError('关联数据不存在');
      case 'P2014':
        // 关联记录冲突
        return new BusinessError('存在关联数据，无法删除');
      case 'P2000':
        // 值过长
        return new ValidationError('输入值过长');
      case 'P2001':
        // 记录不存在
        return new NotFoundError('记录不存在');
      case 'P2004':
        // 约束失败
        return new ValidationError('数据约束验证失败');
      default:
        logger.error('未处理的数据库错误:', error);
        return new BusinessError('数据库操作失败');
    }
  }

  // PostgreSQL错误处理
  if (error.code?.startsWith('23')) {
    // Integrity Constraint Violation
    return new BusinessError('数据完整性约束违反');
  }

  if (error.code?.startsWith('42')) {
    // Syntax Error
    logger.error('数据库语法错误:', error);
    return new BusinessError('数据库查询错误');
  }

  // 其他数据库错误
  logger.error('数据库错误:', error);
  return new BusinessError('数据库操作失败');
};

// JWT错误处理
export const handleJWTError = (error: any): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('无效的访问令牌');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('访问令牌已过期');
  }
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('访问令牌尚未生效');
  }
  return new AuthenticationError('令牌验证失败');
};

// 错误处理中间件
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let err = error;

  // 如果不是AppError实例，转换为AppError
  if (!(error instanceof AppError)) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      err = new ValidationError('数据验证失败');
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      err = handleJWTError(error);
    } else if (error.code) {
      // Prisma或数据库错误
      err = handleDatabaseError(error);
    } else {
      // 未知错误
      logger.error('未知错误:', error);
      err = new AppError('服务器内部错误', 500, false);
    }
  }

  // 记录错误日志
  if (err.statusCode >= 500) {
    logger.error('服务器错误:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  } else {
    logger.warn('客户端错误:', {
      error: err.message,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
  }

  // 构建错误响应
  const response = {
    success: false,
    code: err.statusCode,
    message: err.message,
    ...(config.app.env === 'development' && {
      stack: err.stack,
    }),
  };

  // 开发环境下添加更多错误信息
  if (config.app.env === 'development' && err instanceof ValidationError) {
    (response as any).details = err;
  }

  res.status(err.statusCode || 500).json(response);
};

// 异步错误处理包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404错误处理
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`路由 ${req.originalUrl} 不存在`);
  next(error);
};