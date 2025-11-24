import React, { useEffect, useState } from 'react';
import { Post, PostFilters, PaginationParams } from '../types/api';
import { usePostStore } from '../stores/postStore';
import { PostCard } from './PostCard';

interface PostListProps {
  filters?: PostFilters;
  pagination?: PaginationParams;
  onPageChange?: (page: number) => void;
}

export const PostList: React.FC<PostListProps> = ({
  filters = {},
  pagination: initialPagination = { page: 1, limit: 20 },
  onPageChange
}) => {
  const { posts, isLoading, error, pagination, fetchPosts } = usePostStore();
  const [currentPage, setCurrentPage] = useState(initialPagination.page || 1);

  useEffect(() => {
    const params = {
      ...filters,
      page: currentPage,
      limit: initialPagination.limit || 20,
    };
    fetchPosts(params);
  }, [filters, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-error-500 mb-4">{error}</div>
        <button
          onClick={() => fetchPosts({ ...filters, page: currentPage })}
          className="btn btn-primary"
        >
          重试
        </button>
      </div>
    );
  }

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">暂无交易信息</div>
        <div className="text-gray-400 text-sm">
          当前筛选条件下没有找到相关信息
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-gray-600">
        共找到 {pagination.total} 条交易信息
      </div>

      {/* 帖子列表 */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id.toString()}
            post={post}
          />
        ))}
      </div>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          {/* 上一页 */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev || isLoading}
            className="btn btn-secondary disabled:opacity-50"
          >
            上一页
          </button>

          {/* 页码 */}
          <div className="flex space-x-1">
            {Array.from(
              { length: Math.min(pagination.totalPages, 5) },
              (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded ${
                      pageNum === currentPage
                        ? 'bg-primary-500 text-white'
                        : 'btn btn-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}
          </div>

          {/* 下一页 */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext || isLoading}
            className="btn btn-secondary disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}

      {/* 加载更多指示器 */}
      {isLoading && posts.length > 0 && (
        <div className="mt-4 text-center text-gray-500">
          加载中...
        </div>
      )}
    </div>
  );
};