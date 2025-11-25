// EdgeOne Pages 适配入口文件
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务 - 前端构建文件
app.use(express.static(path.join(__dirname, 'client/dist')));

// API 路由 - 使用编译后的路由
app.use('/api/auth', require('./dist/routes/auth'));
app.use('/api/users', require('./dist/routes/users'));
app.use('/api/posts', require('./dist/routes/posts'));
app.use('/api/recharge', require('./dist/routes/recharge'));

// 管理后台路由
app.use('/api/admin/auth', require('./dist/routes/admin/auth'));
app.use('/api/admin/users', require('./dist/routes/admin/users'));
app.use('/api/admin/posts', require('./dist/routes/admin/posts'));
app.use('/api/admin/recharge', require('./dist/routes/admin/recharge'));
app.use('/api/admin/system', require('./dist/routes/admin/system'));

// 根路由 - 返回前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// SPA 回退路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// 启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;