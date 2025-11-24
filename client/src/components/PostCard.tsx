import React, { useState } from 'react';
import { Post } from '../types/api';
import { usePostStore } from '../stores/postStore';
import { useAuthStore } from '../stores/authStore';

interface PostCardProps {
  post: Post;
  onViewContact?: (post: Post) => void;
  onMarkDeal?: (postId: number, isDealt: boolean) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onViewContact,
  onMarkDeal
}) => {
  const [showContact, setShowContact] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ wechatId: string; viewed: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const { viewContact, markDeal } = usePostStore();
  const { isAuthenticated } = useAuthStore();

  const getTradeTypeText = (type: string) => {
    const map = {
      'BUY': '买入',
      'SELL': '卖出',
      'LONG': '做多',
      'SHORT': '做空'
    };
    return map[type as keyof typeof map] || type;
  };

  const getTradeTypeColor = (type: string) => {
    const map = {
      'BUY': 'badge-success',
      'SELL': 'badge-error',
      'LONG': 'badge-primary',
      'SHORT': 'badge-warning'
    };
    return map[type as keyof typeof map] || 'badge-primary';
  };

  const handleViewContact = async () => {
    if (!isAuthenticated) {
      alert('请先登录后查看联系方式');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const result = await viewContact(post.id);
      setContactInfo(result);
      setShowContact(true);
      onViewContact?.(post);
    } catch (error: any) {
      alert(error.message || '查看联系方式失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDeal = async (isDealt: boolean) => {
    if (!isAuthenticated) {
      alert('请先登录后标记成交');
      return;
    }

    try {
      await markDeal(post.id, isDealt);
      onMarkDeal?.(post.id, isDealt);
      alert(isDealt ? '已标记为成交' : '已取消成交标记');
    } catch (error: any) {
      alert(error.message || '标记成交失败');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="card p-6 mb-4 hover:shadow-md transition-shadow">
      {/* 标题和类型 */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {post.title}
        </h3>
        <span className={`badge ${getTradeTypeColor(post.tradeType)} ml-2`}>
          {getTradeTypeText(post.tradeType)}
        </span>
      </div>

      {/* 关键词 */}
      <div className="flex flex-wrap gap-1 mb-3">
        {post.keywords.split(' ').map((keyword, index) => (
          <span
            key={index}
            className="badge bg-gray-100 text-gray-600 text-xs"
          >
            {keyword}
          </span>
        ))}
      </div>

      {/* 价格和其他信息 */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-xl font-bold text-primary-600">
          ¥{post.price.toLocaleString()}
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>成交率: {post.user.dealRate}%</span>
          <span>发布: {post.user.totalPosts}条</span>
        </div>
      </div>

      {/* 交割时间（做多/做空显示） */}
      {post.deliveryDate && (
        <div className="text-sm text-gray-600 mb-3">
          <strong>交割时间:</strong> {formatDate(post.deliveryDate)}
        </div>
      )}

      {/* 额外信息 */}
      {post.extraInfo && (
        <div className="text-sm text-gray-600 mb-3">
          <strong>备注:</strong> {post.extraInfo}
        </div>
      )}

      {/* 查看次数和剩余次数 */}
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>已查看 {post.viewCount}/{post.viewLimit} 次</span>
        <span>成交 {post.dealCount} 笔</span>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={handleViewContact}
          disabled={loading}
          className="btn btn-primary flex-1 disabled:opacity-50"
        >
          {loading ? '处理中...' : showContact ? '再次查看' : '查看联系方式 (1积分)'}
        </button>

        {showContact && contactInfo && (
          <button
            onClick={() => handleMarkDeal(!contactInfo.viewed)}
            className="btn btn-success flex-1"
          >
            {contactInfo.viewed ? '已成交' : '标记成交'}
          </button>
        )}
      </div>

      {/* 联系方式弹窗 */}
      {showContact && contactInfo && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <strong>微信号:</strong>
              <span className="ml-2 text-primary-600 font-medium">
                {contactInfo.wechatId}
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(contactInfo.wechatId);
                alert('微信号已复制到剪贴板');
              }}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              复制
            </button>
          </div>
        </div>
      )}

      {/* 过期时间 */}
      <div className="mt-4 text-xs text-gray-400 text-right">
        过期时间: {formatDate(post.expireAt)}
      </div>
    </div>
  );
};