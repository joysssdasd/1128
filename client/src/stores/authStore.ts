import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/api';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (phone: string, smsCode: string) => Promise<void>;
  register: (phone: string, smsCode: string, wechatId: string, inviteCode?: string) => Promise<void>;
  logout: () => void;
  sendSms: (phone: string, type: 'register' | 'login' | 'reset_password') => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (phone: string, smsCode: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ phone, smsCode });
          if (response.data?.user && response.data?.token) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || '登录失败',
          });
          throw error;
        }
      },

      register: async (phone: string, smsCode: string, wechatId: string, inviteCode?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({ phone, smsCode, wechatId, inviteCode });
          if (response.data?.user && response.data?.token) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || '注册失败',
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      sendSms: async (phone: string, type: 'register' | 'login' | 'reset_password') => {
        set({ isLoading: true, error: null });
        try {
          await authService.sendSms({ phone, type });
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || '发送验证码失败',
          });
          throw error;
        }
      },

      checkAuth: () => {
        const { token } = get();
        if (token && authService.isAuthenticated()) {
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: false, user: null, token: null });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);