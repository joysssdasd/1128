// 用户相关类型
export interface User {
  id: number;
  phone: string;
  wechatId: string;
  inviteCode?: string;
  points: number;
  dealRate: number;
  totalPosts: number;
  totalDeals: number;
  status: 'ACTIVE' | 'DISABLED' | 'BANNED';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  phone: string;
  smsCode: string;
}

export interface RegisterRequest {
  phone: string;
  smsCode: string;
  wechatId: string;
  inviteCode?: string;
}

export interface SendSmsRequest {
  phone: string;
  type: 'register' | 'login' | 'reset_password';
}

export interface AuthResponse {
  user: User;
  token: string;
}

// 交易信息类型
export type TradeType = 'BUY' | 'SELL' | 'LONG' | 'SHORT';
export type PostStatus = 'ACTIVE' | 'EXPIRED' | 'DISABLED';

export interface Post {
  id: number;
  userId: number;
  title: string;
  keywords: string;
  price: number;
  tradeType: TradeType;
  deliveryDate?: string;
  extraInfo?: string;
  viewLimit: number;
  viewCount: number;
  dealCount: number;
  status: PostStatus;
  expireAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    wechatId: string;
    dealRate: number;
    totalPosts: number;
  };
}

export interface CreatePostRequest {
  title: string;
  keywords: string;
  price: number;
  tradeType: TradeType;
  deliveryDate?: string;
  extraInfo?: string;
}

export interface UpdatePostRequest {
  title?: string;
  keywords?: string;
  price?: number;
  tradeType?: TradeType;
  deliveryDate?: string;
  extraInfo?: string;
}

export interface PostView {
  id: number;
  postId: number;
  userId: number;
  wechatId: string;
  viewed: boolean;
  isDealt: boolean;
  dealtAt?: string;
  createdAt: string;
}

// 积分相关类型
export type PointChangeType = 'RECHARGE' | 'PUBLISH' | 'VIEW' | 'INVITE_BONUS' | 'INVITED_BONUS' | 'REFUND' | 'ADMIN_ADJUST';

export interface PointTransaction {
  id: number;
  userId: number;
  changeType: PointChangeType;
  changeAmount: number;
  balanceAfter: number;
  relatedId?: number;
  description: string;
  createdAt: string;
}

export interface RechargeOrder {
  id: number;
  orderNumber: string;
  userId: number;
  amount: number;
  points: number;
  paymentMethod?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  tradeNumber?: string;
  confirmedAt?: string;
  confirmedBy?: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRechargeRequest {
  amount: number;
  paymentMethod?: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 搜索和筛选参数
export interface PostFilters {
  keyword?: string;
  tradeType?: TradeType;
  priceRange?: {
    min?: number;
    max?: number;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}