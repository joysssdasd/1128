import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
// 移除不需要的导入
import { useToast } from '../components/ui/Toast';
import { BottomNav } from '../components/mobile/BottomNav';
import { SearchBar } from '../components/mobile/SearchBar';
import { TradeTypeTabs, DEFAULT_TRADE_TYPES } from '../components/mobile/TradeTypeTabs';
import { ModernPostCard } from '../components/mobile/ModernPostCard';
import type { Post } from '../types/api';

// 暂时使用空数组，等待API对接
const mockPosts: Post[] = [];

export const ModernHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  const [activeTradeType, setActiveTradeType] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(mockPosts);
  const [isLoading, setIsLoading] = useState(false);

  // 底部导航配置
  const bottomNavItems = [
    {
      id: 'home',
      label: '首页',
      icon: '🏠',
      path: '/',
    },
    {
      id: 'publish',
      label: '发布',
      icon: '➕',
      path: '/publish',
    },
    {
      id: 'messages',
      label: '消息',
      icon: '💬',
      path: '/messages',
      badge: 3, // 模拟未读消息数量
    },
    {
      id: 'profile',
      label: '我的',
      icon: '👤',
      path: '/profile',
    },
  ];

  // 筛选帖子
  useEffect(() => {
    let filtered = posts;

    // 按交易类型筛选
    if (activeTradeType !== 'ALL') {
      filtered = filtered.filter(post => post.tradeType === activeTradeType);
    }

    // 按关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        post.keywords.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [activeTradeType, searchKeyword, posts]);

  // 处理搜索
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    showToast({
      type: 'info',
      title: '搜索提示',
      message: `正在搜索 "${keyword}"`,
    });
  };

  // 处理交易类型切换
  const handleTradeTypeChange = (typeId: string) => {
    setActiveTradeType(typeId);
  };

  // 查看联系方式
  const handleViewContact = (postId: number) => {
    if (!isAuthenticated) {
      showToast({
        type: 'warning',
        title: '请先登录',
        message: '登录后才能查看联系方式',
      });
      navigate('/login');
      return;
    }

    // 模拟扣除积分
    const post = posts.find(p => p.id === postId);
    if (post && user && user.points < 1) {
      showToast({
        type: 'error',
        title: '积分不足',
        message: '查看联系方式需要1个积分',
      });
      return;
    }

    showToast({
      type: 'success',
      title: '查看成功',
      message: '联系方式：微信: trader123 (已扣除1积分)',
    });
  };

  // 查看详情
  const handleViewDetail = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  // 下拉刷新
  const _handleRefresh = async () => {
    setIsLoading(true);

    // 模拟API调用
    setTimeout(() => {
      showToast({
        type: 'success',
        title: '刷新成功',
        message: '已获取最新数据',
      });
      setIsLoading(false);
    }, 1000);
  };

  // 加载更多
  const handleLoadMore = () => {
    setIsLoading(true);

    // 模拟加载更多数据
    setTimeout(() => {
      const newPosts: Post[] = [
        {
          id: posts.length + 1,
          title: '新加载的交易信息',
          price: Math.random() * 10000,
          tradeType: 'BUY',
          userId: 999,
          keywords: '新,交易',
          viewLimit: 20,
          viewCount: 0,
          dealCount: 0,
          status: 'ACTIVE',
          expireAt: '2024-12-31T23:59:59Z',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            id: 999,
            wechatId: '新用户',
            dealRate: 100,
            totalPosts: 1,
          },
        },
      ];

      setPosts([...posts, ...newPosts]);
      setIsLoading(false);

      showToast({
        type: 'success',
        title: '加载成功',
        message: '已加载更多内容',
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部搜索区域 */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="p-4">
          {/* Logo和用户信息 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TM</span>
              </div>
              <span className="font-bold text-gray-900">TradeMatch</span>
            </div>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium">{user.points}积分</span>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                >
                  <span>👤</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                登录
              </button>
            )}
          </div>

          {/* 搜索栏 */}
          <SearchBar
            onSearch={handleSearch}
            suggestions={['USDT', '比特币', '以太坊', '期权交易']}
          />
        </div>

        {/* 交易类型标签 */}
        <div className="px-4 pb-3">
          <TradeTypeTabs
            types={DEFAULT_TRADE_TYPES}
            activeType={activeTradeType}
            onTypeChange={handleTradeTypeChange}
          />
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {filteredPosts.length}
            </div>
            <div className="text-xs text-gray-500">交易信息</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">2.8K</div>
            <div className="text-xs text-gray-500">活跃用户</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">96%</div>
            <div className="text-xs text-gray-500">成交率</div>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="p-4 space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <ModernPostCard
              key={post.id}
              post={post}
              onViewContact={handleViewContact}
              onViewDetail={handleViewDetail}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-gray-500">暂无相关交易信息</div>
            <div className="text-sm text-gray-400 mt-2">
              尝试调整搜索条件或交易类型
            </div>
          </div>
        )}

        {/* 加载更多按钮 */}
        {filteredPosts.length > 0 && filteredPosts.length < 20 && (
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full py-3 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? '加载中...' : '加载更多'}
          </button>
        )}
      </div>

      {/* 底部导航 */}
      <BottomNav items={bottomNavItems} />
    </div>
  );
};