import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const startTime = Symbol('startTime');

// 请求日志中间件
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // 记录请求开始时间
  (req as any)[startTime] = Date.now();

  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - (req as any)[startTime];
    logger.request(req, res, duration);
  });

  next();
};

// API响应日志中间件
export const apiResponseLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function(body: any) {
    // 记录API响应信息
    if (req.path.startsWith('/api/')) {
      logger.info('API Response', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseSize: Buffer.byteLength(body, 'utf8'),
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    }

    return originalSend.call(this, body);
  };

  next();
};