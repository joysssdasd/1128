import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { config } from './env';

declare global {
  var __prisma: PrismaClient | undefined;
}

// 避免在开发环境下创建多个Prisma实例
let prisma: PrismaClient | null = null;

// 只有在有数据库URL时才创建Prisma客户端
if (config.database.url) {
  prisma =
    globalThis.__prisma ||
    new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      datasources: {
        db: {
          url: config.database.url
        }
      }
    });

  if (process.env.NODE_ENV === 'development') {
    globalThis.__prisma = prisma;
  }
} else {
  logger.warn('未配置数据库URL，将在无数据库模式下运行');
}

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Prisma日志事件监听
if (prisma) {
  prisma.$on('query', (e) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Params: ' + e.params);
    logger.debug('Duration: ' + e.duration + 'ms');
  });

  prisma.$on('error', (e) => {
    logger.error('Database error:', e);
  });

  prisma.$on('info', (e) => {
    logger.info('Database info:', e.message);
  });

  prisma.$on('warn', (e) => {
    logger.warn('Database warning:', e.message);
  });
}

// 数据库连接测试
export const connectDatabase = async (): Promise<void> => {
  if (!prisma) {
    logger.warn('跳过数据库连接，运行在无数据库模式');
    return;
  }

  try {
    await prisma.$connect();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    logger.info('继续在无数据库模式下运行...');
  }
};

// 优雅关闭数据库连接
export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    try {
      await prisma.$disconnect();
      logger.info('数据库连接已断开');
    } catch (error) {
      logger.error('断开数据库连接时出错:', error);
    }
  }
};

// 事务处理辅助函数
export const withTransaction = async <T>(
  callback: (tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]) => Promise<T>
): Promise<T> => {
  if (!prisma) {
    throw new Error('数据库不可用，无法执行事务');
  }
  return prisma.$transaction(callback);
};

export { prisma };