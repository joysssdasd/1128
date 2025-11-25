import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  activePosts: number;
  totalDeals: number;
  todayPosts: number;
  todayDeals: number;
  todayRevenue: number;
}

interface RecentUser {
  id: string;
  phone: string;
  wechatId: string;
  points: number;
  status: string;
  createdAt: string;
}

interface RecentPost {
  id: string;
  title: string;
  price: number;
  tradeType: string;
  userName: string;
  status: string;
  createdAt: string;
}

export const ModernAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 2845,
    activeUsers: 1234,
    totalPosts: 8234,
    activePosts: 456,
    totalDeals: 3456,
    todayPosts: 89,
    todayDeals: 34,
    todayRevenue: 2340,
  });

  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([
    {
      id: '1',
      phone: '138****5678',
      wechatId: 'trader001',
      points: 150,
      status: 'ACTIVE',
      createdAt: '2024-11-25T14:00:00Z',
    },
    {
      id: '2',
      phone: '139****1234',
      wechatId: 'crypto_pro',
      points: 89,
      status: 'ACTIVE',
      createdAt: '2024-11-25T13:30:00Z',
    },
    {
      id: '3',
      phone: '137****9876',
      wechatId: 'investor_wang',
      points: 234,
      status: 'ACTIVE',
      createdAt: '2024-11-25T12:45:00Z',
    },
  ]);

  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([
    {
      id: '1',
      title: '求购USDT，价格优惠，诚信交易',
      price: 7.2,
      tradeType: 'BUY',
      userName: 'trader001',
      status: 'ACTIVE',
      createdAt: '2024-11-25T14:30:00Z',
    },
    {
      id: '2',
      title: '出售比特币，支持多种支付方式',
      price: 95000,
      tradeType: 'SELL',
      userName: 'crypto_pro',
      status: 'ACTIVE',
      createdAt: '2024-11-25T14:15:00Z',
    },
    {
      id: '3',
      title: '做多以太坊，专业分析师带单',
      price: 3500,
      tradeType: 'LONG',
      userName: 'investor_wang',
      status: 'ACTIVE',
      createdAt: '2024-11-25T14:00:00Z',
    },
  ]);

  useEffect(() => {
    // 检查管理员登录状态
    const token = localStorage.getItem('admin_token');
    if (!token) {
      showToast({
        type: 'warning',
        title: '请先登录',
        message: '需要管理员权限才能访问',
      });
      navigate('/admin/login');
      return;
    }

    // 加载数据
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 模拟API调用
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载数据失败:', error);
      setIsLoading(false);
      showToast({
        type: 'error',
        title: '加载失败',
        message: '请稍后重试',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    showToast({
      type: 'success',
      title: '退出成功',
      message: '已安全退出管理后台',
    });
    navigate('/admin/login');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  const getTradeTypeIcon = (type: string) => {
    switch (type) {
      case 'BUY': return '🟢';
      case 'SELL': return '🔴';
      case 'LONG': return '📈';
      case 'SHORT': return '📉';
      default: return '📋';
    }
  };

  const getTradeTypeLabel = (type: string) => {
    switch (type) {
      case 'BUY': return '求购';
      case 'SELL': return '出售';
      case 'LONG': return '做多';
      case 'SHORT': return '做空';
      default: return '其他';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              🏠 返回前台
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-lg font-semibold text-gray-900">管理后台</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {/* 欢迎信息 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-6 text-white">
          <h2 className="text-xl font-bold mb-2">欢迎回来，管理员</h2>
          <p className="text-white/80">
            系统运行正常，以下是今日数据概览
          </p>
        </div>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👥</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                +12.5%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-500">总用户数</div>
            <div className="text-xs text-green-600 mt-1">
              活跃: {stats.activeUsers}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📝</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                +8.3%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalPosts.toLocaleString()}</div>
            <div className="text-sm text-gray-500">总发布数</div>
            <div className="text-xs text-blue-600 mt-1">
              进行中: {stats.activePosts}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🤝</span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                +15.7%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalDeals.toLocaleString()}</div>
            <div className="text-sm text-gray-500">总成交数</div>
            <div className="text-xs text-purple-600 mt-1">
              今日: {stats.todayDeals}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💰</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                +23.4%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">¥{stats.todayRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">今日收入</div>
            <div className="text-xs text-yellow-600 mt-1">
              +{stats.todayPosts} 发布
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <span className="text-xl mb-1 block">👥</span>
              <span className="text-sm">用户管理</span>
            </button>
            <button className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-xl mb-1 block">📝</span>
              <span className="text-sm">内容审核</span>
            </button>
            <button className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              <span className="text-xl mb-1 block">💰</span>
              <span className="text-sm">财务管理</span>
            </button>
            <button className="p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
              <span className="text-xl mb-1 block">⚙️</span>
              <span className="text-sm">系统设置</span>
            </button>
          </div>
        </div>

        {/* 最近动态 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 最新用户 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">最新用户</h3>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{user.wechatId}</div>
                    <div className="text-sm text-gray-500">
                      {user.phone} · {formatTimeAgo(user.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user.points}积分</div>
                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      正常
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最新发布 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">最新发布</h3>
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 line-clamp-1">
                        {post.title}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{getTradeTypeIcon(post.tradeType)} {getTradeTypeLabel(post.tradeType)}</span>
                        <span>¥{post.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      进行中
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {post.userName} · {formatTimeAgo(post.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 系统信息 */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">系统信息</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">系统版本:</span>
              <span className="ml-2 font-medium">v2.1.0</span>
            </div>
            <div>
              <span className="text-gray-500">服务器状态:</span>
              <span className="ml-2 font-medium text-green-600">正常</span>
            </div>
            <div>
              <span className="text-gray-500">数据库:</span>
              <span className="ml-2 font-medium text-green-600">连接正常</span>
            </div>
            <div>
              <span className="text-gray-500">上次更新:</span>
              <span className="ml-2 font-medium">2分钟前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};