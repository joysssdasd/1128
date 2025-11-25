import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';

export const ModernAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      showToast({
        type: 'error',
        title: '信息不完整',
        message: '请输入用户名和密码',
      });
      return;
    }

    setIsLoading(true);
    try {
      // 开发环境模拟登录
      if (formData.username === 'admin' && formData.password === 'admin123') {
        showToast({
          type: 'success',
          title: '登录成功',
          message: '欢迎进入管理后台',
        });

        // 存储管理员token
        localStorage.setItem('admin_token', 'mock_admin_token');
        navigate('/admin');
      } else {
        showToast({
          type: 'error',
          title: '登录失败',
          message: '用户名或密码错误',
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      showToast({
        type: 'error',
        title: '登录失败',
        message: '请稍后重试',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">管理后台</h1>
          <p className="text-gray-400">TradeMatch 管理系统</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">管理员登录</h2>
            <p className="text-sm text-gray-400 mt-1">请输入管理员账号和密码</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                用户名
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 transition-colors duration-200"
                placeholder="请输入管理员用户名"
                required
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 transition-colors duration-200"
                placeholder="请输入密码"
                required
              />
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? '登录中...' : '立即登录'}
            </button>
          </form>

          {/* 返回前台 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              ← 返回前台
            </button>
          </div>

          {/* 开发环境提示 */}
          <div className="mt-6 p-4 bg-gray-700 rounded-xl border border-gray-600">
            <div className="flex items-center mb-2">
              <span className="text-sm font-semibold text-gray-300">💻 开发环境</span>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• 用户名: admin</p>
              <p>• 密码: admin123</p>
              <p>• 测试环境，请勿使用真实密码</p>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; 2024 TradeMatch Admin. 保留所有权利.</p>
        </div>
      </div>
    </div>
  );
};