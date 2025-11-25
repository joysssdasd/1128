// EdgeOne Pages 适配入口文件
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务 - 前端构建文件
app.use(express.static(path.join(__dirname, 'client/dist')));

// 简单的根路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// SPA 回退路由 - 所有其他路径都返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// 启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 EdgeOne Pages Server running on port ${PORT}`);
  });
}

module.exports = app;