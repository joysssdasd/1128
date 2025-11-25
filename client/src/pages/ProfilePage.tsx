import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { usePostStore } from '../stores/postStore';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { myPosts, fetchMyPosts, pagination, isLoading, deletePost } = usePostStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'points' | 'stats'>('posts');
  const [pointsHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchMyPosts({ page: 1, limit: 10 });
      fetchPointsHistory();
    }
  }, [user]);

  const fetchPointsHistory = async () => {
    try {
      // 这里应该调用积分记录API
      // const { pointService } = await import('../services/pointService');
      // const history = await pointService.getPointHistory();
      // setPointsHistory(history.data || []);
    } catch (error) {
      console.error('获取积分记录失败:', error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('确定要删除这条交易信息吗？删除后将退还剩余积分。')) {
      return;
    }

    try {
      await deletePost(postId);
      alert('删除成功，积分已退还');
      fetchMyPosts({ page: 1, limit: 10 });
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  const handleTogglePostStatus = async (postId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const action = newStatus === 'DISABLED' ? '下架' : '上架';

    if (!confirm(`确定要${action}这条交易信息吗？`)) {
      return;
    }

    try {
      await updatePostStatus(postId, newStatus as any);
      alert(`${action}成功`);
      fetchMyPosts({ page: 1, limit: 10 });
    } catch (error: any) {
      alert(error.message || `${action}失败`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先登录</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="btn btn-primary"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => window.location.href = '/'}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 返回首页
            </button>
            <h1 className="text-xl font-bold text-gray-900">个人中心</h1>
            <button
              onClick={() => window.location.href = '/publish'}
              className="btn btn-primary"
            >
              发布信息
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 用户信息卡片 */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.wechatId}</h2>
              <p className="text-gray-600 mt-1">手机号: {user.phone}</p>
            </div>
            <div className="text-right">
              <div className="bg-primary-50 px-4 py-2 rounded-full">
                <span className="text-primary-700 font-semibold text-lg">
                  {user.points} 积分
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                成交率: {user.dealRate}%
              </p>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.totalPosts}</div>
              <div className="text-sm text-gray-600">发布总数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user.totalDeals}</div>
              <div className="text-sm text-gray-600">成交总数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{user.dealRate}%</div>
              <div className="text-sm text-gray-600">成交率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {user.status === 'ACTIVE' ? '正常' : user.status === 'DISABLED' ? '禁用' : '封禁'}
              </div>
              <div className="text-sm text-gray-600">账户状态</div>
            </div>
          </div>
        </div>

        {/* 选项卡 */}
        <div className="mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-t-lg font-medium ${
                activeTab === 'posts'
                  ? 'bg-white text-primary-600 border-t-2 border-x border-primary-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              我的发布
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`px-4 py-2 rounded-t-lg font-medium ${
                activeTab === 'points'
                  ? 'bg-white text-primary-600 border-t-2 border-x border-primary-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              积分记录
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-t-lg font-medium ${
                activeTab === 'stats'
                  ? 'bg-white text-primary-600 border-t-2 border-x border-primary-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              数据统计
            </button>
          </div>
        </div>

        {/* 选项卡内容 */}
        <div className="card">
          {/* 我的发布 */}
          {activeTab === 'posts' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  我的发布 ({pagination.total}条)
                </h3>
                <button
                  onClick={() => window.location.href = '/publish'}
                  className="btn btn-primary"
                >
                  发布新信息
                </button>
              </div>

              {isLoading && myPosts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">加载中...</div>
                </div>
              ) : myPosts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">还没有发布任何交易信息</div>
                  <button
                    onClick={() => window.location.href = '/publish'}
                    className="btn btn-primary"
                  >
                    立即发布
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPosts.map((post) => (
                    <div key={post.id.toString()} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{post.title}</h4>
                          <p className="text-gray-600 mt-1">¥{post.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`badge ${
                            post.status === 'ACTIVE' ? 'badge-success' :
                            post.status === 'DISABLED' ? 'badge-warning' :
                            'badge-error'
                          }`}>
                            {post.status === 'ACTIVE' ? '进行中' :
                             post.status === 'DISABLED' ? '已下架' : '已过期'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                        <span>查看: {post.viewCount}/{post.viewLimit}</span>
                        <span>成交: {post.dealCount}</span>
                        <span>过期: {new Date(post.expireAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex space-x-2">
                        {post.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleTogglePostStatus(post.id, post.status)}
                            className="btn btn-secondary"
                          >
                            下架
                          </button>
                        )}
                        {post.status === 'DISABLED' && (
                          <button
                            onClick={() => handleTogglePostStatus(post.id, post.status)}
                            className="btn btn-success"
                          >
                            上架
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="btn btn-danger"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 积分记录 */}
          {activeTab === 'points' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">积分记录</h3>
              {pointsHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无积分记录
                </div>
              ) : (
                <div className="space-y-2">
                  {pointsHistory.map((record, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <span className="font-medium">{record.description}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(record.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <span className={`font-medium ${
                        record.changeAmount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.changeAmount > 0 ? '+' : ''}{record.changeAmount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 数据统计 */}
          {activeTab === 'stats' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">数据统计</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">发布统计</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>总发布数:</span>
                      <span className="font-medium">{user.totalPosts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>总成交数:</span>
                      <span className="font-medium">{user.totalDeals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>成交率:</span>
                      <span className="font-medium">{user.dealRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">积分统计</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>当前积分:</span>
                      <span className="font-medium">{user.points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>注册奖励:</span>
                      <span className="font-medium">100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>发布消费:</span>
                      <span className="font-medium">{user.totalPosts * 10}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};