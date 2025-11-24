# 交易信息撮合平台 - 快速部署指南

## 📋 项目简介

这是一个积分驱动的C2C交易信息撮合平台,主要针对:
- 🎫 演唱会门票
- 📱 数码产品
- 🎨 潮玩
- 🪙 纪念币等收藏品

**技术栈**: Node.js + Express + React + PostgreSQL + Prisma

---

## 🎯 快速开始(3步完成)

### 第1步: 配置数据库(2个选择)

#### 选择A: 使用Supabase(推荐生产环境)

**如果您还没有配置Supabase网络访问,请按以下步骤操作:**

1. 登录 [Supabase](https://supabase.com)
2. 进入项目: `mayczgkdsbjcddbxzkms`
3. 点击左侧菜单 **Project Settings** → **Database**
4. 滚动到 **Network Settings** 部分
5. 确保 **"Allow direct database connections"** 已启用
6. 检查 **"Connection pooling"** 是否已启用
   - 如果启用,使用地址: `aws-0-ap-southeast-1.pooler.supabase.com:6543`
   - 用户名: `postgres.mayczgkdsbjcddbxzkms`
7. 检查 **IP白名单**: 如果有设置,请确保您的IP地址已添加到白名单

**测试连接命令**:
```bash
# 测试5432端口(直接连接)
telnet db.mayczgkdsbjcddbxzkms.supabase.co 5432

# 或测试6543端口(连接池)
telnet aws-0-ap-southeast-1.pooler.supabase.com 6543
```

**配置.env文件**:
```env
# 方案1: 直接连接
DATABASE_URL="postgresql://postgres.mayczgkdsbjcddbxzkms:YMOMiYsHiux4pfAu@db.mayczgkdsbjcddbxzkms.supabase.co:5432/postgres?sslmode=require"

# 方案2: 连接池(推荐,更稳定)
DATABASE_URL="postgresql://postgres.mayczgkdsbjcddbxzkms:YMOMiYsHiux4pfAu@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require"

SUPABASE_URL="https://mayczgkdsbjcddbxzkms.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_jQyVil5OgbMRC6Uft_h9ZA_jguo5P-s"
SUPABASE_SERVICE_ROLE_KEY="G4_lpRhW9a2PLrPxQ_mbBptkIw"
```

#### 选择B: 本地Docker PostgreSQL(快速测试)

**如果您想快速在本地测试,使用Docker:**

1. 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. 在项目根目录运行:
```bash
docker run -d \
  --name trading-platform-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres2024 \
  -e POSTGRES_DB=trading_platform \
  -p 5432:5432 \
  -v trading-platform-data:/var/lib/postgresql/data \
  postgres:15-alpine
```

3. 配置 `.env` 文件:
```env
DATABASE_URL="postgresql://postgres:postgres2024@localhost:5432/trading_platform"
```

### 第2步: 安装依赖和初始化数据库

```bash
# 进入项目目录
cd "C:\Users\big\Desktop\claude本地\trading-match-platform"

# 安装后端依赖
npm install

# 生成Prisma Client
npx prisma generate

# 初始化数据库(创建所有表)
npx prisma db push

# 创建测试数据(演唱会门票、iPhone、潮玩等)
npm run db:seed
```

### 第3步: 启动服务

```bash
# 同时启动后端和前端
npm run dev

# 服务会在以下地址运行:
# - 后端API: http://localhost:3001
# - 前端页面: http://localhost:5173
# - API文档: http://localhost:3001/api
# - 健康检查: http://localhost:3001/health
```

---

## 📝 测试账号和数据

### 管理员账号
- **用户名**: `admin`
- **密码**: `admin123456`
- **登录地址**: `http://localhost:3001/api/admin/auth/login`

### 测试用户账号(已预置)
- **用户1**: 手机号 `13800138001`, 密码 `123456`
- **用户2**: 手机号 `13800138002`, 密码 `123456`
- **用户3**: 手机号 `13800138003`, 密码 `123456`

### 测试交易信息(已预置)
- 🎤 周杰伦演唱会门票 - 求购
- 📱 iPhone 15 Pro - 出售
- 🎮 PS5游戏机 - 出售
- 🎨 Bearbrick熊 - 求购
- 💻 MacBook Pro M3 - 出售
- 🎫 五月天演唱会门票 - 出售
- 📸 佳能相机 - 求购

---

## 🚀 部署到线上(使用EdgeOne)

### 使用Supabase数据库部署:

1. **配置好Supabase连接**(参考第1步选择A)
2. **初始化数据库**:
```bash
npx prisma db push
npm run db:seed
```

3. **推送代码到GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

4. **在EdgeOne部署**:
   - 登录EdgeOne控制台
   - 创建新站点
   - 选择GitHub仓库
   - 构建设置:
     ```
     构建命令: npm install && npm run build
     输出目录: client/dist
     启动命令: npm start
     ```
   - 添加环境变量:
     ```
     DATABASE_URL = "postgresql://..."
     JWT_SECRET = "your-secret-key"
     NODE_ENV = "production"
     ```

---

## 🛠️ 可用脚本

```bash
npm run dev              # 启动开发环境(前后端)
npm run server:dev       # 只启动后端
npm run client:dev       # 只启动前端
npm run build            # 构建生产版本
npm start                # 启动生产服务器

# 数据库相关
npx prisma generate      # 生成Prisma Client
npx prisma db push       # 推送schema到数据库
npx prisma studio        # 打开数据库管理界面
npm run db:seed          # 创建测试数据

# 代码质量
npm run lint             # 检查代码规范
npm run lint:fix         # 自动修复代码规范
npm run format           # 格式化代码
```

---

## 📊 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接字符串 | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT密钥 | 随机字符串(至少32位) |
| `PORT` | 服务器端口 | `3001` |
| `NODE_ENV` | 运行环境 | `development` / `production` |
| `SUPABASE_URL` | Supabase项目URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Anon Key | Supabase提供 |

---

## 🔧 常见问题

### Q: 数据库连接失败?
**A**: 检查:
1. 数据库服务是否运行
2. 连接字符串是否正确
3. IP地址是否在白名单内(Supabase)
4. 防火墙是否放行端口5432

### Q: Prisma migration错误?
**A**: 运行:
```bash
npx prisma generate
npx prisma db push --accept-data-loss  # 开发环境使用
```

### Q: 前端无法连接后端?
**A**: 检查:
1. 后端是否启动 `npm run server:dev`
2. 检查控制台网络请求
3. 确认CORS配置是否正确

### Q: 如何重置数据库?
**A**:
```bash
# 删除数据库文件(本地SQLite)
rm -f prisma/dev.db

# 重新初始化
npx prisma db push
npm run db:seed
```

---

## 📚 API端点

### 用户相关
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/users/profile` - 获取用户信息

### 交易信息
- `GET /api/posts` - 获取信息列表
- `POST /api/posts` - 发布信息
- `GET /api/posts/:id` - 获取单条信息

### 管理后台
- `POST /api/admin/auth/login` - 管理员登录
- `GET /api/admin/users` - 用户管理
- `GET /api/admin/posts` - 信息管理
- `GET /api/admin/recharge` - 充值订单

完整API文档: `http://localhost:3001/api`

---

## 📞 技术支持

如有问题,请检查:
1. 查看日志: `logs/app.log`
2. 查看控制台错误信息
3. 运行 `npm run test` 进行测试
4. 提交Issue到GitHub

---

## 📝 待办事项

- [ ] 配置Supabase生产环境
- [ ] 测试所有API端点
- [ ] 部署到EdgeOne
- [ ] 添加支付接口(微信支付/支付宝)
- [ ] 添加短信验证
- [ ] 优化前端界面

---

**祝您使用愉快! 🎉**
