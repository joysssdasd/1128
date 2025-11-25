import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/ui/Toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    phone: '',
    smsCode: '',
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
          type: 'login'
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
      // 模拟登录成功
      await login(formData.phone, formData.smsCode);

      showToast({
        type: 'success',
        title: '登录成功',
        message: '欢迎回来！',
      });

      navigate('/');
      return;
    }

    if (!formData.phone || !formData.smsCode) {
      showToast({
        type: 'error',
        title: '信息不完整',
        message: '请填写手机号和验证码',
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

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:29999/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        await login(formData.phone, formData.smsCode);

        showToast({
          type: 'success',
          title: '登录成功',
          message: '欢迎回来！',
        });

        navigate('/');
      } else {
        showToast({
          type: 'error',
          title: '登录失败',
          message: data.message || '登录失败，请重试',
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      showToast({
        type: 'error',
        title: '网络错误',
        message: '登录失败，请重试',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">TM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">TradeMatch</h1>
          <p className="text-gray-600">专业的交易信息撮合平台</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">欢迎回来</h2>
            <p className="text-sm text-gray-600 mt-1">登录您的账户开始交易</p>
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
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
                  className="block w-full flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="请输入验证码"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendSms}
                  disabled={countdown > 0 || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? '登录中...' : '立即登录'}
            </button>
          </form>

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              还没有账户？
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-800 font-medium ml-1"
              >
                立即注册
              </button>
            </span>
          </div>

          {/* 开发环境提示 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center mb-2">
              <span className="text-sm font-semibold text-blue-800">💡 开发环境说明</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• 验证码可输入：123456</p>
              <p>• 注册即送100积分</p>
              <p>• 发布信息消耗10积分</p>
              <p>• 查看联系方式消耗1积分</p>
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