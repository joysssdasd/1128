import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { usePostStore } from '../stores/postStore';
import { PostFilters } from '../types/api';
import { PostFilter } from '../components/PostFilter';
import { PostList } from '../components/PostList';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { posts, pagination } = usePostStore();

  const [filters, setFilters] = useState<PostFilters>({});
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    // 初始化时获取最新数据
    const { fetchPosts } = usePostStore.getState();
    fetchPosts({ page: 1, limit: 20 });
  }, []);

  const handleFiltersChange = (newFilters: PostFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    const { fetchPosts } = usePostStore.getState();
    fetchPosts({
      ...filters,
      keyword,
      page: 1,
      limit: 20
    });
  };

  const handlePageChange = (page: number) => {
    const { fetchPosts } = usePostStore.getState();
    fetchPosts({
      ...filters,
      keyword: searchKeyword,
      page,
      limit: 20
    });
  };

  const handlePublishPost = () => {
    if (!isAuthenticated) {
      alert('请先登录后再发布信息');
      return;
    }

    // 跳转到发布页面
    window.location.href = '/publish';
  };

  const handleMyProfile = () => {
    if (!isAuthenticated) {
      alert('请先登录');
      return;
    }

    // 跳转到个人中心
    window.location.href = '/profile';
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      const { logout } = useAuthStore.getState();
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                交易信息撮合平台
              </h1>
            </div>

            {/* 用户信息和操作 */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  {/* 积分显示 */}
                  <div className="bg-primary-50 px-3 py-1 rounded-full">
                    <span className="text-primary-700 font-medium">
                      积分: {user.points}
                    </span>
                  </div>

                  {/* 成交率 */}
                  <div className="text-sm text-gray-600">
                    成交率: {user.dealRate}%
                  </div>

                  {/* 发布按钮 */}
                  <button
                    onClick={handlePublishPost}
                    className="btn btn-primary"
                  >
                    发布信息
                  </button>

                  {/* 用户菜单 */}
                  <div className="relative group">
                    <button className="btn btn-secondary">
                      {user.wechatId}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <button
                        onClick={handleMyProfile}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        个人中心
                      </button>
                      <button
                        onClick={() => window.location.href = '/my-posts'}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        我的发布
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="btn btn-primary"
                >
                  登录/注册
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和统计信息 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            交易信息大厅
          </h2>
          <p className="text-gray-600">
            发现最新的交易机会，安全快捷地联系交易方
          </p>

          {pagination && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <span>总信息数: {pagination.total}</span>
              <span>当前页: {pagination.page}/{pagination.totalPages}</span>
            </div>
          )}
        </div>

        {/* 筛选器 */}
        <PostFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
        />

        {/* 帖子列表 */}
        <PostList
          filters={{ ...filters, keyword: searchKeyword }}
          onPageChange={handlePageChange}
        />

        {/* 底部提示 */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>• 请谨慎核实交易信息，防范诈骗风险</p>
          <p>• 平台仅提供信息撮合服务，不承担交易责任</p>
          <p>• 如有疑问，请联系客服</p>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 交易信息撮合平台. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};