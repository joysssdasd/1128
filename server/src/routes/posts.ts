import { Router } from 'express';
import { postController } from '../controllers/postController';
import { authenticateUser, optionalAuth, checkUserPoints } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { postSchemas } from '../middleware/validation';

const router = Router();

// 公开路由（可选认证）
router.get('/', optionalAuth, validate({ query: postSchemas.list.shape.query }), postController.getPosts);
router.get('/:id', optionalAuth, postController.getPost);

// 需要认证的路由
router.use(authenticateUser);

// 发布交易信息
router.post('/', validate({ body: postSchemas.create.shape.body }), checkUserPoints(10), postController.createPost);

// 更新交易信息
router.put('/:id', validate({ params: postSchemas.update.shape.params, body: postSchemas.update.shape.body }), postController.updatePost);

// 删除交易信息
router.delete('/:id', postController.deletePost);

// 下架/重新上架
router.patch('/:id/status', postController.updatePostStatus);

// 查看联系方式
router.post('/:id/contact', checkUserPoints(1), postController.viewContact);

// 标记成交
router.post('/:id/deal', validate({ params: postSchemas.markDeal.shape.params, body: postSchemas.markDeal.shape.body }), postController.markDeal);

// 获取我的发布
router.get('/my/posts', postController.getMyPosts);

// 搜索交易信息
router.get('/search', validate({ query: postSchemas.list.shape.query }), postController.searchPosts);

export default router;