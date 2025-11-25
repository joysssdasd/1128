import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/Toast';
import { BottomNav } from '../components/mobile/BottomNav';

interface PointTransaction {
  id: string;
  changeType: string;
  changeAmount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  price: number;
  tradeType: 'BUY' | 'SELL' | 'LONG' | 'SHORT';
  viewCount: number;
  viewLimit: number;
  dealCount: number;
  status: 'ACTIVE' | 'DISABLED' | 'EXPIRED';
  expireAt: string;
  createdAt: string;
}

export const ModernProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'posts' | 'history' | 'points'>('posts');
  const [pointsHistory, setPointsHistory] = useState<PointTransaction[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 模拟数据
  const mockPointsHistory: PointTransaction[] = [
    {
      id: '1',
      changeType: 'RECHARGE',
      changeAmount: 100,
      balanceAfter: 100,
      description: '注册奖励',
      createdAt: '2024-11-25T10:00:00Z',
    },
    {
      id: '2',
      changeType: 'PUBLISH',
      changeAmount: -10,
      balanceAfter: 90,
      description: '发布交易信息',
      createdAt: '2024-11-25T11:00:00Z',
    },
    {
      id: '3',
      changeType: 'VIEW',
      changeAmount: -1,
      balanceAfter: 89,
      description: '查看联系方式',
      createdAt: '2024-11-25T12:00:00Z',
    },
    {
      id: '4',
      changeType: 'INVITE_BONUS',
      changeAmount: 20,
      balanceAfter: 109,
      description: '邀请好友奖励',
      createdAt: '2024-11-25T13:00:00Z',
    },
  ];

  const mockMyPosts: Post[] = [
    {
      id: '1',
      title: '求购USDT，价格优惠，诚信交易',
      price: 7.2,
      tradeType: 'BUY',
      viewCount: 8,
      viewLimit: 20,
      dealCount: 3,
      status: 'ACTIVE',
      expireAt: '2024-12-31T23:59:59Z',
      createdAt: '2024-11-25T10:30:00Z',
    },
    {
      id: '2',
      title: '出售比特币，支持多种支付方式',
      price: 95000,
      tradeType: 'SELL',
      viewCount: 12,
      viewLimit: 15,
      dealCount: 5,
      status: 'ACTIVE',
      expireAt: '2024-12-25T23:59:59Z',
      createdAt: '2024-11-24T09:15:00Z',
    },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      showToast({
        type: 'warning',
        title: '请先登录',
        message: '登录后才能查看个人中心',
      });
      navigate('/login');
      return;
    }

    // 加载数据
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 模拟API调用
      setTimeout(() => {
        setPointsHistory(mockPointsHistory);
        setMyPosts(mockMyPosts);
        setIsLoading(false);
      }, 500);
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

  const getTradeTypeInfo = (type: string) => {
    switch (type) {
      case 'BUY':
        return { label: '求购', icon: '🟢', bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'SELL':
        return { label: '出售', icon: '🔴', bgColor: 'bg-red-100', textColor: 'text-red-700' };
      case 'LONG':
        return { label: '做多', icon: '📈', bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'SHORT':
        return { label: '做空', icon: '📉', bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      default:
        return { label: '其他', icon: '📋', bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    }
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

  const getPointTypeColor = (type: string) => {
    switch (type) {
      case 'RECHARGE':
      case 'INVITE_BONUS':
      case 'INVITED_BONUS':
        return 'text-green-600';
      case 'PUBLISH':
      case 'VIEW':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPointTypeLabel = (type: string) => {
    switch (type) {
      case 'RECHARGE':
        return '充值';
      case 'PUBLISH':
        return '发布';
      case 'VIEW':
        return '查看';
      case 'INVITE_BONUS':
        return '邀请奖励';
      case 'INVITED_BONUS':
        return '被邀请奖励';
      case 'REFUND':
        return '退款';
      case 'ADMIN_ADJUST':
        return '管理员调整';
      default:
        return '其他';
    }
  };

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
    },
    {
      id: 'profile',
      label: '我的',
      icon: '👤',
      path: '/profile',
    },
  ];

  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">请先登录</h2>
          <p className="text-gray-600 mb-6">登录后才能查看个人中心</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            立即登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部背景 */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 pt-12 pb-24 px-4">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white transition-colors"
          >
            ← 返回
          </button>
          <h1 className="text-white text-lg font-semibold">个人中心</h1>
          <button
            onClick={() => navigate('/settings')}
            className="text-white/80 hover:text-white transition-colors"
          >
            ⚙️
          </button>
        </div>

        {/* 用户信息卡片 */}
        <div className="text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{user.wechatId}</h2>
          <p className="text-white/80 text-sm mb-4">手机号: {user.phone}</p>

          {/* 积分显示 */}
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 inline-block">
            <div className="text-3xl font-bold mb-1">{user.points}</div>
            <div className="text-sm text-white/80">我的积分</div>
          </div>
        </div>
      </div>

      {/* 统计数据卡片 */}
      <div className="px-4 -mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{user.totalPosts}</div>
              <div className="text-xs text-gray-500">发布数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{user.totalDeals}</div>
              <div className="text-xs text-gray-500">成交数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{user.dealRate}%</div>
              <div className="text-xs text-gray-500">成交率</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {user.status === 'ACTIVE' ? '正常' : '受限'}
              </div>
              <div className="text-xs text-gray-500">状态</div>
            </div>
          </div>
        </div>

        {/* 快捷操作按钮 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/publish')}
            className="bg-blue-600 text-white rounded-xl p-4 flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <span className="text-xl">➕</span>
            <span className="font-medium">发布信息</span>
          </button>
          <button
            onClick={() => navigate('/recharge')}
            className="bg-green-600 text-white rounded-xl p-4 flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <span className="text-xl">💰</span>
            <span className="font-medium">积分充值</span>
          </button>
        </div>

        {/* 选项卡 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              我的发布
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              浏览足迹
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'points'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              积分明细
            </button>
          </div>

          {/* 选项卡内容 */}
          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="text-2xl mb-2">⏳</div>
                  <div className="text-gray-500">加载中...</div>
                </div>
              </div>
            ) : (
              <>
                {/* 我的发布 */}
                {activeTab === 'posts' && (
                  <div className="p-4">
                    {myPosts.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="text-4xl mb-4">📝</div>
                        <div className="text-gray-500 mb-4">还没有发布任何交易信息</div>
                        <button
                          onClick={() => navigate('/publish')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          立即发布
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myPosts.map((post) => {
                          const tradeTypeInfo = getTradeTypeInfo(post.tradeType);
                          return (
                            <div key={post.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">
                                    {post.title}
                                  </h3>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full ${tradeTypeInfo.bgColor} ${tradeTypeInfo.textColor}`}>
                                      {tradeTypeInfo.icon} {tradeTypeInfo.label}
                                    </span>
                                    <span className="text-gray-900 font-semibold">
                                      ¥{post.price.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  post.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                  post.status === 'DISABLED' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {post.status === 'ACTIVE' ? '上架中' :
                                   post.status === 'DISABLED' ? '已下架' : '已过期'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>👁 {post.viewCount}/{post.viewLimit}</span>
                                <span>🤝 {post.dealCount}成交</span>
                                <span>🕐 {formatTimeAgo(post.createdAt)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 浏览足迹 */}
                {activeTab === 'history' && (
                  <div className="p-4">
                    <div className="text-center py-20">
                      <div className="text-4xl mb-4">👣</div>
                      <div className="text-gray-500">暂无浏览记录</div>
                    </div>
                  </div>
                )}

                {/* 积分明细 */}
                {activeTab === 'points' && (
                  <div className="p-4">
                    {pointsHistory.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="text-4xl mb-4">💰</div>
                        <div className="text-gray-500">暂无积分记录</div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pointsHistory.map((record) => (
                          <div key={record.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {getPointTypeLabel(record.changeType)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.description} · {formatTimeAgo(record.createdAt)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${getPointTypeColor(record.changeType)}`}>
                                {record.changeAmount > 0 ? '+' : ''}{record.changeAmount}
                              </div>
                              <div className="text-xs text-gray-500">
                                余额: {record.balanceAfter}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 底部导航 */}
      <BottomNav items={bottomNavItems} />
    </div>
  );
};