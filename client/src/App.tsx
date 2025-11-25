import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { ModernHomePage } from './pages/ModernHomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ModernPublishPage } from './pages/ModernPublishPage';
import { ModernProfilePage } from './pages/ModernProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { ModernAdminLogin } from './pages/admin/ModernAdminLogin';
import { ModernAdminDashboard } from './pages/admin/ModernAdminDashboard';

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="App">
          <Routes>
            {/* 主页 - 默认路由 */}
            <Route path="/" element={<ModernHomePage />} />

            {/* 登录注册页面 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 核心功能页面 */}
            <Route path="/publish" element={<ModernPublishPage />} />
            <Route path="/profile" element={<ModernProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />

            {/* 详情页面 */}
            <Route path="/post/:id" element={<PostDetailPage />} />

            {/* 其他页面 */}
            <Route path="/my-posts" element={<MyPostsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/recharge" element={<RechargePage />} />

            {/* 管理后台 */}
            <Route path="/admin/login" element={<ModernAdminLogin />} />
            <Route path="/admin" element={<ModernAdminDashboard />} />

            {/* 404页面 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </ToastProvider>
    </Router>
  );
}


const MyPostsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">我的发布</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-500">我的发布页面开发中...</p>
      </div>
    </div>
  </div>
);

const SearchPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">搜索结果</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-500">搜索页面开发中...</p>
      </div>
    </div>
  </div>
);

const SettingsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">设置</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-500">设置页面开发中...</p>
      </div>
    </div>
  </div>
);

const RechargePage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">积分充值</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-gray-500">充值页面开发中...</p>
      </div>
    </div>
  </div>
);


const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="text-6xl mb-4">😵</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-4">页面不存在</p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        返回上一页
      </button>
    </div>
  </div>
);

export default App;