# 部署指南

本项目包含前端（Vue）和后端（Express + SQLite），需要分别部署。

## 前端部署到 Netlify

### 1. Netlify 配置

在 Netlify 部署设置中填写：

- **Branch to deploy**: `main`
- **Base directory**: 留空
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`（可选）

### 2. 环境变量

在 Netlify 的 **Site settings > Environment variables** 中添加：

```
VITE_API_BASE_URL=https://your-backend-api.com/api
```

将 `your-backend-api.com` 替换为你的后端 API 地址。

### 3. 部署步骤

1. 将代码推送到 GitLab
2. 在 Netlify 中连接你的 GitLab 仓库
3. 选择 `wenti911` 项目
4. 按照上面的配置填写构建设置
5. 点击 **Deploy site**

## 后端部署（推荐平台）

由于 Netlify 不支持后端服务，你需要将后端部署到其他平台：

### 选项 1: Render（推荐，免费）

1. 访问 https://render.com
2. 创建新的 **Web Service**
3. 连接 GitLab 仓库
4. 配置：
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. 添加环境变量：
   ```
   NODE_ENV=production
   PORT=3002
   ```
6. 部署后会得到一个 URL，如：`https://your-app.onrender.com`

### 选项 2: Railway（推荐，免费额度）

1. 访问 https://railway.app
2. 创建新项目
3. 连接 GitLab 仓库
4. 选择 `server` 目录
5. Railway 会自动检测并部署

### 选项 3: Vercel（需要配置 Serverless）

Vercel 支持 Serverless Functions，但需要改造后端代码。

### 选项 4: 自己的服务器

如果你有自己的服务器（VPS），可以：

```bash
# 克隆代码
git clone https://gitlab.com/ztspace/wenti911.git
cd wenti911/server

# 安装依赖
npm install

# 启动服务（使用 PM2）
npm install -g pm2
pm2 start src/app.js --name badminton-api
pm2 save
pm2 startup
```

## 完整部署流程

### 第一步：部署后端

1. 选择一个后端平台（推荐 Render）
2. 部署后端代码
3. 获取后端 API 地址，例如：`https://badminton-api.onrender.com`

### 第二步：配置前端

1. 在 Netlify 环境变量中设置：
   ```
   VITE_API_BASE_URL=https://badminton-api.onrender.com/api
   ```

### 第三步：部署前端

1. 推送代码到 GitLab
2. Netlify 会自动构建和部署
3. 访问你的 Netlify 网站

## 注意事项

### CORS 配置

确保后端的 CORS 配置包含你的 Netlify 域名：

在 `server/src/app.js` 中：

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    'https://your-netlify-site.netlify.app',  // 添加你的 Netlify 域名
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true
}))
```

### 数据库

SQLite 在 Serverless 环境中可能有问题，建议：

1. **开发/测试**: 使用 SQLite
2. **生产环境**: 考虑使用 PostgreSQL 或 MySQL

如果使用 Render，SQLite 可以正常工作，但数据会在重启时丢失。建议使用 Render 的 PostgreSQL 服务。

## 快速部署命令

### 本地测试生产构建

```bash
# 前端
npm run build
npm run preview

# 后端
cd server
NODE_ENV=production npm start
```

## 故障排查

### 前端无法连接后端

1. 检查 Netlify 环境变量是否正确设置
2. 检查后端 CORS 配置
3. 查看浏览器控制台的网络请求

### 后端部署失败

1. 检查 `package.json` 中的 `start` 脚本
2. 确保所有依赖都在 `dependencies` 中（不是 `devDependencies`）
3. 查看部署平台的日志

## 域名配置

### Netlify 自定义域名

1. 在 Netlify 的 **Domain settings** 中添加自定义域名
2. 按照提示配置 DNS

### 后端自定义域名

1. 在部署平台配置自定义域名
2. 更新前端的 `VITE_API_BASE_URL` 环境变量
