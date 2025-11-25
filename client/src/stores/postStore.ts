import { create } from 'zustand';
import type { Post, PostFilters, PaginationParams } from '../types/api';

interface PostState {
  posts: Post[];
  currentPost: Post | null;
  myPosts: Post[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: PostFilters;
}

interface PostActions {
  fetchPosts: (params?: PostFilters & PaginationParams) => Promise<void>;
  fetchPost: (id: number) => Promise<void>;
  fetchMyPosts: (params?: PaginationParams) => Promise<void>;
  createPost: (data: any) => Promise<void>;
  updatePost: (id: number, data: any) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  viewContact: (id: number) => Promise<{ wechatId: string; viewed: boolean }>;
  markDeal: (id: number, isDealt: boolean) => Promise<void>;
  setFilters: (filters: PostFilters) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const usePostStore = create<PostState & PostActions>((set, get) => ({
  posts: [],
  currentPost: null,
  myPosts: [],
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {},

  fetchPosts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { postService } = await import('../services/postService');
      const response = await postService.getPosts(params);

      if (response.data) {
        set({
          posts: response.data.data,
          pagination: response.data.meta,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '获取交易信息失败',
      });
    }
  },

  fetchPost: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { postService } = await import('../services/postService');
      const response = await postService.getPost(id);

      if (response.data) {
        set({
          currentPost: response.data,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '获取交易信息详情失败',
      });
    }
  },

  fetchMyPosts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { postService } = await import('../services/postService');
      const response = await postService.getMyPosts(params);

      if (response.data) {
        set({
          myPosts: response.data.data,
          pagination: response.data.meta,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '获取我的发布失败',
      });
    }
  },

  createPost: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { postService } = await import('../services/postService');
      await postService.createPost(data);
      set({ isLoading: false });

      // 重新获取列表
      const { fetchPosts } = get();
      fetchPosts();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '发布交易信息失败',
      });
    }
  },

  updatePost: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { postService } = await import('../services/postService');
      await postService.updatePost(id, data);
      set({ isLoading: false });

      // 重新获取列表
      const { fetchPosts, fetchMyPosts } = get();
      fetchPosts();
      fetchMyPosts();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '更新交易信息失败',
      });
    }
  },

  deletePost: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { postService } = await import('../services/postService');
      await postService.deletePost(id);
      set({ isLoading: false });

      // 重新获取列表
      const { fetchPosts, fetchMyPosts } = get();
      fetchPosts();
      fetchMyPosts();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '删除交易信息失败',
      });
    }
  },

  viewContact: async (id) => {
    try {
      const { postService } = await import('../services/postService');
      const response = await postService.viewContact(id);
      return response.data || { wechatId: '', viewed: false };
    } catch (error: any) {
      set({ error: error.message || '查看联系方式失败' });
      throw error;
    }
  },

  markDeal: async (id, isDealt) => {
    try {
      const { postService } = await import('../services/postService');
      await postService.markDeal(id, isDealt);

      // 重新获取列表
      const { fetchPosts, fetchMyPosts } = get();
      fetchPosts();
      fetchMyPosts();
    } catch (error: any) {
      set({ error: error.message || '标记成交失败' });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));