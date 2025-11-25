import { Response } from 'express';

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

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ApiResponseUtil {
  // 序列化BigInt为字符串
  private static serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'bigint') {
      return obj.toString();
    }

    if (obj instanceof Date) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.serializeBigInt(item));
    }

    if (typeof obj === 'object') {
      const serialized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          serialized[key] = this.serializeBigInt(obj[key]);
        }
      }
      return serialized;
    }

    return obj;
  }

  private static createResponse<T>(
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data?: T,
    meta?: PaginationMeta
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success,
      code: statusCode,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== undefined) {
      response.data = this.serializeBigInt(data);
    }

    if (meta) {
      response.meta = {
        total: meta.total,
        page: meta.page,
        limit: meta.limit,
        hasNext: meta.hasNext,
        hasPrev: meta.hasPrev,
      };
    }

    return res.status(statusCode).json(response);
  }

  // 成功响应
  public static success<T>(
    res: Response,
    message: string = '操作成功',
    data?: T,
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    return this.createResponse(res, statusCode, true, message, data);
  }

  // 创建成功响应
  public static created<T>(
    res: Response,
    message: string = '创建成功',
    data?: T
  ): Response<ApiResponse<T>> {
    return this.createResponse(res, 201, true, message, data);
  }

  // 分页响应
  public static paginated<T>(
    res: Response,
    message: string = '获取数据成功',
    data: T[],
    meta: PaginationMeta,
    statusCode: number = 200
  ): Response<ApiResponse<T[]>> {
    return this.createResponse(res, statusCode, true, message, data, meta);
  }

  // 无内容响应
  public static noContent(
    res: Response,
    message: string = '操作成功'
  ): Response<ApiResponse> {
    return this.createResponse(res, 204, true, message);
  }

  // 坏请求响应
  public static badRequest(
    res: Response,
    message: string = '请求参数错误',
    errors?: any
  ): Response<ApiResponse> {
    const response = this.createResponse(res, 400, false, message);
    if (errors) {
      (response as any).errors = errors;
    }
    return response;
  }

  // 未授权响应
  public static unauthorized(
    res: Response,
    message: string = '未授权访问'
  ): Response<ApiResponse> {
    return this.createResponse(res, 401, false, message);
  }

  // 禁止访问响应
  public static forbidden(
    res: Response,
    message: string = '权限不足'
  ): Response<ApiResponse> {
    return this.createResponse(res, 403, false, message);
  }

  // 资源未找到响应
  public static notFound(
    res: Response,
    message: string = '资源未找到'
  ): Response<ApiResponse> {
    return this.createResponse(res, 404, false, message);
  }

  // 方法不允许响应
  public static methodNotAllowed(
    res: Response,
    message: string = '请求方法不允许'
  ): Response<ApiResponse> {
    return this.createResponse(res, 405, false, message);
  }

  // 冲突响应
  public static conflict(
    res: Response,
    message: string = '资源冲突'
  ): Response<ApiResponse> {
    return this.createResponse(res, 409, false, message);
  }

  // 验证失败响应
  public static validationError(
    res: Response,
    message: string = '数据验证失败',
    errors?: any
  ): Response<ApiResponse> {
    const response = this.createResponse(res, 422, false, message);
    if (errors) {
      (response as any).errors = errors;
    }
    return response;
  }

  // 服务器错误响应
  public static internalError(
    res: Response,
    message: string = '服务器内部错误'
  ): Response<ApiResponse> {
    return this.createResponse(res, 500, false, message);
  }

  // 服务不可用响应
  public static serviceUnavailable(
    res: Response,
    message: string = '服务不可用'
  ): Response<ApiResponse> {
    return this.createResponse(res, 503, false, message);
  }
}

// 计算分页元数据
export const createPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

// 格式化分页查询参数
export const formatPaginationParams = (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

// 格式化排序参数
export const formatSortParams = (
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  allowedFields: string[] = []
) => {
  if (!allowedFields.includes(sortBy)) {
    return { orderBy: { createdAt: 'desc' as const } };
  }

  return {
    orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
  };
};

// 构建搜索条件
export const buildSearchCondition = (keyword?: string, searchFields: string[] = []) => {
  if (!keyword || searchFields.length === 0) {
    return {};
  }

  const searchConditions = searchFields.map(field => ({
    [field]: {
      contains: keyword,
      mode: 'insensitive' as const,
    },
  }));

  return searchConditions.length > 1 ? { OR: searchConditions } : searchConditions[0];
};