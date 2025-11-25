import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';
import { join } from 'path';

// 加载环境变量，使用相对路径
// 在生产环境中，EdgeOne会自动注入环境变量
dotenvConfig({ path: join(process.cwd(), '.env') });

// 环境变量验证schema
const envSchema = z.object({
  // 数据库配置
  DATABASE_URL: z.string().optional(),

  // JWT配置
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('30d'),

  // Redis配置
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_DB: z.coerce.number().default(0),

  // 服务器配置
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // 短信服务配置
  SMS_URL: z.string().optional(),
  SMS_USER_ID: z.string().optional(),
  SMS_APP_KEY: z.string().optional(),
  SMS_SIGN_NAME: z.string().default('交易撮合平台'),

  // 邮件服务配置
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // API限流配置
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15分钟
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // 文件上传配置
  UPLOAD_MAX_SIZE: z.coerce.number().default(10485760), // 10MB
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/gif'),

  // 后台管理配置
  ADMIN_DEFAULT_PASSWORD: z.string().default('admin123456'),

  // 外部API配置
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().default('https://api.openai.com/v1'),

  // 应用配置
  APP_NAME: z.string().default('交易信息撮合平台'),
  APP_VERSION: z.string().default('1.0.0'),
  APP_DESCRIPTION: z.string().default('积分驱动的C2C交易信息撮合平台'),

  // 安全配置
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  SESSION_SECRET: z.string().default('your-session-secret-change-in-production'),

  // 日志配置
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),

  // CORS配置
  CORS_ORIGIN: z.string().optional(),

  // 监控配置
  SENTRY_DSN: z.string().optional(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),

  // 支付配置
  WECHAT_PAY_APP_ID: z.string().optional(),
  WECHAT_PAY_MCH_ID: z.string().optional(),
  WECHAT_PAY_KEY: z.string().optional(),
  ALIPAY_APP_ID: z.string().optional(),
  ALIPAY_PRIVATE_KEY: z.string().optional(),
  ALIPAY_PUBLIC_KEY: z.string().optional(),
});

// 验证环境变量
const validatedEnv = envSchema.safeParse(process.env);

if (!validatedEnv.success) {
  console.error('❌ 环境变量验证失败:', validatedEnv.error.format());
  process.exit(1);
}

const env = validatedEnv.data;

// 导出配置对象
export const config = {
  app: {
    name: env.APP_NAME,
    version: env.APP_VERSION,
    description: env.APP_DESCRIPTION,
    port: env.PORT,
    env: env.NODE_ENV,
  },
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  },
  sms: {
    url: env.SMS_URL,
    userId: env.SMS_USER_ID,
    appKey: env.SMS_APP_KEY,
    signName: env.SMS_SIGN_NAME,
  },
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  upload: {
    maxSize: env.UPLOAD_MAX_SIZE,
    allowedTypes: env.UPLOAD_ALLOWED_TYPES.split(','),
  },
  admin: {
    defaultPassword: env.ADMIN_DEFAULT_PASSWORD,
  },
  ai: {
    apiKey: env.OPENAI_API_KEY,
    baseUrl: env.OPENAI_BASE_URL,
  },
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    sessionSecret: env.SESSION_SECRET,
  },
  log: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  monitoring: {
    sentryDsn: env.SENTRY_DSN,
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
  },
  payment: {
    wechatPayAppId: env.WECHAT_PAY_APP_ID,
    wechatPayMchId: env.WECHAT_PAY_MCH_ID,
    wechatPayKey: env.WECHAT_PAY_KEY,
    alipayAppId: env.ALIPAY_APP_ID,
    alipayPrivateKey: env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: env.ALIPAY_PUBLIC_KEY,
  },
} as const;

// 检查必要的环境变量
if (!config.database.url) {
  console.warn('⚠️  未配置DATABASE_URL，将在无数据库模式下运行');
}

console.log('✅ 环境变量配置加载成功');
console.log(`🚀 应用: ${config.app.name} v${config.app.version}`);
console.log(`🌍 环境: ${config.app.env}`);
console.log(`📊 端口: ${config.app.port}`);
console.log(`🗄️  数据库: ${config.database.url ? '已配置' : '未配置'}`);