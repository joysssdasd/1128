import { apiClient } from './api';
import type {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PostFilters,
  PaginationParams,
  PaginatedResponse
} from '../types/api';

export const postService = {
  // 获取交易信息列表
  async getPosts(params?: PaginationParams & PostFilters) {
    return apiClient.get<PaginatedResponse<Post>>('/posts', params);
  },

  // 获取交易信息详情
  async getPost(id: number) {
    return apiClient.get<Post>(`/posts/${id}`);
  },

  // 发布交易信息
  async createPost(data: CreatePostRequest) {
    return apiClient.post<Post>('/posts', data);
  },

  // 更新交易信息
  async updatePost(id: number, data: UpdatePostRequest) {
    return apiClient.put<Post>(`/posts/${id}`, data);
  },

  // 删除交易信息
  async deletePost(id: number) {
    return apiClient.delete(`/posts/${id}`);
  },

  // 更新交易状态
  async updatePostStatus(id: number, status: 'ACTIVE' | 'DISABLED') {
    return apiClient.patch(`/posts/${id}/status`, { status });
  },

  // 查看联系方式
  async viewContact(id: number) {
    return apiClient.post<{ wechatId: string; viewed: boolean }>(`/posts/${id}/view-contact`);
  },

  // 标记成交
  async markDeal(id: number, isDealt: boolean) {
    return apiClient.patch(`/posts/${id}/deal`, { isDealt });
  },

  // 获取我的发布
  async getMyPosts(params?: PaginationParams) {
    return apiClient.get<PaginatedResponse<Post>>('/posts/my', params);
  },

  // 搜索交易信息
  async searchPosts(params: PostFilters & PaginationParams) {
    return apiClient.get<PaginatedResponse<Post>>('/posts/search', params);
  }
};