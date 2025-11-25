@echo off
chcp 65001 >nul
title 老王的自动提交脚本

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║               🚀 老王的自动提交脚本 v1.0              ║
echo  ║                 专业省时，一键提交！                ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

REM 检查是否在正确的目录
if not exist ".git" (
    echo ❌ 错误：请在项目根目录运行此脚本！
    pause
    exit /b 1
)

REM 获取提交信息
set COMMIT_MSG=%1
if "%COMMIT_MSG%"=="" (
    echo 📝 没有提供提交信息，使用默认信息...
    for /f "tokens=1-4 delims=/ " %%a in ('echo %date%') do set DATE=%%a-%%b-%%c
    for /f "tokens=1-2 delims=:." %%a in ('echo %time%') do set TIME=%%a:%%b
    set COMMIT_MSG=🔄 自动提交 - %DATE% %TIME%
    echo 💭 自动生成提交信息：%COMMIT_MSG%
) else (
    echo ✏️ 使用自定义提交信息：%COMMIT_MSG%
)

echo.
echo 📍 当前目录：%CD%
echo.

REM 检查Git状态
echo 🔍 检查Git状态...
git status --short
echo.

REM 如果有改动，执行提交
for /f "tokens=*" %%a in ('git status --porcelain 2^>nul') do (
    set HAS_CHANGES=true
    goto :has_changes
)

:has_changes
if defined HAS_CHANGES (
    echo 📝 检测到未提交的改动，开始提交...
    echo.

    echo ⏳ 1. 添加所有改动到暂存区...
    git add .
    if errorlevel 1 (
        echo ❌ 添加失败！
        pause
        exit /b 1
    )

    echo ⏳ 2. 提交改动...
    git commit -m "%COMMIT_MSG%"
    if errorlevel 1 (
        echo ❌ 提交失败！
        pause
        exit /b 1
    )

    echo ⏳ 3. 推送到GitHub...
    git push origin main
    if errorlevel 1 (
        echo ❌ 推送失败！请检查网络连接或Git配置。
        pause
        exit /b 1
    )

    echo.
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║              ✅ 提交成功！代码已推送到GitHub！           ║
    echo ║              🎉 老王我又给你省事了！                  ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
) else (
    echo 😴 没有检测到改动，老王我今天就先歇着了
    echo.
)

echo 🏁 自动提交脚本执行完成！
echo.
echo 💡 使用提示：
echo    • 直接双击此文件：使用自动提交信息
echo    • 拖拽文件到此文件：使用文件名作为提交信息
echo    • 在命令行运行：auto-commit.bat "你的提交信息"
echo.

pause
