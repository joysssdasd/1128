import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量，指定.env文件的正确路径
dotenvConfig({ path: join(__dirname, '../../.env') });

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
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),

  // 服务器配置
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // 短信服务配置 (Spug平台)
  SMS_URL: z.string().optional(),
  SMS_USER_ID: z.string().optional(),
  SMS_APP_KEY: z.string().optional(),
  SMS_SIGN_NAME: z.string().default('交易撮合平台'),

  // 邮件服务配置
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // API限流配置
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15分钟
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // 文件上传配置
  UPLOAD_MAX_SIZE: z.coerce.number().default(10 * 1024 * 1024), // 10MB
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/gif'),

  // 后台管理配置
  ADMIN_DEFAULT_PASSWORD: z.string().default('admin123456'),

  // AI服务配置
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().default('https://api.openai.com/v1'),

  // 应用配置
  APP_NAME: z.string().default('交易信息撮合平台'),
  APP_VERSION: z.string().default('1.0.0'),
  APP_DESCRIPTION: z.string().default('积分驱动的C2C交易信息撮合平台'),

  // 安全配置
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),

  // 日志配置
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
});

// 验证环境变量
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error('❌ 环境变量验证失败:');
  console.error(envValidation.error.format());
  process.exit(1);
}

export const env = envValidation.data;

// 调试输出：确认端口配置
console.log('🔧 环境变量配置:');
console.log('- PORT:', process.env.PORT);
console.log('- 解析后的端口:', env.PORT);

// 导出常用配置
export const config = {
  app: {
    name: env.APP_NAME,
    version: env.APP_VERSION,
    description: env.APP_DESCRIPTION,
    env: env.NODE_ENV,
    port: env.PORT,
  },
  database: {
    url: env.DATABASE_URL || null,
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
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    sessionSecret: env.SESSION_SECRET,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  upload: {
    maxSize: env.UPLOAD_MAX_SIZE,
    allowedTypes: env.UPLOAD_ALLOWED_TYPES.split(','),
  },
  sms: {
    url: env.SMS_URL!,
    userId: env.SMS_USER_ID!,
    appKey: env.SMS_APP_KEY!,
    signName: env.SMS_SIGN_NAME,
  },
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  ai: {
    openaiApiKey: env.OPENAI_API_KEY,
    openaiBaseUrl: env.OPENAI_BASE_URL,
  },
  log: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
  },
  admin: {
    defaultPassword: env.ADMIN_DEFAULT_PASSWORD,
  },
} as const;

export type Config = typeof config;