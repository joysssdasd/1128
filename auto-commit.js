#!/usr/bin/env node

/**
 * 自动Git提交脚本
 * 每次修改代码后自动提交到GitHub
 */

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

function execCommand(command, description) {
  try {
    if (description) log(`📍 ${description}`, 'blue');
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: __dirname // 确保在正确的目录执行
    });
    return result.trim();
  } catch (error) {
    log(`❌ 命令失败: ${error.message}`, 'red');
    throw error;
  }
}

function getCurrentTime() {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function getModifiedFiles() {
  try {
    const status = execCommand('git status --porcelain', '获取修改状态');
    if (!status) return [];

    return status.split('\n').filter(line => line.trim()).map(line => {
      const status = line.substring(0, 2);
      const filename = line.substring(3);
      return { status, filename };
    });
  } catch (error) {
    return [];
  }
}

function generateCommitMessage(files) {
  const time = getCurrentTime();

  if (files.length === 0) {
    return `🔄 自动提交 - ${time}`;
  }

  // 分析修改类型
  const additions = files.filter(f => f.status.startsWith('A')).length;
  const modifications = files.filter(f => f.status.startsWith('M')).length;
  const deletions = files.filter(f => f.status.startsWith('D')).length;

  // 获取主要修改的文件类型
  const extensions = {};
  files.forEach(f => {
    const ext = path.extname(f.filename);
    extensions[ext] = (extensions[ext] || 0) + 1;
  });

  const mainExt = Object.keys(extensions).sort((a, b) => extensions[b] - extensions[a])[0];
  const fileType = mainExt ? `${mainExt.substring(1)}文件` : '文件';

  let type = '';
  if (additions > 0) type += `新增${additions}个`;
  if (modifications > 0) type += `${additions > 0 ? '，修改' : '修改'}${modifications}个`;
  if (deletions > 0) type += `${additions > 0 || modifications > 0 ? '，删除' : '删除'}${deletions}个`;

  return `🔄 自动提交 - ${time}

📊 修改统计:
${type}
📝 涉及${files.length}个${fileType}`;
}

async function autoCommit() {
  console.log('\n' + '='.repeat(60));
  log('🤖 自动Git提交脚本启动', 'blue');
  log('='.repeat(60), 'blue');

  try {
    const startTime = Date.now();

    // 检查是否是Git仓库
    try {
      execCommand('git rev-parse --git-dir', '检查Git仓库');
    } catch (error) {
      log('❌ 当前目录不是Git仓库', 'red');
      log('💡 请先运行: git init', 'yellow');
      return;
    }

    // 获取当前状态
    log('\n📋 检查当前状态...', 'blue');
    const status = execCommand('git status --porcelain', '获取Git状态');

    if (!status) {
      log('✅ 没有需要提交的更改', 'green');
      return;
    }

    const modifiedFiles = getModifiedFiles();
    log(`📊 发现 ${modifiedFiles.length} 个文件有更改`, 'yellow');

    // 显示修改的文件
    if (modifiedFiles.length > 0) {
      log('\n📁 修改的文件:', 'blue');
      modifiedFiles.forEach(file => {
        const status = file.status.startsWith('A') ? '新增' :
                      file.status.startsWith('M') ? '修改' :
                      file.status.startsWith('D') ? '删除' : '其他';
        log(`   ${status}: ${file.filename}`, 'white');
      });
    }

    // 添加所有更改
    log('\n➕ 添加更改到暂存区...', 'blue');
    execCommand('git add .', '添加所有更改');

    // 生成提交信息
    const commitMessage = generateCommitMessage(modifiedFiles);

    // 提交更改
    log('\n💾 提交更改...', 'blue');
    execCommand(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, '提交更改');

    // 推送到远程仓库
    log('\n🚀 推送到远程仓库...', 'blue');
    try {
      execCommand('git push', '推送到远程');
      log('✅ 推送成功！', 'green');
    } catch (error) {
      log('⚠️  推送失败，可能是网络问题', 'yellow');
      log('💡 您可以稍后手动运行: git push', 'yellow');
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    log(`🎉 自动提交完成！耗时: ${duration}秒`, 'green');
    log('='.repeat(60), 'green');

  } catch (error) {
    log(`\n❌ 自动提交失败: ${error.message}`, 'red');
    console.log('='.repeat(60));
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  autoCommit();
}

// 导出函数供其他脚本使用
module.exports = { autoCommit, getModifiedFiles, generateCommitMessage };