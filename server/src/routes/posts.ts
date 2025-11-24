import { Router } from 'express';
import { postController } from '../controllers/postController';
import { authenticateUser, optionalAuth, checkUserPoints } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { postSchemas } from '../middleware/validation';

const router = Router();

// 公开路由（可选认证）
router.get('/', optionalAuth, validate(postSchemas.list), postController.getPosts);
router.get('/:id', optionalAuth, postController.getPost);

// 需要认证的路由
router.use(authenticateUser);

// 发布交易信息
router.post('/', validate(postSchemas.create), checkUserPoints(10), postController.createPost);

// 更新交易信息
router.put('/:id', validate(postSchemas.update), postController.updatePost);

// 删除交易信息
router.delete('/:id', postController.deletePost);

// 下架/重新上架
router.patch('/:id/status', postController.updatePostStatus);

// 查看联系方式
router.post('/:id/contact', checkUserPoints(1), postController.viewContact);

// 标记成交
router.post('/:id/deal', validate(postSchemas.markDeal), postController.markDeal);

// 获取我的发布
router.get('/my/posts', postController.getMyPosts);

// 搜索交易信息
router.get('/search', validate(postSchemas.list), postController.searchPosts);

export default router;