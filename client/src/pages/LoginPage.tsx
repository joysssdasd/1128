import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

type TabType = 'login' | 'register';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [formData, setFormData] = useState({
    phone: '',
    smsCode: '',
    wechatId: '',
    inviteCode: ''
  });
  const [countdown, setCountdown] = useState(0);

  const {
    login,
    register,
    sendSms,
    isLoading,
    error,
    clearError
  } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSendSms = async () => {
    if (!formData.phone) {
      alert('请输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      alert('请输入有效的手机号');
      return;
    }

    try {
      await sendSms(formData.phone, activeTab);
      alert('验证码已发送');

      // 开始倒计时
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
    } catch (error: any) {
      alert(error.message || '发送验证码失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (activeTab === 'login') {
        await login(formData.phone, formData.smsCode);
        alert('登录成功！');
      } else {
        if (!formData.wechatId) {
          alert('请输入微信号');
          return;
        }
        if (!/^[a-zA-Z0-9_-]{6,20}$/.test(formData.wechatId)) {
          alert('微信号格式不正确（6-20位字母、数字、下划线或横线）');
          return;
        }
        await register(formData.phone, formData.smsCode, formData.wechatId, formData.inviteCode);
        alert('注册成功！已获得100积分奖励');
      }
    } catch (error: any) {
      // 错误已在store中处理
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          交易信息撮合平台
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          安全、快捷的交易信息发布与查看平台
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8">
          {/* 选项卡 */}
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-l-lg ${
                activeTab === 'login'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-r-lg ${
                activeTab === 'register'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              注册
            </button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 手机号 */}
            <div>
              <label className="form-label">手机号</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="请输入手机号"
                className="form-input"
                required
              />
            </div>

            {/* 短信验证码 */}
            <div>
              <label className="form-label">短信验证码</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="smsCode"
                  value={formData.smsCode}
                  onChange={handleInputChange}
                  placeholder="请输入验证码"
                  className="form-input flex-1"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendSms}
                  disabled={countdown > 0 || isLoading}
                  className="btn btn-secondary whitespace-nowrap disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                </button>
              </div>
            </div>

            {/* 微信号（注册时显示） */}
            {activeTab === 'register' && (
              <div>
                <label className="form-label">微信号</label>
                <input
                  type="text"
                  name="wechatId"
                  value={formData.wechatId}
                  onChange={handleInputChange}
                  placeholder="请输入微信号"
                  className="form-input"
                  required
                />
              </div>
            )}

            {/* 邀请码（注册时可选） */}
            {activeTab === 'register' && (
              <div>
                <label className="form-label">邀请码（可选）</label>
                <input
                  type="text"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleInputChange}
                  placeholder="请输入邀请码"
                  className="form-input"
                />
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {isLoading ? '处理中...' : activeTab === 'login' ? '登录' : '注册'}
              </button>
            </div>

            {/* 注册说明 */}
            {activeTab === 'register' && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p>• 注册即送100积分</p>
                <p>• 发布信息消耗10积分</p>
                <p>• 查看联系方式消耗1积分</p>
              </div>
            )}

            {/* 开发环境提示 */}
            {import.meta.env.DEV && (
              <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                开发环境：验证码可输入 123456
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};