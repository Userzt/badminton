#!/bin/bash

# 前端部署脚本

echo "🚀 开始部署前端..."

# 1. 安装依赖
echo "📦 安装依赖..."
npm install

# 2. 构建生产版本
echo "🔨 构建生产版本..."
npm run build

echo "✅ 构建完成！"
echo ""
echo "📝 接下来的步骤："
echo "1. 将 dist 目录部署到 Netlify/Vercel"
echo "2. 或者运行: netlify deploy --prod --dir=dist"
echo ""
echo "🌐 后端 API 地址: https://badminton-api.zeabur.app/api"
