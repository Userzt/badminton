# 部署检查清单

## 当前配置

### 后端
- **平台**: Zeabur
- **域名**: `badminton-api.zeabur.app`
- **API 地址**: `https://badminton-api.zeabur.app/api`

### 前端
- **API 配置**: `.env.production` 已更新为 `https://badminton-api.zeabur.app/api`

## 部署步骤

### 1. 后端部署（Zeabur）✅

后端代码已更新，需要重新部署：

```bash
cd server
git add .
git commit -m "fix: update CORS configuration"
git push
```

Zeabur 会自动检测并重新部署。

**验证后端**：
```bash
# 测试健康检查
curl https://badminton-api.zeabur.app/health

# 测试 CORS
curl -H "Origin: https://ztidea.asia" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     --verbose \
     https://badminton-api.zeabur.app/api/matches
```

应该看到响应头包含：
```
Access-Control-Allow-Origin: https://ztidea.asia
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

### 2. 前端部署

#### 方式 A: 使用部署脚本
```bash
./deploy-frontend.sh
```

#### 方式 B: 手动部署
```bash
# 1. 安装依赖
npm install

# 2. 构建
npm run build

# 3. 部署到 Netlify
netlify deploy --prod --dir=dist

# 或部署到 Vercel
vercel --prod
```

### 3. 验证部署

#### 检查 1: 后端健康检查
访问: https://badminton-api.zeabur.app/health

应该返回:
```json
{
  "status": "OK",
  "timestamp": "2025-12-30T..."
}
```

#### 检查 2: 前端 API 配置
1. 打开浏览器开发者工具（F12）
2. 访问你的前端网站
3. 查看 Console 标签，确认没有错误
4. 查看 Network 标签，确认 API 请求的地址是 `https://badminton-api.zeabur.app/api/...`

#### 检查 3: CORS 测试
1. 在前端网站上尝试添加选手
2. 打开 Network 标签
3. 查看请求的响应头，应该包含：
   ```
   Access-Control-Allow-Origin: <你的前端域名>
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
   ```

## 常见问题排查

### 问题 1: 仍然显示 CORS 错误

**可能原因**：
- 后端代码没有正确部署
- 浏览器缓存了旧的响应

**解决方法**：
1. 确认后端已重新部署（查看 Zeabur 部署日志）
2. 清除浏览器缓存（Ctrl+Shift+Delete）
3. 使用无痕模式测试
4. 检查后端日志，看是否有 CORS 相关的警告

### 问题 2: API 请求 404

**可能原因**：
- 前端 API 地址配置错误
- 后端路由配置问题

**解决方法**：
1. 确认 `.env.production` 中的地址正确
2. 重新构建前端：`npm run build`
3. 测试后端 API：`curl https://badminton-api.zeabur.app/api/matches`

### 问题 3: 前端显示旧的 API 地址

**可能原因**：
- 构建时使用了错误的环境变量
- 部署了旧的构建文件

**解决方法**：
1. 删除 `dist` 目录
2. 确认 `.env.production` 正确
3. 重新构建：`npm run build`
4. 检查 `dist` 目录中的文件，确认 API 地址正确
5. 重新部署

## 调试命令

### 查看构建后的 API 地址
```bash
# 在 dist 目录中搜索 API 地址
grep -r "badminton-api.zeabur.app" dist/
```

### 测试后端 API
```bash
# 获取所有比赛
curl https://badminton-api.zeabur.app/api/matches

# 创建比赛（需要 POST 数据）
curl -X POST https://badminton-api.zeabur.app/api/matches \
  -H "Content-Type: application/json" \
  -d '{"title":"测试比赛","date":"12-30","time":"21:00-23:00","location":"测试场地","organizer":"测试","type":"多人轮转赛"}'
```

### 查看 Zeabur 日志
1. 登录 Zeabur 控制台
2. 进入 badminton 项目
3. 点击 "日志" 标签
4. 查看是否有错误信息

## 成功标志

✅ 后端健康检查返回 OK
✅ 前端可以正常访问
✅ 可以添加选手
✅ 可以生成比赛对阵
✅ 可以更新比分
✅ Network 标签中没有 CORS 错误
✅ Console 标签中没有错误信息

## 需要帮助？

如果问题仍然存在，请提供：
1. 浏览器 Console 的完整错误信息（截图）
2. Network 标签中失败请求的详细信息（截图）
3. Zeabur 后端的部署日志
4. 前端部署的 URL
