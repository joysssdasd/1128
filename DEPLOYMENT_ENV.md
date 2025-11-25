# 🚀 EdgeOne部署环境变量配置指南

## 📋 快速配置

**复制以下内容到EdgeOne的环境变量设置中：**

```bash
# 数据库配置（必填）
DATABASE_URL=postgresql://postgres:vw9v2kvc@dbconn.sealoshzh.site:44744/trading_platform?directConnection=true

# JWT安全配置（必填）
JWT_SECRET=trading-platform-production-jwt-secret-key-2024-change-this-to-random-string
JWT_EXPIRES_IN=7d

# 服务器配置（必填）
PORT=3000
NODE_ENV=production

# 安全配置（必填）
BCRYPT_ROUNDS=14
SESSION_SECRET=production-session-secret-change-this-to-random-string-2024

# API限流配置（推荐）
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 文件上传配置（推荐）
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp

# 日志配置（推荐）
LOG_LEVEL=info
LOG_FILE=logs/app.log

# 应用信息（推荐）
APP_NAME=交易信息撮合平台
APP_VERSION=1.0.0
APP_DESCRIPTION=积分驱动的C2C交易信息撮合平台 - 支持演唱会门票、数码产品、潮玩、纪念币等

# 管理员配置（推荐）
ADMIN_DEFAULT_PASSWORD=admin123456
```

## 🔐 安全建议

### 1. **重要密钥必须修改**
复制以下命令生成安全的随机密钥：

```bash
# Linux/Mac生成JWT密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Windows生成JWT密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**需要修改的密钥：**
- `JWT_SECRET` - 至少32位随机字符
- `SESSION_SECRET` - 至少32位随机字符

### 2. **可选配置**
以下配置可以根据需要添加：

```bash
# Redis缓存（如果EdgeOne支持）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# 邮件服务（如果需要邮件通知）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 短信服务（如果需要短信验证）
SMS_URL=https://your-sms-service.com/api
SMS_USER_ID=your-user-id
SMS_APP_KEY=your-app-key

# 监控服务（推荐）
SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io
```

## 🎯 EdgeOne设置步骤

### 1. 登录EdgeOne控制台
访问：https://console.cloud.tencent.com/edgeone

### 2. 创建新站点
- **站点名称**: 您的域名
- **服务类型**: Web应用

### 3. 配置环境变量
在**函数配置** > **环境变量**中添加：

1. 点击**添加环境变量**
2. 将上面的配置逐行添加
3. 重要变量必须添加，可选变量根据需要添加

### 4. 构建和部署设置
**构建命令:**
```bash
npm install && npm run build
```

**启动命令:**
```bash
npm start
```

**端口:**
```
3000
```

## ⚠️ 重要提醒

### 🔒 安全注意事项
1. **永远不要**在代码中硬编码敏感信息
2. **定期更换**JWT_SECRET和SESSION_SECRET
3. **使用HTTPS** - EdgeOne会自动处理
4. **启用访问日志**监控异常访问

### 📊 性能优化
1. **数据库连接池** - 已配置在连接字符串中
2. **API限流** - 防止恶意请求
3. **文件上传限制** - 防止大文件攻击
4. **错误处理** - 完整的错误处理机制

### 🚨 部署前检查清单
- [ ] 所有必填环境变量已配置
- [ ] JWT_SECRET已修改为随机字符串
- [ ] SESSION_SECRET已修改为随机字符串
- [ ] 数据库连接测试通过
- [ ] 构建命令测试通过
- [ ] 启动命令测试通过

## 🧪 测试部署

### 1. 本地测试
```bash
# 设置生产环境变量
cp .env.production .env

# 测试构建
npm run build

# 测试启动
npm start
```

### 2. 数据库连接测试
```bash
npm run test-api
```

### 3. 功能测试
访问部署后的URL，测试：
- 用户注册/登录
- 信息发布
- 积分系统
- 管理后台

## 🎯 部署成功验证

部署完成后，您应该看到：
1. ✅ 后端API正常运行
2. ✅ 数据库连接成功
3. ✅ 前端页面正常加载
4. ✅ 所有功能测试通过

## 📞 技术支持

如果部署遇到问题：
1. 查看EdgeOne日志
2. 检查环境变量配置
3. 确认数据库连接
4. 随时问我！

---

**🎉 您的交易平台即将上线！祝您部署成功！** 🚀

**记住：部署前一定要修改JWT_SECRET和SESSION_SECRET为强密码！** 🔐

有任何问题随时告诉我！ 😊

## 📋 一键复制配置

**完整的环境变量配置（复制到EdgeOne）：**

```
DATABASE_URL=postgresql://postgres:vw9v2kvc@dbconn.sealoshzh.site:44744/trading_platform?directConnection=true
JWT_SECRET=YOUR_RANDOM_JWT_SECRET_HERE_MIN_32_CHARS
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
BCRYPT_ROUNDS=14
SESSION_SECRET=YOUR_RANDOM_SESSION_SECRET_HERE_MIN_32_CHARS
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp
LOG_LEVEL=info
LOG_FILE=logs/app.log
APP_NAME=交易信息撮合平台
APP_VERSION=1.0.0
APP_DESCRIPTION=积分驱动的C2C交易信息撮合平台 - 支持演唱会门票、数码产品、潮玩、纪念币等
ADMIN_DEFAULT_PASSWORD=admin123456
```

**不要忘记替换 `YOUR_RANDOM_JWT_SECRET_HERE` 和 `YOUR_RANDOM_SESSION_SECRET_HERE`！**