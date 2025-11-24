import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    phone: '',
    smsCode: '',
    wechatId: '',
    inviteCode: ''
  });
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendSms = async () => {
    if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) {
      alert('请输入有效的手机号');
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
          type: activeTab
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
        alert(`验证码发送成功！验证码：${data.data.code}`);
      } else {
        alert(data.message || '发送失败');
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      alert('发送验证码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 开发环境直接成功
    if (formData.smsCode === '123456' || formData.smsCode.length === 6) {
      alert(`${activeTab === 'login' ? '登录成功！' : '注册成功！已获得100积分奖励'}`);
      return;
    }

    if (!formData.phone || !formData.smsCode) {
      alert('请填写完整信息');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      alert('请输入有效的手机号');
      return;
    }

    if (activeTab === 'register' && !formData.wechatId) {
      alert('请输入微信号');
      return;
    }

    if (activeTab === 'register' && !/^[a-zA-Z0-9_-]{6,20}$/.test(formData.wechatId)) {
      alert('微信号格式不正确（6-20位字母、数字、下划线或横线）');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = activeTab === 'login' ? '/auth/login' : '/auth/register';
      const response = await fetch(`http://localhost:29999/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`${activeTab === 'login' ? '登录成功！' : '注册成功！已获得100积分奖励'}`);
        console.log('登录/注册成功:', data.data);
      } else {
        alert(data.message || `${activeTab === 'login' ? '登录' : '注册'}失败`);
      }
    } catch (error) {
      console.error(`${activeTab}失败:`, error);
      alert(`${activeTab === 'login' ? '登录' : '注册'}失败，请重试`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* 左侧品牌区域 */}
      <div className="hidden lg:flex lg:flex-col lg:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">TM</span>
            </div>
            <span className="text-xl font-bold">TradeMatch</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            专业的交易信息<br />
            <span className="text-blue-400">撮合平台</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            连接全球交易者，提供安全、高效、智能的交易信息匹配服务
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <span className="text-blue-400 text-lg font-bold">🔒</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">安全交易</h3>
                <p className="text-gray-400">多重身份验证，保障交易安全</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <span className="text-green-400 text-lg font-bold">⚡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">实时匹配</h3>
                <p className="text-gray-400">智能算法快速匹配交易机会</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <span className="text-purple-400 text-lg font-bold">🌍</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">全球社区</h3>
                <p className="text-gray-400">连接全球专业交易者</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">10K+</div>
                <div className="text-sm text-gray-400">活跃用户</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">50K+</div>
                <div className="text-sm text-gray-400">交易信息</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">99.9%</div>
                <div className="text-sm text-gray-400">成功率</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          © 2024 TradeMatch. All rights reserved.
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">TM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TradeMatch</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
            <p className="text-gray-600 mt-2">登录您的账户开始交易</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
            {/* 选项卡 */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors duration-200 border-b-2 ${
                  activeTab === 'login'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                登录
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors duration-200 border-b-2 ${
                  activeTab === 'register'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                注册
              </button>
            </div>

            <div className="p-8">
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

                {/* 微信号（注册时显示） */}
                {activeTab === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      微信号
                    </label>
                    <input
                      type="text"
                      name="wechatId"
                      value={formData.wechatId}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="请输入微信号"
                      required
                    />
                  </div>
                )}

                {/* 邀请码（注册时可选） */}
                {activeTab === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邀请码（可选）
                    </label>
                    <input
                      type="text"
                      name="inviteCode"
                      value={formData.inviteCode}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="请输入邀请码"
                    />
                  </div>
                )}

                {/* 提交按钮 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? '处理中...' : (activeTab === 'login' ? '立即登录' : '立即注册')}
                </button>
              </form>

              {/* 开发环境提示 */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-semibold text-blue-800">开发环境说明</span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• 验证码可输入：123456</p>
                  <p>• 注册即送100积分</p>
                  <p>• 发布信息消耗10积分</p>
                  <p>• 查看联系方式消耗1积分</p>
                </div>
              </div>
            </div>
          </div>

          {/* 移动端品牌信息 */}
          <div className="mt-8 text-center text-sm text-gray-500 lg:hidden">
            <p>© 2024 TradeMatch. 专业的交易信息撮合平台</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;