import { Router } from 'express';
import { rechargeController } from '../controllers/rechargeController';
import { authenticateUser } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { rechargeSchemas } from '../middleware/validation';

const router = Router();

// 需要认证的路由
router.use(authenticateUser);

// 创建充值订单
router.post('/orders', validate(rechargeSchemas.create), rechargeController.createOrder);

// 获取充值订单列表
router.get('/orders', rechargeController.getOrders);

// 获取单个充值订单
router.get('/orders/:id', rechargeController.getOrder);

// 取消充值订单
router.delete('/orders/:id', rechargeController.cancelOrder);

// 获取充值记录
router.get('/history', rechargeController.getRechargeHistory);

// 获取积分余额
router.get('/points/balance', rechargeController.getPointsBalance);

export default router;