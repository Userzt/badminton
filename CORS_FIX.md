# CORS 跨域问题修复指南

## 问题现象
部署后前端访问后端 API 时出现 CORS 错误：
```
Access to fetch at 'https://your-api.com/api/matches' from origin 'https://your-frontend.com' 
has been blocked by CORS policy
```

## 解决方案

### 1. 后端 CORS 配置（已修复）

修改 `server/src/app.js`，简化 CORS 配置：

```javascript
app.use(cors({
  origin: true, // 允许所有来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 预检请求缓存24小时
}))
```

### 2. 前端 API 地址配置

#### 开发环境 (`.env.development`)
```bash
VITE_API_BASE_URL=http://localhost:3002/api
```

#### 生产环境 (`.env.production`)
需要修改为你实际部署的后端地址：

**Zeabur 部署示例：**
```bash
VITE_API_BASE_URL=https://your-project.zeabur.app/api
```

**Railway 部署示例：**
```bash
VITE_API_BASE_URL=https://your-project.up.railway.app/api
```

**自定义域名示例：**
```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 3. 部署步骤

#### 步骤 1: 部署后端
1. 将后端代码推送到 Zeabur/Railway
2. 等待部署完成
3. 获取后端 URL（例如：`https://your-backend.zeabur.app`）

#### 步骤 2: 配置前端
1. 修改 `.env.production` 文件：
   ```bash
   VITE_API_BASE_URL=https://your-backend.zeabur.app/api
   ```

2. 重新构建前端：
   ```bash
   npm run build
   ```

3. 部署前端到 Netlify/Vercel

#### 步骤 3: 验证
1. 打开浏览器开发者工具（F12）
2. 访问前端网站
3. 查看 Network 标签
4. 确认 API 请求成功，没有 CORS 错误

### 4. 常见问题

#### 问题1: 仍然显示 CORS 错误
**原因**: 前端还在使用旧的 API 地址

**解决**:
1. 确认 `.env.production` 已正确配置
2. 重新构建前端：`npm run build`
3. 清除浏览器缓存
4. 重新部署前端

#### 问题2: API 地址不确定
**查看方法**:
- Zeabur: 在项目设置中查看 "Domains" 部分
- Railway: 在项目设置中查看 "Settings" → "Domains"
- 自定义域名: 使用你配置的域名

#### 问题3: 后端重启后 CORS 失效
**原因**: 代码没有正确部署

**解决**:
1. 确认 `server/src/app.js` 的修改已提交
2. 重新推送代码到部署平台
3. 等待重新部署完成

### 5. 测试 CORS 配置

使用 curl 测试：
```bash
curl -H "Origin: https://your-frontend.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     --verbose \
     https://your-backend.com/api/matches
```

应该看到响应头包含：
```
Access-Control-Allow-Origin: https://your-frontend.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept
```

### 6. 生产环境安全建议

如果需要限制特定域名访问（更安全），可以修改 CORS 配置：

```javascript
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://your-frontend.netlify.app',
      'https://your-frontend.vercel.app',
      'https://yourdomain.com',
      'http://localhost:3000' // 开发环境
    ]
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}))
```

### 7. 环境变量配置（后端）

在部署平台设置环境变量：

**Zeabur:**
1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加：
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-frontend.com` (可选)

**Railway:**
1. 进入项目设置
2. 点击 "Variables"
3. 添加相同的环境变量

## 快速检查清单

- [ ] 后端 `server/src/app.js` CORS 配置已更新
- [ ] 后端已重新部署
- [ ] 前端 `.env.production` 已配置正确的 API 地址
- [ ] 前端已重新构建 (`npm run build`)
- [ ] 前端已重新部署
- [ ] 浏览器缓存已清除
- [ ] 在浏览器开发者工具中验证 API 请求成功

## 调试技巧

1. **查看请求头**：在浏览器开发者工具的 Network 标签中查看请求和响应头
2. **查看控制台**：检查是否有其他错误信息
3. **测试健康检查**：访问 `https://your-backend.com/health` 确认后端正常运行
4. **使用 Postman**：测试 API 是否正常工作（排除 CORS 问题）

## 联系支持

如果问题仍然存在，请提供：
1. 前端部署 URL
2. 后端部署 URL
3. 浏览器控制台的完整错误信息
4. Network 标签中失败请求的详细信息
