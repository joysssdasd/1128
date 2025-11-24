import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from './errorHandler';

// 通用验证中间件工厂
export const validate = (schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 验证请求体
      if (schema.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) {
          const errors = result.error.errors.map(error => ({
            field: error.path.join('.'),
            message: error.message,
            code: error.code,
          }));
          throw new ValidationError('请求参数验证失败', errors);
        }
        req.body = result.data;
      }

      // 验证查询参数
      if (schema.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) {
          const errors = result.error.errors.map(error => ({
            field: error.path.join('.'),
            message: error.message,
            code: error.code,
          }));
          throw new ValidationError('查询参数验证失败', errors);
        }
        req.query = result.data;
      }

      // 验证路径参数
      if (schema.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) {
          const errors = result.error.errors.map(error => ({
            field: error.path.join('.'),
            message: error.message,
            code: error.code,
          }));
          throw new ValidationError('路径参数验证失败', errors);
        }
        req.params = result.data;
      }

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        next(error);
      } else {
        next(new ValidationError('参数验证失败'));
      }
    }
  };
};

// 常用验证schemas
export const commonSchemas = {
  // 分页参数
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().nonnegative().optional(),
  }),

  // ID参数
  idParam: z.object({
    id: z.string().transform((val) => BigInt(val)),
  }),

  // 手机号
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),

  // 微信号
  wechatId: z.string()
    .regex(/^[a-zA-Z0-9_-]{6,20}$/, '微信号格式不正确'),

  // 邀请码
  inviteCode: z.string()
    .regex(/^[A-Z0-9]{6,10}$/, '邀请码格式不正确'),

  // 密码
  password: z.string()
    .min(6, '密码至少6位')
    .max(20, '密码最多20位'),

  // 短信验证码
  smsCode: z.string()
    .regex(/^\d{6}$/, '验证码格式不正确'),

  // 交易标题
  postTitle: z.string()
    .min(1, '标题不能为空')
    .max(100, '标题最多100个字符'),

  // 交易关键词
  postKeywords: z.string()
    .min(1, '关键词不能为空')
    .max(200, '关键词最多200个字符'),

  // 交易价格
  postPrice: z.number()
    .nonnegative('价格不能为负数')
    .max(99999999.99, '价格超出最大限制'),

  // 交易类型
  tradeType: z.enum(['BUY', 'SELL', 'LONG', 'SHORT'], {
    errorMap: () => ({ message: '无效的交易类型' }),
  }),

  // 交割时间
  deliveryDate: z.coerce.date()
    .min(new Date(), '交割时间不能早于今天'),

  // 补充信息
  extraInfo: z.string()
    .max(100, '补充信息最多100个字符')
    .optional(),

  // 搜索关键词
  searchKeyword: z.string()
    .min(1, '搜索关键词不能为空')
    .max(50, '搜索关键词最多50个字符'),

  // 价格区间
  priceRange: z.object({
    min: z.number().nonnegative('最低价格不能为负数').optional(),
    max: z.number().nonnegative('最高价格不能为负数').optional(),
  }).refine(
    (data) => {
      if (data.min !== undefined && data.max !== undefined) {
        return data.min <= data.max;
      }
      return true;
    },
    {
      message: '最低价格不能大于最高价格',
    }
  ),
};

// 用户相关验证schemas
export const userSchemas = {
  // 用户注册
  register: z.object({
    body: z.object({
      phone: commonSchemas.phone,
      smsCode: commonSchemas.smsCode,
      wechatId: commonSchemas.wechatId,
      inviteCode: commonSchemas.inviteCode.optional(),
    }),
  }),

  // 用户登录
  login: z.object({
    body: z.object({
      phone: commonSchemas.phone,
      smsCode: commonSchemas.smsCode,
    }),
  }),

  // 发送短信验证码
  sendSms: z.object({
    body: z.object({
      phone: commonSchemas.phone,
      type: z.enum(['register', 'login', 'reset_password'], {
        errorMap: () => ({ message: '无效的验证码类型' }),
      }),
    }),
  }),

  // 更新用户资料
  updateProfile: z.object({
    body: z.object({
      wechatId: commonSchemas.wechatId.optional(),
    }),
  }),
};

// 交易信息相关验证schemas
export const postSchemas = {
  // 发布交易信息
  create: z.object({
    body: z.object({
      title: commonSchemas.postTitle,
      keywords: commonSchemas.postKeywords,
      price: commonSchemas.postPrice,
      tradeType: commonSchemas.tradeType,
      deliveryDate: commonSchemas.deliveryDate.optional(),
      extraInfo: commonSchemas.extraInfo.optional(),
    }),
  }),

  // 更新交易信息
  update: z.object({
    params: commonSchemas.idParam,
    body: z.object({
      title: commonSchemas.postTitle.optional(),
      keywords: commonSchemas.postKeywords.optional(),
      price: commonSchemas.postPrice.optional(),
      tradeType: commonSchemas.tradeType.optional(),
      deliveryDate: commonSchemas.deliveryDate.optional(),
      extraInfo: commonSchemas.extraInfo.optional(),
    }),
  }),

  // 查询交易信息列表
  list: z.object({
    query: z.object({
      ...commonSchemas.pagination.shape,
      keyword: commonSchemas.searchKeyword.optional(),
      tradeType: commonSchemas.tradeType.optional(),
      priceRange: commonSchemas.priceRange.optional(),
      sortBy: z.enum(['createdAt', 'price', 'dealRate', 'viewCount'], {
        errorMap: () => ({ message: '无效的排序字段' }),
      }).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc'], {
        errorMap: () => ({ message: '无效的排序方向' }),
      }).default('desc'),
    }),
  }),

  // 查看联系方式
  viewContact: z.object({
    params: commonSchemas.idParam,
  }),

  // 标记成交
  markDeal: z.object({
    params: commonSchemas.idParam,
    body: z.object({
      isDealt: z.boolean(),
    }),
  }),
};

// 充值订单相关验证schemas
export const rechargeSchemas = {
  // 创建充值订单
  create: z.object({
    body: z.object({
      amount: z.number()
        .positive('充值金额必须大于0')
        .min(1, '最低充值1元')
        .max(100000, '单次充值最多100000元'),
      paymentMethod: z.string().optional(),
    }),
  }),

  // 确认充值
  confirm: z.object({
    params: commonSchemas.idParam,
    body: z.object({
      tradeNumber: z.string().optional(),
      remark: z.string().max(500, '备注最多500个字符').optional(),
    }),
  }),
};

// 管理员相关验证schemas
export const adminSchemas = {
  // 管理员登录
  login: z.object({
    body: z.object({
      username: z.string().min(1, '用户名不能为空'),
      password: z.string().min(1, '密码不能为空'),
    }),
  }),

  // 创建管理员
  create: z.object({
    body: z.object({
      username: z.string()
        .min(3, '用户名至少3个字符')
        .max(50, '用户名最多50个字符')
        .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和横线'),
      password: commonSchemas.password,
      email: z.string().email('邮箱格式不正确').optional(),
      role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER'], {
        errorMap: () => ({ message: '无效的管理员角色' }),
      }),
      permissions: z.array(z.string()).default([]),
    }),
  }),

  // 更新管理员
  update: z.object({
    params: commonSchemas.idParam,
    body: z.object({
      username: z.string()
        .min(3, '用户名至少3个字符')
        .max(50, '用户名最多50个字符')
        .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和横线')
        .optional(),
      password: commonSchemas.password.optional(),
      email: z.string().email('邮箱格式不正确').optional(),
      role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER'], {
        errorMap: () => ({ message: '无效的管理员角色' }),
      }).optional(),
      permissions: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    }),
  }),

  // 用户管理
  manageUser: z.object({
    params: commonSchemas.idParam,
    body: z.object({
      status: z.enum(['ACTIVE', 'DISABLED', 'BANNED'], {
        errorMap: () => ({ message: '无效的用户状态' }),
      }).optional(),
      points: z.number().int().optional(),
    }),
  }),

  // 积分调整
  adjustPoints: z.object({
    params: commonSchemas.idParam,
    body: z.object({
      amount: z.number(),
      description: z.string().min(1, '调整说明不能为空').max(200, '调整说明最多200个字符'),
    }),
  }),
};