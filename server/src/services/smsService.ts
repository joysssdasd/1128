import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export interface SmsResponse {
  success: boolean;
  message: string;
  requestId?: string;
}

export class SmsService {
  private static instance: SmsService;

  private constructor() {}

  public static getInstance(): SmsService {
    if (!SmsService.instance) {
      SmsService.instance = new SmsService();
    }
    return SmsService.instance;
  }

  /**
   * 发送短信验证码
   * @param phone 手机号
   * @param code 验证码
   * @param type 短信类型
   */
  public async sendVerificationCode(
    phone: string,
    code: string,
    type: 'register' | 'login' | 'reset_password'
  ): Promise<SmsResponse> {
    try {
      const typeText = {
        register: '注册',
        login: '登录',
        reset_password: '重置密码'
      }[type];

      // 记录发送日志
      logger.business('开始发送短信', undefined, {
        phone,
        type,
        code,
        smsUrl: config.sms.url,
        userId: config.sms.userId,
        appKey: config.sms.appKey,
        env: process.env.NODE_ENV
      });

      // 注释掉开发环境判断，直接使用真实SMS服务
      // if (process.env.NODE_ENV === 'development') {
      //   logger.business('开发环境：模拟短信发送成功', undefined, {
      //     phone,
      //     code,
      //     type,
      //     note: '开发环境验证码直接返回成功'
      //   });

      //   return {
      //     success: true,
      //     message: `验证码发送成功！验证码：${code}`,
      //     requestId: 'development-mock'
      //   };
      // }

      // 生产环境使用Spug平台发送短信
      const cleanPhone = phone.startsWith('+86') ? phone.substring(3) : phone;
      const requestParams = {
        userId: config.sms.userId,
        name: '短信',
        value: code,
        targets: cleanPhone,
        appKey: config.sms.appKey
      };

      logger.business('短信请求参数', undefined, requestParams);

      const response = await axios.get(
        config.sms.url,
        {
          params: requestParams,
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      logger.business('短信API响应', undefined, {
        status: response.status,
        data: response.data
      });

      if (response.data.code === 204 || response.status === 200) {
        logger.business('短信发送成功', undefined, { phone, type });
        return {
          success: true,
          message: '验证码发送成功',
          requestId: response.data.requestId || 'success'
        };
      } else {
        logger.error('短信发送失败', response.data);
        return {
          success: false,
          message: response.data.msg || response.data.message || '短信发送失败'
        };
      }
    } catch (error) {
      logger.error('短信服务异常', error);

      // 开发环境异常也返回成功，确保测试可用
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          message: `验证码发送成功！验证码：${code}`,
          requestId: 'development-fallback'
        };
      }

      return {
        success: false,
        message: '短信服务暂时不可用，请稍后重试'
      };
    }
  }

  /**
   * 验证短信验证码格式
   * @param code 验证码
   */
  public static validateCode(code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  /**
   * 生成随机验证码
   */
  public static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export const smsService = SmsService.getInstance();