import { Router } from 'express';
import { z } from 'zod';
import { adminUserController } from '../../controllers/adminUserController';
import { authenticateAdmin, requirePermission } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { adminSchemas, commonSchemas } from '../../middleware/validation';

const router = Router();

// 需要管理员认证的路由
router.use(authenticateAdmin);

// 获取用户列表
router.get('/', requirePermission('user:read'), validate({
  query: commonSchemas.pagination.extend({
    keyword: commonSchemas.phone.optional(),
    status: z.enum(['ACTIVE', 'DISABLED', 'BANNED']).optional(),
  }),
}), adminUserController.getUsers);

// 获取用户详情
router.get('/:id', requirePermission('user:read'), validate({
  params: commonSchemas.idParam,
}), adminUserController.getUserDetail);

// 管理用户状态
router.put('/:id/manage', requirePermission('user:manage'), validate({
  params: commonSchemas.idParam,
  body: z.object({
    status: z.enum(['ACTIVE', 'DISABLED', 'BANNED']).optional(),
    points: z.number().int().optional(),
  }),
}), adminUserController.manageUser);

// 调整用户积分
router.post('/:id/points/adjust', requirePermission('user:points'), validate({
  params: commonSchemas.idParam,
  body: z.object({
    amount: z.number(),
    description: z.string().min(1).max(200),
  }),
}), adminUserController.adjustUserPoints);

// 获取用户积分流水
router.get('/:id/points/transactions', requirePermission('user:read'), validate({
  params: commonSchemas.idParam,
  query: commonSchemas.pagination,
}), adminUserController.getUserPointTransactions);

// 获取用户发布记录
router.get('/:id/posts', requirePermission('user:read'), validate({
  params: commonSchemas.idParam,
  query: commonSchemas.pagination,
}), adminUserController.getUserPosts);

// 获取用户查看记录
router.get('/:id/views', requirePermission('user:read'), validate({
  params: commonSchemas.idParam,
  query: commonSchemas.pagination,
}), adminUserController.getUserViews);

// 禁用/启用用户
router.patch('/:id/status', requirePermission('user:manage'), validate({
  params: commonSchemas.idParam,
  body: z.object({
    status: z.enum(['ACTIVE', 'DISABLED', 'BANNED']),
  }),
}), adminUserController.updateUserStatus);

export default router;