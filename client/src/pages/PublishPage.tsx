import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { usePostStore } from '../stores/postStore';
import type { TradeType } from '../types/api';

export const PublishPage: React.FC = () => {
  const { user } = useAuthStore();
  const { createPost, isLoading } = usePostStore();

  const [formData, setFormData] = useState({
    title: '',
    keywords: '',
    price: '',
    tradeType: '' as TradeType,
    deliveryDate: '',
    extraInfo: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 重置表单
    setFormData({
      title: '',
      keywords: '',
      price: '',
      tradeType: '' as TradeType,
      deliveryDate: '',
      extraInfo: ''
    });
    setErrors({});
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入交易标题';
    } else if (formData.title.length < 5 || formData.title.length > 100) {
      newErrors.title = '标题长度应在5-100字符之间';
    }

    if (!formData.keywords.trim()) {
      newErrors.keywords = '请输入关键词';
    } else if (formData.keywords.split(' ').length < 1 || formData.keywords.split(' ').length > 10) {
      newErrors.keywords = '关键词数量应在1-10个之间';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = '请输入有效的价格';
    } else if (parseFloat(formData.price) > 1000000) {
      newErrors.price = '价格不能超过100万元';
    }

    if (!formData.tradeType) {
      newErrors.tradeType = '请选择交易类型';
    }

    // 做多/做空必须填写交割时间
    if ((formData.tradeType === 'LONG' || formData.tradeType === 'SHORT') && !formData.deliveryDate) {
      newErrors.deliveryDate = '做多/做空交易必须填写交割时间';
    }

    if (formData.deliveryDate && new Date(formData.deliveryDate) <= new Date()) {
      newErrors.deliveryDate = '交割时间必须是未来时间';
    }

    if (formData.extraInfo && formData.extraInfo.length > 500) {
      newErrors.extraInfo = '备注信息不能超过500字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      alert('请先登录');
      return;
    }

    if (user.points < 10) {
      alert('积分不足，发布信息需要10积分。请充值。');
      return;
    }

    try {
      const postData = {
        title: formData.title.trim(),
        keywords: formData.keywords.trim(),
        price: parseFloat(formData.price),
        tradeType: formData.tradeType,
        deliveryDate: formData.deliveryDate || undefined,
        extraInfo: formData.extraInfo.trim() || undefined
      };

      await createPost(postData);
      alert('发布成功！信息将在72小时内有效');
      window.location.href = '/';
    } catch (error: any) {
      alert(error.message || '发布失败');
    }
  };

  const getTradeTypeText = (type: TradeType) => {
    const map = {
      'BUY': '买入',
      'SELL': '卖出',
      'LONG': '做多',
      'SHORT': '做空'
    };
    return map[type];
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
            <h1 className="text-xl font-bold text-gray-900">发布交易信息</h1>
            <div className="text-sm text-gray-600">
              积分: <span className="font-semibold text-primary-600">{user.points}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 交易类型 */}
            <div>
              <label className="form-label">交易类型 *</label>
              <select
                name="tradeType"
                value={formData.tradeType}
                onChange={handleInputChange}
                className={`form-input ${errors.tradeType ? 'border-error-500' : ''}`}
                required
              >
                <option value="">请选择交易类型</option>
                <option value="BUY">买入</option>
                <option value="SELL">卖出</option>
                <option value="LONG">做多</option>
                <option value="SHORT">做空</option>
              </select>
              {errors.tradeType && (
                <p className="text-error-500 text-sm mt-1">{errors.tradeType}</p>
              )}
            </div>

            {/* 交易标题 */}
            <div>
              <label className="form-label">交易标题 *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="请输入交易标题（5-100字符）"
                className={`form-input ${errors.title ? 'border-error-500' : ''}`}
                maxLength={100}
                required
              />
              {errors.title && (
                <p className="text-error-500 text-sm mt-1">{errors.title}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.title.length}/100 字符
              </p>
            </div>

            {/* 关键词 */}
            <div>
              <label className="form-label">关键词 *</label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="请输入关键词，用空格分隔（如：BTC USDT 现货）"
                className={`form-input ${errors.keywords ? 'border-error-500' : ''}`}
                required
              />
              {errors.keywords && (
                <p className="text-error-500 text-sm mt-1">{errors.keywords}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                建议包含交易品种、类型等关键词，便于搜索
              </p>
            </div>

            {/* 价格 */}
            <div>
              <label className="form-label">价格 (元) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="请输入价格"
                step="0.01"
                min="0.01"
                max="1000000"
                className={`form-input ${errors.price ? 'border-error-500' : ''}`}
                required
              />
              {errors.price && (
                <p className="text-error-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* 交割时间（做多/做空必填） */}
            {(formData.tradeType === 'LONG' || formData.tradeType === 'SHORT') && (
              <div>
                <label className="form-label">交割时间 *</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  min={getMinDeliveryDate()}
                  max={getMaxDeliveryDate()}
                  className={`form-input ${errors.deliveryDate ? 'border-error-500' : ''}`}
                  required
                />
                {errors.deliveryDate && (
                  <p className="text-error-500 text-sm mt-1">{errors.deliveryDate}</p>
                )}
              </div>
            )}

            {/* 备注信息 */}
            <div>
              <label className="form-label">备注信息（可选）</label>
              <textarea
                name="extraInfo"
                value={formData.extraInfo}
                onChange={handleInputChange}
                placeholder="请输入补充说明信息（如交易方式、时间要求等）"
                rows={4}
                className={`form-input ${errors.extraInfo ? 'border-error-500' : ''}`}
                maxLength={500}
              />
              {errors.extraInfo && (
                <p className="text-error-500 text-sm mt-1">{errors.extraInfo}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.extraInfo.length}/500 字符
              </p>
            </div>

            {/* 发布说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">发布说明</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 发布交易信息需要消耗10积分</li>
                <li>• 信息有效期为72小时</li>
                <li>• 每条信息最多可被查看10次</li>
                <li>• 您可以随时下架或删除已发布的信息</li>
                <li>• 请确保信息真实合法，平台有权删除违规内容</li>
              </ul>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="btn btn-secondary flex-1"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading || user.points < 10}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                {isLoading ? '发布中...' : '确认发布 (10积分)'}
              </button>
            </div>

            {/* 积分不足提示 */}
            {user.points < 10 && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
                积分不足！您当前有{user.points}积分，发布信息需要10积分。请充值后再试。
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};