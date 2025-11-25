// EdgeOne Pages Serverless Function 入口
const path = require('path');
const express = require('express');

// 创建 Express 应用
const app = express();

// 静态文件服务
app.use(express.static(path.join(__dirname, '../client/dist')));

// API 路由
app.use('/api/auth', require('../dist/routes/auth'));
app.use('/api/users', require('../dist/routes/users'));
app.use('/api/posts', require('../dist/routes/posts'));
app.use('/api/recharge', require('../dist/routes/recharge'));

// 管理后台路由
app.use('/api/admin/auth', require('../dist/routes/admin/auth'));
app.use('/api/admin/users', require('../dist/routes/admin/users'));
app.use('/api/admin/posts', require('../dist/routes/admin/posts'));
app.use('/api/admin/recharge', require('../dist/routes/admin/recharge'));
app.use('/api/admin/system', require('../dist/routes/admin/system'));

// SPA 回退
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Vercel/EdgeOne Serverless Function 适配
module.exports = app;