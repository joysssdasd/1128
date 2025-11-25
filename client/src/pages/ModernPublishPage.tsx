import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/Toast';
import { BottomNav } from '../components/mobile/BottomNav';
import type { TradeType } from '../types/api';

interface TradeTypeInfo {
  id: TradeType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

const tradeTypes: TradeTypeInfo[] = [
  {
    id: 'BUY',
    label: '求购',
    icon: '🟢',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: '我想买入数字货币'
  },
  {
    id: 'SELL',
    label: '出售',
    icon: '🔴',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: '我想出售数字货币'
  },
  {
    id: 'LONG',
    label: '做多',
    icon: '📈',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: '我看涨，未来买入'
  },
  {
    id: 'SHORT',
    label: '做空',
    icon: '📉',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: '我看跌，未来卖出'
  },
];

export const ModernPublishPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  const [selectedTradeType, setSelectedTradeType] = useState<TradeType | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    keywords: '',
    price: '',
    deliveryDate: '',
    extraInfo: '',
    viewLimit: '20'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      showToast({
        type: 'warning',
        title: '请先登录',
        message: '登录后才能发布交易信息',
      });
      navigate('/login');
    }
  }, [isAuthenticated]);

  const handleTradeTypeSelect = (type: TradeType) => {
    setSelectedTradeType(type);
    setErrors(prev => ({ ...prev, tradeType: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedTradeType) {
      newErrors.tradeType = '请选择交易类型';
    }

    if (!formData.title.trim()) {
      newErrors.title = '请输入交易标题';
    } else if (formData.title.length < 5 || formData.title.length > 100) {
      newErrors.title = '标题长度应在5-100字符之间';
    }

    if (!formData.keywords.trim()) {
      newErrors.keywords = '请输入关键词';
    } else if (formData.keywords.split(/[,，\s]+/).length < 1 || formData.keywords.split(/[,，\s]+/).length > 10) {
      newErrors.keywords = '关键词数量应在1-10个之间';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = '请输入有效的价格';
    } else if (parseFloat(formData.price) > 1000000) {
      newErrors.price = '价格不能超过100万元';
    }

    // 做多/做空必须填写交割时间
    if ((selectedTradeType === 'LONG' || selectedTradeType === 'SHORT') && !formData.deliveryDate) {
      newErrors.deliveryDate = '做多/做空交易必须填写交割时间';
    }

    if (formData.deliveryDate && new Date(formData.deliveryDate) <= new Date()) {
      newErrors.deliveryDate = '交割时间必须是未来时间';
    }

    const viewLimitNum = parseInt(formData.viewLimit);
    if (!viewLimitNum || viewLimitNum < 5 || viewLimitNum > 100) {
      newErrors.viewLimit = '查看次数限制应在5-100次之间';
    }

    if (formData.extraInfo && formData.extraInfo.length > 500) {
      newErrors.extraInfo = '备注信息不能超过500字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      showToast({
        type: 'error',
        title: '请先登录',
        message: '登录后才能发布交易信息',
      });
      return;
    }

    if (user.points < 10) {
      showToast({
        type: 'error',
        title: '积分不足',
        message: '发布信息需要10积分，请充值后再试',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 模拟API调用
      setTimeout(() => {
        // 更新用户积分
        const updatedUser = { ...user, points: user.points - 10 };
        // 这里应该调用store的login方法更新用户信息

        showToast({
          type: 'success',
          title: '发布成功',
          message: '信息已发布，将在72小时内有效，已扣除10积分',
        });

        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('发布失败:', error);
      showToast({
        type: 'error',
        title: '发布失败',
        message: '请稍后重试',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDeliveryDate = () => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return oneYearLater.toISOString().split('T')[0];
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

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">请先登录</h2>
          <p className="text-gray-600 mb-6">登录后才能发布交易信息</p>
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
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← 取消
          </button>
          <h1 className="text-lg font-semibold text-gray-900">发布交易信息</h1>
          <div className="text-sm font-medium text-blue-600">
            {user.points}积分
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* 积分余额卡片 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">当前积分余额</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">发布扣10积分</span>
          </div>
          <div className="text-2xl font-bold mb-1">{user.points}</div>
          <div className="text-sm opacity-90">
            {user.points >= 10 ? '积分充足，可以发布' : '积分不足，请充值'}
          </div>
        </div>

        {/* 选择交易类型 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">选择交易类型</h2>
          <div className="grid grid-cols-2 gap-3">
            {tradeTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTradeTypeSelect(type.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedTradeType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-medium text-gray-900 mb-1">{type.label}</div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </button>
            ))}
          </div>
          {errors.tradeType && (
            <p className="text-red-500 text-sm mt-2">{errors.tradeType}</p>
          )}
        </div>

        {/* 基本信息 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>

          {/* 交易标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              交易标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="请输入交易标题（5-100字符）"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={100}
              required
            />
            <div className="flex justify-between mt-1">
              {errors.title ? (
                <p className="text-red-500 text-sm">{errors.title}</p>
              ) : (
                <p className="text-gray-500 text-sm">5-100字符</p>
              )}
              <p className="text-gray-500 text-sm">{formData.title.length}/100</p>
            </div>
          </div>

          {/* 关键词 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关键词 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              placeholder="请输入关键词，如：BTC USDT 现货"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.keywords ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.keywords ? (
              <p className="text-red-500 text-sm mt-1">{errors.keywords}</p>
            ) : (
              <p className="text-gray-500 text-sm mt-1">
                用空格分隔，1-10个关键词，便于搜索
              </p>
            )}
          </div>

          {/* 价格 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              价格 (元) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="请输入价格"
              step="0.01"
              min="0.01"
              max="1000000"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>
        </div>

        {/* 高级设置 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">高级设置</h2>

          {/* 交割时间（做多/做空必填） */}
          {(selectedTradeType === 'LONG' || selectedTradeType === 'SHORT') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                交割时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                min={getMinDeliveryDate()}
                max={getMaxDeliveryDate()}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.deliveryDate && (
                <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>
              )}
            </div>
          )}

          {/* 查看次数限制 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              查看次数限制
            </label>
            <select
              name="viewLimit"
              value={formData.viewLimit}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="10">10次 (免费)</option>
              <option value="20">20次 (推荐)</option>
              <option value="30">30次</option>
              <option value="50">50次</option>
              <option value="100">100次</option>
            </select>
            <p className="text-gray-500 text-sm mt-1">
              设置其他用户可以查看您联系方式的次数
            </p>
          </div>

          {/* 备注信息 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注信息 (可选)
            </label>
            <textarea
              name="extraInfo"
              value={formData.extraInfo}
              onChange={handleInputChange}
              placeholder="请输入补充说明信息（如交易方式、时间要求等）"
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.extraInfo ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              <p className="text-gray-500 text-sm">交易方式、时间要求等</p>
              <p className="text-gray-500 text-sm">{formData.extraInfo.length}/500</p>
            </div>
          </div>
        </div>

        {/* 发布说明 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-3 flex items-center">
            <span className="text-lg mr-2">📋</span>
            发布说明
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>发布交易信息需要消耗10积分</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>信息有效期为72小时，过期后自动下架</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>您可以在个人中心管理已发布的信息</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>请确保信息真实合法，平台有权删除违规内容</span>
            </li>
          </ul>
        </div>

        {/* 提交按钮 */}
        <div className="space-y-3">
          {user.points < 10 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center text-red-800">
                <span className="text-lg mr-2">⚠️</span>
                <div>
                  <p className="font-medium">积分不足</p>
                  <p className="text-sm">您当前有{user.points}积分，发布信息需要10积分</p>
                  <button
                    type="button"
                    onClick={() => navigate('/recharge')}
                    className="text-red-600 underline text-sm mt-1"
                  >
                    立即充值
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || user.points < 10}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <span>⏳</span>
                <span>发布中...</span>
              </>
            ) : (
              <>
                <span>✅</span>
                <span>确认发布 (扣除10积分)</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 底部导航 */}
      <BottomNav items={bottomNavItems} />
    </div>
  );
};