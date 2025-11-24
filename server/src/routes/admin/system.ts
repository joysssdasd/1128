import { Router } from 'express';
import { z } from 'zod';
import { adminSystemController } from '../../controllers/adminSystemController';
import { authenticateAdmin, requirePermission, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { adminSchemas, commonSchemas } from '../../middleware/validation';

const router = Router();

// 需要管理员认证的路由
router.use(authenticateAdmin);

// 获取系统概览统计
router.get('/overview', requirePermission('dashboard:read'), adminSystemController.getSystemOverview);

// 获取用户统计
router.get('/stats/users', requirePermission('stats:read'), validate({
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year']).default('day'),
    days: z.coerce.number().int().min(1).max(365).default(30),
  }),
}), adminSystemController.getUserStats);

// 获取交易信息统计
router.get('/stats/posts', requirePermission('stats:read'), validate({
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year']).default('day'),
    days: z.coerce.number().int().min(1).max(365).default(30),
  }),
}), adminSystemController.getPostStats);

// 获取积分统计
router.get('/stats/points', requirePermission('stats:read'), validate({
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year']).default('day'),
    days: z.coerce.number().int().min(1).max(365).default(30),
  }),
}), adminSystemController.getPointStats);

// 获取系统公告列表
router.get('/announcements', requirePermission('announcement:read'), validate({
  query: commonSchemas.pagination.extend({
    isActive: z.boolean().optional(),
  }),
}), adminSystemController.getAnnouncements);

// 创建系统公告
router.post('/announcements', requirePermission('announcement:create'), validate({
  body: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(5000),
    priority: z.number().int().min(0).max(100).default(0),
    isActive: z.boolean().default(true),
  }),
}), adminSystemController.createAnnouncement);

// 更新系统公告
router.put('/announcements/:id', requirePermission('announcement:update'), validate({
  params: commonSchemas.idParam,
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).max(5000).optional(),
    priority: z.number().int().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
}), adminSystemController.updateAnnouncement);

// 删除系统公告
router.delete('/announcements/:id', requirePermission('announcement:delete'), validate({
  params: commonSchemas.idParam,
}), adminSystemController.deleteAnnouncement);

// 获取系统配置
router.get('/config', requirePermission('config:read'), adminSystemController.getSystemConfig);

// 更新系统配置
router.put('/config', requireRole('SUPER_ADMIN'), validate({
  body: z.object({
    publishPointsCost: z.number().int().min(0).optional(),
    viewPointsCost: z.number().int().min(0).optional(),
    inviteRewardPoints: z.number().int().min(0).optional(),
    invitedRewardPoints: z.number().int().min(0).optional(),
    postExpireHours: z.number().int().min(1).max(720).optional(),
    maxPostsPerDay: z.number().int().min(1).max(100).optional(),
    maxViewsPerHour: z.number().int().min(1).max(100).optional(),
    hotKeywords: z.array(z.string().max(50)).optional(),
  }),
}), adminSystemController.updateSystemConfig);

// 获取热门关键词
router.get('/hot-keywords', requirePermission('config:read'), adminSystemController.getHotKeywords);

// 更新热门关键词
router.put('/hot-keywords', requirePermission('config:update'), validate({
  body: z.object({
    keywords: z.array(z.string().max(50)).max(20),
  }),
}), adminSystemController.updateHotKeywords);

// 获取系统日志
router.get('/logs', requireRole('SUPER_ADMIN'), validate({
  query: commonSchemas.pagination.extend({
    level: z.enum(['error', 'warn', 'info', 'debug']).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    keyword: z.string().max(100).optional(),
  }),
}), adminSystemController.getSystemLogs);

// 清理系统日志
router.delete('/logs', requireRole('SUPER_ADMIN'), validate({
  body: z.object({
    days: z.number().int().min(1).max(365).default(30),
    level: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  }),
}), adminSystemController.cleanSystemLogs);

// 备份数据库
router.post('/backup', requireRole('SUPER_ADMIN'), validate({
  body: z.object({
    type: z.enum(['full', 'users', 'posts', 'transactions']).default('full'),
    description: z.string().max(200).optional(),
  }),
}), adminSystemController.backupDatabase);

// 获取备份列表
router.get('/backups', requireRole('SUPER_ADMIN'), adminSystemController.getBackups);

// 恢复数据库
router.post('/restore', requireRole('SUPER_ADMIN'), validate({
  body: z.object({
    backupId: z.string(),
    confirm: z.boolean(),
  }),
}), adminSystemController.restoreDatabase);

// AI批量发布功能
router.post('/ai/batch-publish', requirePermission('ai:publish'), validate({
  body: z.object({
    content: z.string().min(1).max(10000),
    userId: z.string().transform((val) => BigInt(val)),
    settings: z.object({
      postCount: z.number().int().min(1).max(50).default(10),
      minPrice: z.number().positive().optional(),
      maxPrice: z.number().positive().optional(),
      tradeTypes: z.array(z.enum(['BUY', 'SELL', 'LONG', 'SHORT'])).optional(),
    }).optional(),
  }),
}), adminSystemController.aiBatchPublish);

export default router;