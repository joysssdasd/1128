import { Router } from 'express';
import { z } from 'zod';
import { adminPostController } from '../../controllers/adminPostController';
import { authenticateAdmin, requirePermission } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { adminSchemas, commonSchemas, postSchemas } from '../../middleware/validation';

const router = Router();

// 需要管理员认证的路由
router.use(authenticateAdmin);

// 获取交易信息列表
router.get('/', requirePermission('post:read'), validate({
  query: commonSchemas.pagination.extend({
    keyword: z.string().optional(),
    tradeType: z.enum(['BUY', 'SELL', 'LONG', 'SHORT']).optional(),
    status: z.enum(['ACTIVE', 'EXPIRED', 'DISABLED']).optional(),
    userId: z.string().transform((val) => BigInt(val)).optional(),
  }),
}), adminPostController.getPosts);

// 获取交易信息详情
router.get('/:id', requirePermission('post:read'), validate({
  params: commonSchemas.idParam,
}), adminPostController.getPostDetail);

// 删除交易信息
router.delete('/:id', requirePermission('post:delete'), validate({
  params: commonSchemas.idParam,
}), adminPostController.deletePost);

// 下架交易信息
router.patch('/:id/disable', requirePermission('post:manage'), validate({
  params: commonSchemas.idParam,
}), adminPostController.disablePost);

// 置顶交易信息
router.patch('/:id/pin', requirePermission('post:manage'), validate({
  params: commonSchemas.idParam,
  body: z.object({
    isPinned: z.boolean(),
    priority: z.number().int().min(0).max(100).optional(),
  }),
}), adminPostController.pinPost);

// 获取交易信息查看记录
router.get('/:id/views', requirePermission('post:read'), validate({
  params: commonSchemas.idParam,
  query: commonSchemas.pagination,
}), adminPostController.getPostViews);

// 批量操作交易信息
router.post('/batch', requirePermission('post:manage'), validate({
  body: z.object({
    action: z.enum(['delete', 'disable', 'enable']),
    postIds: z.array(z.string().transform((val) => BigInt(val))),
  }),
}), adminPostController.batchOperatePosts);

// 获取敏感词检测结果
router.get('/sensitive/check', requirePermission('post:read'), adminPostController.getSensitiveWordsCheck);

// 添加敏感词
router.post('/sensitive/words', requirePermission('system:manage'), validate({
  body: z.object({
    word: z.string().min(1).max(100),
    category: z.string().min(1).max(50),
    level: z.number().int().min(1).max(3),
  }),
}), adminPostController.addSensitiveWord);

// 获取敏感词列表
router.get('/sensitive/words', requirePermission('system:read'), validate({
  query: commonSchemas.pagination.extend({
    category: z.string().optional(),
    level: z.number().int().min(1).max(3).optional(),
  }),
}), adminPostController.getSensitiveWords);

// 更新敏感词
router.put('/sensitive/words/:id', requirePermission('system:manage'), validate({
  params: commonSchemas.idParam,
  body: z.object({
    word: z.string().min(1).max(100).optional(),
    category: z.string().min(1).max(50).optional(),
    level: z.number().int().min(1).max(3).optional(),
    isActive: z.boolean().optional(),
  }),
}), adminPostController.updateSensitiveWord);

// 删除敏感词
router.delete('/sensitive/words/:id', requirePermission('system:manage'), validate({
  params: commonSchemas.idParam,
}), adminPostController.deleteSensitiveWord);

export default router;