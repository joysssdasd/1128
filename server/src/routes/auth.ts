import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// 用户注册
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 发送短信验证码
router.post('/send-sms', authController.sendSms);

// 刷新令牌
router.post('/refresh', authController.refreshToken);

// 验证令牌
router.get('/verify', authController.verifyToken);

export default router;