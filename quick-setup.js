#!/usr/bin/env node

/**
 * 交易信息撮合平台 - 一键部署脚本
 * 支持两种方案：Docker本地数据库 或 等待Supabase配置
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎉 交易信息撮合平台 - 一键部署脚本');
console.log('=' .repeat(50));
console.log('');

// 彩色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`\n📍 ${description}`, 'blue');
    log(`   执行: ${command}`, 'yellow');

    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      shell: true
    });

    log(`   ✅ 成功`, 'green');
    return result;
  } catch (error) {
    log(`   ❌ 失败: ${error.message}`, 'red');
    throw error;
  }
}

// 检查Docker是否安装
function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// 检查端口是否被占用
function checkPort(port) {
  try {
    const result = execSync(`netstat -an | findstr :${port}`, { encoding: 'utf-8' });
    return result.includes(`:${port}`);
  } catch {
    return false;
  }
}

// 方案1: Docker本地数据库
async function setupDocker() {
  log('\n🐳 方案1: Docker本地数据库', 'blue');
  log('这将创建一个本地PostgreSQL数据库', 'yellow');

  if (!checkDocker()) {
    log('\n❌ Docker未安装！', 'red');
    log('请先安装Docker Desktop: https://www.docker.com/products/docker-desktop/', 'yellow');
    return false;
  }

  try {
    // 停止并删除已存在的容器
    try {
      execSync('docker stop trading-platform-db', { stdio: 'ignore' });
      execSync('docker rm trading-platform-db', { stdio: 'ignore' });
      log('🗑️  清理旧的容器', 'yellow');
    } catch {}

    // 启动PostgreSQL容器
    execCommand(
      'docker run -d --name trading-platform-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres2024 -e POSTGRES_DB=trading_platform -p 5432:5432 -v trading-platform-data:/var/lib/postgresql/data postgres:15-alpine',
      '启动PostgreSQL容器'
    );

    // 等待数据库启动
    log('\n⏳ 等待数据库启动...', 'blue');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 更新.env文件
    const envContent = `# 数据库配置 (本地Docker PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres2024@localhost:5432/trading_platform"
SUPABASE_URL="https://hntiihuxqlklpiyqmlob.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudGlpaHV4cWxrbHBpeXFtbG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTE1ODksImV4cCI6MjA3OTU2NzU4OX0.yh4FiKZPUPR-G1LormpZuKGZIaF7eSRkDbZslvBJzhc"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudGlpaHV4cWxrbHBpeXFtbG9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk5MTU4OSwiZXhwIjoyMDc5NTY3NTg5fQ.9Hpkp7XKqqMkq4lL_8tVAztluFfIea2FmFlpf6cA7cY"

# JWT配置
JWT_SECRET="trading-platform-super-secret-jwt-key-change-in-production-2024"
JWT_EXPIRES_IN="30d"

# Redis配置(可选)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0

# 服务器配置
PORT=3001
NODE_ENV="development"

# 后台管理配置
ADMIN_DEFAULT_PASSWORD="admin123456"

# 应用配置
APP_NAME="交易信息撮合平台"
APP_VERSION="1.0.0"
APP_DESCRIPTION="积分驱动的C2C交易信息撮合平台"

# 安全配置
BCRYPT_ROUNDS=12
SESSION_SECRET="trading-platform-session-secret-change-in-production-2024"

# 日志配置
LOG_LEVEL="info"
LOG_FILE="logs/app.log"
`;

    fs.writeFileSync('.env', envContent);
    log('✅ 已更新.env文件', 'green');

    return true;
  } catch (error) {
    log(`❌ Docker设置失败: ${error.message}`, 'red');
    return false;
  }
}

// 方案2: 等待Supabase配置
async function waitForSupabase() {
  log('\n⏳ 方案2: 等待Supabase配置', 'blue');
  log('当前Supabase配置:', 'yellow');
  log('  Project: hntiihuxqlklpiyqmlob', 'white');
  log('  状态: 需要网络配置', 'yellow');

  log('\n💡 建议操作:', 'blue');
  log('1. 登录 https://supabase.com', 'white');
  log('2. 进入项目 hntiihuxqlklpiyqmlob', 'white');
  log('3. 设置 → Database → Network Settings', 'white');
  log('4. 启用 "Allow direct database connections"', 'white');
  log('5. 如果使用连接池,启用 "Connection pooling"', 'white');

  return new Promise((resolve) => {
    rl.question('\n按回车键继续...', () => {
      resolve(false);
    });
  });
}

// 初始化数据库
async function initializeDatabase() {
  log('\n🗄️  初始化数据库', 'blue');

  try {
    // 生成Prisma Client
    execCommand('npx prisma generate', '生成Prisma Client');

    // 推送数据库schema
    execCommand('npx prisma db push --accept-data-loss', '创建数据库表结构');

    // 创建测试数据
    execCommand('npm run db:seed', '创建测试数据');

    return true;
  } catch (error) {
    log(`❌ 数据库初始化失败: ${error.message}`, 'red');
    return false;
  }
}

// 启动服务
async function startServices() {
  log('\n🚀 启动服务', 'blue');

  try {
    // 检查端口是否被占用
    if (checkPort(3001)) {
      log('⚠️  端口3001已被占用，请检查是否有其他服务在运行', 'yellow');
      log('   建议: 关闭占用3001端口的程序，或修改.env文件中的PORT配置', 'yellow');
      return false;
    }

    if (checkPort(5173)) {
      log('⚠️  端口5173已被占用，前端可能无法启动', 'yellow');
    }

    log('\n📦 安装依赖...', 'blue');
    execCommand('npm install', '安装后端依赖');

    log('\n📦 安装前端依赖...', 'blue');
    execCommand('cd client && npm install', '安装前端依赖');

    log('\n🎉 所有准备完成！', 'green');
    log('\n🚀 现在启动服务:', 'blue');
    log('npm run dev', 'yellow');
    log('\n📱 访问地址:', 'blue');
    log('  前端: http://localhost:5173', 'white');
    log('  后端: http://localhost:3001', 'white');
    log('  API文档: http://localhost:3001/api', 'white');

    return true;
  } catch (error) {
    log(`❌ 服务启动失败: ${error.message}`, 'red');
    return false;
  }
}

// 主函数
async function main() {
  log('\n请选择部署方案:', 'blue');
  log('1. Docker本地数据库 (推荐, 5分钟完成)', 'green');
  log('2. 等待Supabase配置 (需要手动配置)', 'yellow');

  rl.question('\n请选择 (1/2): ', async (choice) => {
    try {
      let success = false;

      if (choice === '1') {
        log('\n🐳 选择方案1: Docker本地数据库', 'green');
        if (await setupDocker()) {
          if (await initializeDatabase()) {
            success = await startServices();
          }
        }
      } else if (choice === '2') {
        log('\n⏳ 选择方案2: 等待Supabase配置', 'yellow');
        await waitForSupabase();
        if (await initializeDatabase()) {
          success = await startServices();
        }
      } else {
        log('\n❌ 无效选择', 'red');
      }

      if (success) {
        log('\n🎉 部署完成！请运行: npm run dev', 'green');
      } else {
        log('\n⚠️  部署遇到问题，请查看上面的错误信息', 'yellow');
      }

    } catch (error) {
      log(`\n❌ 发生错误: ${error.message}`, 'red');
    } finally {
      rl.close();
    }
  });
}

// 运行主函数
main().catch(error => {
  log(`\n❌ 严重错误: ${error.message}`, 'red');
  process.exit(1);
});