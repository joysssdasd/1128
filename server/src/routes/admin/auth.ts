import { Router } from 'express';
import { adminAuthController } from '../../controllers/adminAuthController';
import { authenticateAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { adminSchemas } from '../../middleware/validation';

const router = Router();

// 管理员登录
router.post('/login', validate({ body: adminSchemas.login.shape.body }), adminAuthController.login);

// 需要管理员认证的路由
router.use(authenticateAdmin);

// 获取管理员信息
router.get('/profile', adminAuthController.getProfile);

// 更新管理员信息
router.put('/profile', adminAuthController.updateProfile);

// 修改密码
router.put('/password', adminAuthController.changePassword);

// 退出登录
router.post('/logout', adminAuthController.logout);

export default router;