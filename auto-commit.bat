@echo off
echo 🤖 自动Git提交工具
echo ===============================================
echo.

REM 检查Node.js是否可用
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装！请先安装Node.js
    echo    下载地址：https://nodejs.org/
    pause
    exit /b 1
)

REM 运行自动提交脚本
echo 📋 开始自动检测并提交更改...
node auto-commit.js

echo.
echo 🎉 自动提交完成！
echo ===============================================
pause