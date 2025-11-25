import { apiClient } from './api';
import type {
  LoginRequest,
  RegisterRequest,
  SendSmsRequest,
  AuthResponse
} from '../types/api';

export const authService = {
  // 发送短信验证码
  async sendSms(data: SendSmsRequest) {
    return apiClient.post('/auth/send-sms', data);
  },

  // 用户注册
  async register(data: RegisterRequest) {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  // 用户登录
  async login(data: LoginRequest) {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  // 刷新令牌
  async refreshToken() {
    return apiClient.post('/auth/refresh-token');
  },

  // 验证令牌
  async verifyToken() {
    return apiClient.get('/auth/verify');
  },

  // 退出登录
  logout() {
    apiClient.removeToken();
  },

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!apiClient['token'];
  }
};