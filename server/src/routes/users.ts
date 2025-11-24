import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// 需要认证的路由
router.use(authenticateUser);

// 获取用户信息
router.get('/profile', userController.getProfile);

// 更新用户信息
router.put('/profile', userController.updateProfile);

// 获取用户发布的交易信息
router.get('/posts', userController.getUserPosts);

// 获取用户查看记录
router.get('/views', userController.getUserViews);

// 获取积分流水
router.get('/points/transactions', userController.getPointTransactions);

// 获取邀请记录
router.get('/invitations', userController.getInvitations);

// 生成邀请码
router.post('/invite-code', userController.generateInviteCode);

export default router;