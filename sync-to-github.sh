#!/bin/bash

# 同步 GitLab 代码到 GitHub 的脚本

echo "🚀 开始同步代码到 GitHub..."
echo ""

# 检查是否已经添加了 github 远程仓库
if git remote | grep -q "^github$"; then
    echo "✅ GitHub 远程仓库已存在"
else
    echo "❌ 未找到 GitHub 远程仓库"
    echo ""
    echo "请先在 GitHub 创建仓库，然后运行："
    echo "git remote add github https://github.com/你的用户名/仓库名.git"
    echo ""
    exit 1
fi

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 当前分支: $CURRENT_BRANCH"
echo ""

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push github $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 同步成功！"
    echo ""
    echo "现在你可以："
    echo "1. 访问 https://railway.app"
    echo "2. 选择 'Deploy from GitHub repo'"
    echo "3. 选择你的仓库"
    echo "4. 开始部署"
else
    echo ""
    echo "❌ 同步失败，请检查错误信息"
    exit 1
fi
