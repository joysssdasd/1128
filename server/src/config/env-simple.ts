import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';

// 加载环境变量
dotenvConfig({ path: join(process.cwd(), '.env') });

// 简单的环境变量配置
export const config = {
  app: {
    name: process.env.APP_NAME || '交易信息撮合平台',
    version: process.env.APP_VERSION || '1.0.0',
    description: process.env.APP_DESCRIPTION || '积分驱动的C2C交易信息撮合平台',
    port: Number(process.env.PORT) || 3001,
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: Number(process.env.REDIS_DB) || 0,
  },
  sms: {
    url: process.env.SMS_URL,
    userId: process.env.SMS_USER_ID,
    appKey: process.env.SMS_APP_KEY,
    signName: process.env.SMS_SIGN_NAME || '交易撮合平台',
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  upload: {
    maxSize: Number(process.env.UPLOAD_MAX_SIZE) || 10485760,
    allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif').split(','),
  },
  admin: {
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'admin123456',
  },
  ai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
  security: {
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  },
  payment: {
    wechatPayAppId: process.env.WECHAT_PAY_APP_ID,
    wechatPayMchId: process.env.WECHAT_PAY_MCH_ID,
    wechatPayKey: process.env.WECHAT_PAY_KEY,
    alipayAppId: process.env.ALIPAY_APP_ID,
    alipayPrivateKey: process.env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
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