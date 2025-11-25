import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logStream?: NodeJS.WriteStream;

  private constructor() {
    // 从环境变量读取日志级别
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    this.logLevel = LogLevel[envLevel as keyof typeof LogLevel] ?? LogLevel.INFO;

    // 创建日志目录和文件
    const logDir = join(process.cwd(), 'logs');
    const logFile = join(logDir, 'app.log');

    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }

    this.logStream = createWriteStream(logFile, { flags: 'a' }) as any;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      meta,
    };
    return JSON.stringify(logEntry);
  }

  private writeLog(level: LogLevel, levelStr: string, message: string, meta?: any): void {
    if (level <= this.logLevel) {
      const formattedMessage = this.formatMessage(levelStr, message, meta);

      // 输出到控制台
      switch (level) {
        case LogLevel.ERROR:
          console.error(`[${levelStr}] ${message}`, meta || '');
          break;
        case LogLevel.WARN:
          console.warn(`[${levelStr}] ${message}`, meta || '');
          break;
        case LogLevel.INFO:
          console.info(`[${levelStr}] ${message}`, meta || '');
          break;
        case LogLevel.DEBUG:
          console.debug(`[${levelStr}] ${message}`, meta || '');
          break;
      }

      // 写入日志文件
      if (this.logStream) {
        this.logStream.write(formattedMessage + '\n');
      }
    }
  }

  public error(message: string, meta?: any): void {
    this.writeLog(LogLevel.ERROR, 'ERROR', message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.writeLog(LogLevel.WARN, 'WARN', message, meta);
  }

  public info(message: string, meta?: any): void {
    this.writeLog(LogLevel.INFO, 'INFO', message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.writeLog(LogLevel.DEBUG, 'DEBUG', message, meta);
  }

  // 请求日志中间件专用
  public request(req: any, res: any, responseTime?: number): void {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
    };

    if (res.statusCode >= 400) {
      this.error('HTTP Request Error', logData);
    } else {
      this.info('HTTP Request', logData);
    }
  }

  // 数据库操作日志
  public database(operation: string, table: string, duration?: number, error?: any): void {
    const logData = {
      operation,
      table,
      duration: duration ? `${duration}ms` : undefined,
    };

    if (error) {
      this.error('Database Operation Error', { ...logData, error: error.message });
    } else {
      this.debug('Database Operation', logData);
    }
  }

  // 安全相关日志
  public security(event: string, userId?: string | number, ip?: string, details?: any): void {
    this.warn('Security Event', {
      event,
      userId,
      ip,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  // 业务日志
  public business(event: string, userId?: string | number, details?: any): void {
    this.info('Business Event', {
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  // 关闭日志流
  public close(): void {
    if (this.logStream) {
      this.logStream.end();
    }
  }
}

export const logger = Logger.getInstance();

// 进程退出时关闭日志流
process.on('SIGTERM', () => {
  logger.close();
});

process.on('SIGINT', () => {
  logger.close();
});