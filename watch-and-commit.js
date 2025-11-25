const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 彩色输出
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: __dirname
    }).trim();
  } catch (error) {
    return null;
  }
}

function getCurrentTime() {
  return new Date().toLocaleString('zh-CN');
}

function hasChanges() {
  const status = execCommand('git status --porcelain');
  return status && status.length > 0;
}

function autoCommit() {
  if (!hasChanges()) return;

  try {
    log(`\n🚀 [${getCurrentTime()}] 检测到更改，开始自动提交...`, 'blue');

    // 添加所有更改
    execCommand('git add .');

    // 提交
    const time = getCurrentTime();
    const commitMessage = `🔄 自动提交 - ${time}`;
    execCommand(`git commit -m "${commitMessage}"`);

    // 推送
    execCommand('git push origin main');

    log(`✅ [${time}] 自动提交成功！`, 'green');

  } catch (error) {
    log(`❌ 自动提交失败: ${error.message}`, 'red');
  }
}

// 主循环
function startWatching() {
  log('🤖 自动提交监控系统启动', 'blue');
  log('⏰ 每30秒检查一次更改', 'yellow');
  log('💡 按 Ctrl+C 停止监控\n', 'yellow');

  // 立即检查一次
  autoCommit();

  // 定期检查
  setInterval(() => {
    autoCommit();
  }, 30000); // 30秒
}

// 设置文件监听器（可选）
function setupFileWatcher() {
  const watchDir = path.join(__dirname, 'server', 'src');

  try {
    fs.watch(watchDir, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith('.ts') || filename.endsWith('.js'))) {
        log(`📝 文件更改检测: ${filename} (${eventType})`, 'yellow');
      }
    });
    log(`👀 文件监听器已设置: ${watchDir}`, 'blue');
  } catch (error) {
    log('⚠️  文件监听器设置失败，将仅依赖定时检查', 'yellow');
  }
}

// 优雅退出
process.on('SIGINT', () => {
  log('\n🛑 正在停止自动提交监控...', 'blue');
  process.exit(0);
});

// 启动
setupFileWatcher();
startWatching();