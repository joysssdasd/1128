import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// 导入路由
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import rechargeRoutes from './routes/recharge';
import adminAuthRoutes from './routes/admin/auth';
import adminUserRoutes from './routes/admin/users';
import adminPostRoutes from './routes/admin/posts';
import adminRechargeRoutes from './routes/admin/recharge';
import adminSystemRoutes from './routes/admin/system';

class Server {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS配置
    this.app.use(cors({
      origin: (origin, callback) => {
        // 允许的域名列表
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:5177',
          'http://localhost:8080',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5177',
          'http://127.0.0.1:8080',
        ];

        // 开发环境允许所有域名
        if (config.app.env === 'development') {
          callback(null, true);
        } else {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'), false);
          }
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // 压缩中间件
    this.app.use(compression());

    // 请求日志中间件
    if (config.log.level === 'debug') {
      this.app.use(morgan('dev'));
    }
    this.app.use(requestLogger);

    // 请求体解析中间件
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 限流中间件
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        code: 429,
        message: '请求过于频繁，请稍后再试',
        timestamp: new Date().toISOString(),
      },
      standardHeaders: true, // 返回速率限制信息在 `RateLimit-*` headers
      legacyHeaders: false, // 禁用 `X-RateLimit-*` headers
      handler: (req, res) => {
        logger.security('Rate limit exceeded', undefined, req.ip, {
          url: req.url,
          userAgent: req.get('User-Agent'),
        });
        res.status(429).json({
          success: false,
          code: 429,
          message: '请求过于频繁，请稍后再试',
          timestamp: new Date().toISOString(),
        });
      },
    });

    this.app.use('/api/', limiter);

    // 信任代理（用于获取真实IP）
    this.app.set('trust proxy', 1);
  }

  private setupRoutes(): void {
    // 根路由
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: '欢迎使用交易信息撮合平台 API',
        timestamp: new Date().toISOString(),
        data: {
          name: config.app.name,
          version: config.app.version,
          environment: config.app.env,
          endpoints: {
            health: '/health',
            api: '/api',
            auth: '/api/auth',
            posts: '/api/posts',
            admin: '/api/admin'
          },
          documentation: '请访问 /api 查看完整API文档'
        },
      });
    });

    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: '服务运行正常',
        timestamp: new Date().toISOString(),
        data: {
          name: config.app.name,
          version: config.app.version,
          environment: config.app.env,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        },
      });
    });

    // API路由
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/posts', postRoutes);
    this.app.use('/api/recharge', rechargeRoutes);

    // 管理后台路由
    this.app.use('/api/admin/auth', adminAuthRoutes);
    this.app.use('/api/admin/users', adminUserRoutes);
    this.app.use('/api/admin/posts', adminPostRoutes);
    this.app.use('/api/admin/recharge', adminRechargeRoutes);
    this.app.use('/api/admin/system', adminSystemRoutes);

    // 静态文件服务（用于用户头像等）
    this.app.use('/uploads', express.static('uploads'));

    // API文档（开发环境）
    if (config.app.env === 'development') {
      this.app.get('/api', (req, res) => {
        res.json({
          success: true,
          message: '交易信息撮合平台 API',
          version: config.app.version,
          endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            posts: '/api/posts',
            recharge: '/api/recharge',
            admin: {
              auth: '/api/admin/auth',
              users: '/api/admin/users',
              posts: '/api/admin/posts',
              recharge: '/api/admin/recharge',
              system: '/api/admin/system',
            },
          },
          documentation: 'https://api-docs.trading-platform.com',
          timestamp: new Date().toISOString(),
        });
      });
    }
  }

  private setupErrorHandling(): void {
    // 404处理
    this.app.use(notFoundHandler);

    // 全局错误处理
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // 连接数据库
      await connectDatabase();

      // 启动服务器
      this.server = this.app.listen(config.app.port, () => {
        logger.info(`🚀 服务器启动成功`, {
          port: config.app.port,
          environment: config.app.env,
          name: config.app.name,
          version: config.app.version,
          pid: process.pid,
        });

        // 开发环境下输出友好信息
        if (config.app.env === 'development') {
          console.log(`
🎉 交易信息撮合平台启动成功！

📊 服务信息:
   - 名称: ${config.app.name}
   - 版本: ${config.app.version}
   - 环境: ${config.app.env}
   - 端口: ${config.app.port}

🌐 访问地址:
   - API服务: http://localhost:${config.app.port}
   - 健康检查: http://localhost:${config.app.port}/health
   - API文档: http://localhost:${config.app.port}/api

📚 主要端点:
   - 用户认证: POST /api/auth/login
   - 交易信息: GET /api/posts
   - 管理后台: POST /api/admin/auth/login

🎯 数据库:
   - PostgreSQL: ${config.database.url ? config.database.url.replace(/\/\/.*@/, '//***:***@') : '未配置'}

⏰ 启动时间: ${new Date().toLocaleString()}
          `);
        }
      });

      // 优雅关闭处理
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('服务器启动失败:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`收到 ${signal} 信号，开始优雅关闭...`);

      // 停止接受新连接
      this.server.close(async () => {
        logger.info('HTTP服务器已关闭');

        try {
          // 断开数据库连接
          await disconnectDatabase();

          logger.info('✅ 优雅关闭完成');
          process.exit(0);
        } catch (error) {
          logger.error('优雅关闭时出错:', error);
          process.exit(1);
        }
      });

      // 强制关闭超时
      setTimeout(() => {
        logger.error('强制关闭服务器');
        process.exit(1);
      }, 30000); // 30秒超时
    };

    // 监听关闭信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 监听未捕获的异常
    process.on('uncaughtException', (error) => {
      logger.error('未捕获的异常:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('未处理的Promise拒绝:', { reason, promise });
      gracefulShutdown('unhandledRejection');
    });
  }
}

// 启动服务器
const server = new Server();
server.start().catch((error) => {
  logger.error('启动服务器失败:', error);
  process.exit(1);
});