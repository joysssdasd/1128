import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/Toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore(); // 注册成功后直接登录
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    phone: '',
    smsCode: '',
    wechatId: '',
    inviteCode: '',
  });
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendSms = async () => {
    if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) {
      showToast({
        type: 'error',
        title: '手机号错误',
        message: '请输入有效的11位手机号',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:29999/api/auth/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          type: 'register'
        })
      });

      const data = await response.json();

      if (data.success) {
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        showToast({
          type: 'success',
          title: '验证码发送成功',
          message: `验证码：${data.data.code}`,
        });
      } else {
        showToast({
          type: 'error',
          title: '发送失败',
          message: data.message || '验证码发送失败',
        });
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      showToast({
        type: 'error',
        title: '网络错误',
        message: '发送验证码失败，请重试',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 开发环境直接成功
    if (formData.smsCode === '123456' || formData.smsCode.length === 6) {
      // 模拟注册成功并自动登录
      const _newUser = {
        id: Date.now().toString(),
        phone: formData.phone,
        wechatId: formData.wechatId,
        points: 100, // 注册送100积分
        dealRate: 100,
        totalPosts: 0,
        totalDeals: 0,
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
      };

      await login(formData.phone, formData.smsCode);

      showToast({
        type: 'success',
        title: '注册成功',
        message: '欢迎加入TradeMatch！已获得100积分奖励',
      });

      navigate('/');
      return;
    }

    if (!formData.phone || !formData.smsCode || !formData.wechatId) {
      showToast({
        type: 'error',
        title: '信息不完整',
        message: '请填写手机号、验证码和微信号',
      });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      showToast({
        type: 'error',
        title: '手机号错误',
        message: '请输入有效的11位手机号',
      });
      return;
    }

    if (!/^[a-zA-Z0-9_-]{6,20}$/.test(formData.wechatId)) {
      showToast({
        type: 'error',
        title: '微信号格式错误',
        message: '微信号格式：6-20位字母、数字、下划线或横线',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:29999/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // 注册成功后自动登录
        await login(formData.phone, formData.smsCode);

        showToast({
          type: 'success',
          title: '注册成功',
          message: '欢迎加入TradeMatch！已获得100积分奖励',
        });

        navigate('/');
      } else {
        showToast({
          type: 'error',
          title: '注册失败',
          message: data.message || '注册失败，请重试',
        });
      }
    } catch (error) {
      console.error('注册失败:', error);
      showToast({
        type: 'error',
        title: '网络错误',
        message: '注册失败，请重试',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">TM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">加入TradeMatch</h1>
          <p className="text-gray-600">开启您的交易之旅</p>
        </div>

        {/* 注册表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">创建账户</h2>
            <p className="text-sm text-gray-600 mt-1">填写信息完成注册</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 手机号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                placeholder="请输入11位手机号"
                maxLength={11}
                required
              />
            </div>

            {/* 验证码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                短信验证码
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  name="smsCode"
                  value={formData.smsCode}
                  onChange={handleInputChange}
                  className="block w-full flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  placeholder="请输入验证码"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendSms}
                  disabled={countdown > 0 || isLoading}
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            {/* 微信号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                微信号
              </label>
              <input
                type="text"
                name="wechatId"
                value={formData.wechatId}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                placeholder="请输入微信号"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                6-20位字母、数字、下划线或横线
              </p>
            </div>

            {/* 邀请码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邀请码（可选）
              </label>
              <input
                type="text"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                placeholder="请输入邀请码"
              />
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? '注册中...' : '立即注册'}
            </button>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              已有账户？
              <button
                onClick={() => navigate('/login')}
                className="text-green-600 hover:text-green-800 font-medium ml-1"
              >
                立即登录
              </button>
            </span>
          </div>

          {/* 注册福利说明 */}
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center mb-2">
              <span className="text-sm font-semibold text-green-800">🎁 新用户福利</span>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <p>• 注册即送100积分</p>
              <p>• 发布信息消耗10积分</p>
              <p>• 查看联系方式消耗1积分</p>
              <p>• 邀请好友获得额外积分奖励</p>
            </div>
          </div>

          {/* 开发环境提示 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center mb-2">
              <span className="text-sm font-semibold text-blue-800">💡 开发环境说明</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• 验证码可输入：123456</p>
              <p>• 测试环境，无需真实手机号</p>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; 2024 TradeMatch. 保留所有权利.</p>
        </div>
      </div>
    </div>
  );
};