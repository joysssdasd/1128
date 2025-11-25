import React from 'react';
import type { Post } from '../../types/api';

interface ModernPostCardProps {
  post: Post;
  onViewContact: (postId: number) => void;
  onViewDetail: (postId: number) => void;
}

export const ModernPostCard: React.FC<ModernPostCardProps> = ({
  post,
  onViewContact,
  onViewDetail,
}) => {
  const getTradeTypeInfo = (type: string) => {
    switch (type) {
      case 'BUY':
        return {
          label: '求购',
          icon: '🟢',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
        };
      case 'SELL':
        return {
          label: '出售',
          icon: '🔴',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
        };
      case 'LONG':
        return {
          label: '做多',
          icon: '📈',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
        };
      case 'SHORT':
        return {
          label: '做空',
          icon: '📉',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-200',
        };
      default:
        return {
          label: '其他',
          icon: '📋',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
        };
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

  const renderStars = (rate: number) => {
    const fullStars = Math.floor(rate / 20); // 转换为5星制
    const hasHalfStar = (rate % 20) >= 10;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">⭐</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">✨</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">⭐</span>
        ))}
        <span className="text-xs text-gray-600 ml-1">{rate}%</span>
      </div>
    );
  };

  const tradeTypeInfo = getTradeTypeInfo(post.tradeType);
  const isExpired = new Date(post.expireAt) < new Date();
  const viewProgress = (post.viewCount / post.viewLimit) * 100;

  // 将keywords字符串转换为数组
  const keywordsArray = post.keywords ? post.keywords.split(',').map(k => k.trim()).filter(k => k) : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* 顶部信息 */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          {/* 交易类型标签 */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${tradeTypeInfo.bgColor} ${tradeTypeInfo.color}`}>
            <span className="text-sm">{tradeTypeInfo.icon}</span>
            <span className="text-xs font-medium">{tradeTypeInfo.label}</span>
          </div>

          {/* 价格 */}
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              ¥{post.price.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {keywordsArray[0] || '其他'}
            </div>
          </div>
        </div>

        {/* 标题 */}
        <h3
          onClick={() => onViewDetail(post.id)}
          className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
        >
          {post.title}
        </h3>

        {/* 关键词标签 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {keywordsArray.slice(0, 3).map((keyword, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              {keyword}
            </span>
          ))}
          {keywordsArray.length > 3 && (
            <span className="text-xs text-gray-500">
              +{keywordsArray.length - 3}
            </span>
          )}
        </div>

        {/* 用户信息和成交率 */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
            <span className="text-xs">{post.user.wechatId || '匿名用户'}</span>
          </div>

          <div className="flex items-center space-x-3">
            {renderStars(post.user.dealRate)}
            <span className="text-xs text-gray-500">
              {post.dealCount}成交
            </span>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>👁 {post.viewCount}/{post.viewLimit}</span>
            <span>🕐 {formatTimeAgo(post.createdAt)}</span>
          </div>

          {isExpired && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
              已过期
            </span>
          )}
        </div>

        {/* 查看次数进度条 */}
        {post.viewLimit > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
            <div
              className={`h-1.5 rounded-full transition-all ${
                viewProgress >= 100
                  ? 'bg-red-500'
                  : viewProgress >= 80
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(viewProgress, 100)}%` }}
            />
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetail(post.id)}
            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            查看详情
          </button>
          <button
            onClick={() => onViewContact(post.id)}
            disabled={isExpired || post.viewCount >= post.viewLimit}
            className={`flex-1 py-2 rounded-lg transition-colors text-sm font-medium ${
              isExpired || post.viewCount >= post.viewLimit
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {post.viewCount >= post.viewLimit ? '查看次数已用完' : '查看联系方式'}
          </button>
        </div>
      </div>
    </div>
  );
};