import { Router } from 'express';
import { z } from 'zod';
import { adminRechargeController } from '../../controllers/adminRechargeController';
import { authenticateAdmin, requirePermission } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { adminSchemas, commonSchemas } from '../../middleware/validation';

const router = Router();

// 需要管理员认证的路由
router.use(authenticateAdmin);

// 获取充值订单列表
router.get('/', requirePermission('recharge:read'), validate({
  query: commonSchemas.pagination.extend({
    status: z.enum(['PENDING', 'PAID', 'CONFIRMED', 'CANCELLED', 'REFUNDED']).optional(),
    userId: commonSchemas.idParam.shape.id.optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }),
}), adminRechargeController.getOrders);

// 获取充值订单详情
router.get('/:id', requirePermission('recharge:read'), validate({
  params: commonSchemas.idParam,
}), adminRechargeController.getOrderDetail);

// 确认充值订单
router.patch('/:id/confirm', requirePermission('recharge:confirm'), validate({
  params: commonSchemas.idParam,
  body: z.object({
    tradeNumber: z.string().optional(),
    remark: z.string().max(500).optional(),
  }),
}), adminRechargeController.confirmOrder);

// 取消充值订单
router.patch('/:id/cancel', requirePermission('recharge:manage'), validate({
  params: commonSchemas.idParam,
  body: z.object({
    reason: z.string().min(1).max(200),
  }),
}), adminRechargeController.cancelOrder);

// 退款充值订单
router.patch('/:id/refund', requirePermission('recharge:refund'), validate({
  params: commonSchemas.idParam,
  body: z.object({
    reason: z.string().min(1).max(200),
    refundAmount: z.number().positive().optional(),
  }),
}), adminRechargeController.refundOrder);

// 获取充值统计
router.get('/stats/summary', requirePermission('recharge:read'), adminRechargeController.getRechargeStats);

// 获取充值趋势数据
router.get('/stats/trends', requirePermission('recharge:read'), validate({
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year']).default('day'),
    days: z.coerce.number().int().min(1).max(365).default(30),
  }),
}), adminRechargeController.getRechargeTrends);

// 批量确认充值订单
router.post('/batch/confirm', requirePermission('recharge:confirm'), validate({
  body: z.object({
    orderIds: z.array(z.string().transform((val) => BigInt(val))),
    remark: z.string().max(500).optional(),
  }),
}), adminRechargeController.batchConfirmOrders);

export default router;