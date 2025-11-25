#!/bin/bash

# 自动提交脚本 - 老王出品，必属精品！
# 使用方法: ./auto-commit.sh "提交信息"

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="C:\Users\big\Desktop\claude本地\trading-match-platform"

echo -e "${BLUE}🚀 老王的自动提交脚本启动了！${NC}"
echo -e "${YELLOW}📍 项目目录: $PROJECT_DIR${NC}"

# 检查是否有未提交的改动
cd "$PROJECT_DIR"
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}📝 检测到未提交的改动...${NC}"

    # 显示改动详情
    git status --short

    # 获取提交信息
    COMMIT_MSG="$1"
    if [[ -z "$COMMIT_MSG" ]]; then
        # 自动生成提交信息
        TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
        COMMIT_MSG="🔄 自动提交 - $TIMESTAMP"
        echo -e "${BLUE}💭 使用默认提交信息: $COMMIT_MSG${NC}"
    else
        echo -e "${GREEN}✏️ 使用自定义提交信息: $COMMIT_MSG${NC}"
    fi

    echo -e "${BLUE}⏳ 正在提交改动...${NC}"

    # 添加所有改动
    git add .

    # 提交
    git commit -m "$COMMIT_MSG"

    # 推送到远程仓库
    echo -e "${BLUE}📤 正在推送到GitHub...${NC}"
    git push origin main

    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ 恭喜！代码已成功推送到GitHub！${NC}"
        echo -e "${GREEN}🎉 老王我又给你省事了！${NC}"
    else
        echo -e "${RED}❌ 艹！推送失败了，检查一下网络连接？${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}😴 没有检测到改动，老王我今天就先歇着了${NC}"
fi

echo -e "${BLUE}🏁 自动提交脚本执行完成！${NC}"