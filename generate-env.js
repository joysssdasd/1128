#!/usr/bin/env node

/**
 * EdgeOne部署环境变量生成器
 * 一键生成安全的生产环境配置
 */

const crypto = require('crypto');

function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateEnvFile() {
  console.log('🚀 EdgeOne部署环境变量生成器');
  console.log('=' .repeat(60));
  console.log('');

  // 生成安全的随机密钥
  const jwtSecret = generateRandomString(32);
  const sessionSecret = generateRandomString(32);

  console.log('🔐 已生成安全密钥:');
  console.log(`   JWT_SECRET: ${jwtSecret.substring(0, 8)}...${jwtSecret.substring(24)}`);
  console.log(`   SESSION_SECRET: ${sessionSecret.substring(0, 8)}...${sessionSecret.substring(24)}`);
  console.log('');

  const envContent = `# ==========================================
# 🚀 EdgeOne生产环境配置
# 生成时间: ${new Date().toLocaleString('zh-CN')}
# ==========================================

# 数据库配置（必填）
DATABASE_URL="postgresql://postgres:vw9v2kvc@dbconn.sealoshzh.site:44744/trading_platform?directConnection=true"

# JWT安全配置（必填）
JWT_SECRET="${jwtSecret}"
JWT_EXPIRES_IN="7d"

# 服务器配置（必填）
PORT="3000"
NODE_ENV="production"

# 安全配置（必填）
BCRYPT_ROUNDS="14"
SESSION_SECRET="${sessionSecret}"

# API限流配置（推荐）
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"

# 文件上传配置（推荐）
UPLOAD_MAX_SIZE="10485760"
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/gif,image/webp"

# 日志配置（推荐）
LOG_LEVEL="info"
LOG_FILE="logs/app.log"

# 应用信息（推荐）
APP_NAME="交易信息撮合平台"
APP_VERSION="1.0.0"
APP_DESCRIPTION="积分驱动的C2C交易信息撮合平台 - 支持演唱会门票、数码产品、潮玩、纪念币等"

# 管理员配置（推荐）
ADMIN_DEFAULT_PASSWORD="admin123456"
`;

  console.log('📋 生成的环境变量配置:');
  console.log('');
  console.log(envContent);

  console.log('');
  console.log('🎯 使用说明:');
  console.log('1. 复制上面的配置到EdgeOne的环境变量设置');
  console.log('2. 确保所有必填项都已配置');
  console.log('3. 点击保存并部署');
  console.log('');

  // 保存到文件
  const fs = require('fs');
  const filename = '.env.edgeone';
  fs.writeFileSync(filename, envContent);
  console.log(`✅ 配置已保存到文件: ${filename}`);

  console.log('');
  console.log('🔐 安全提醒:');
  console.log('• 这些密钥是随机生成的，请妥善保管');
  console.log('• 不要分享或提交到代码仓库');
  console.log('• 建议定期更换密钥');
  console.log('');

  console.log('🚀 现在您可以复制上面的配置到EdgeOne了！');
}

// 如果直接运行此脚本
if (require.main === module) {
  generateEnvFile();
}

// 导出函数供其他脚本使用
module.exports = { generateEnvFile, generateRandomString };