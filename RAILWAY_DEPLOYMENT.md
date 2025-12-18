# Railway 部署详细指南

## 📦 准备工作

### 1. 确保代码已推送到 GitLab

```bash
git add .
git commit -m "准备部署到 Railway"
git push origin main
```

## 🚂 Railway 后端部署步骤

### 第一步：注册 Railway 账号

1. 访问 https://railway.app
2. 点击右上角 **Login**
3. 选择 **Login with GitHub**（推荐）或其他方式登录
4. 首次登录会获得 $5 免费额度（足够运行小项目）

### 第二步：准备 GitHub 仓库

⚠️ **重要**：Railway 只支持 GitHub，不支持 GitLab。

#### 方案 A：同步 GitLab 到 GitHub（推荐）

1. **在 GitHub 创建新仓库**
   - 访问 https://github.com/new
   - 仓库名：`badminton`（或其他名字）
   - 设置为 Public 或 Private
   - **不要**初始化（不勾选 README、.gitignore 等）
   - 点击 **Create repository**

2. **添加 GitHub 作为第二个远程仓库**
   
   在本地项目目录执行：
   ```bash
   # 添加 GitHub 远程仓库
   git remote add github https://github.com/你的用户名/badminton.git
   
   # 推送代码到 GitHub
   git push github main
   ```

3. **验证推送成功**
   
   访问你的 GitHub 仓库，确认代码已经上传。

#### 方案 B：使用 Railway CLI

如果你不想使用 GitHub，可以使用 Railway CLI 直接部署：

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 在 server 目录初始化
cd server
railway init

# 部署
railway up
```

### 第三步：在 Railway 创建项目

1. 登录后，点击 **New Project**
2. 选择 **Deploy from GitHub repo**
3. 如果是第一次使用，需要授权 Railway 访问你的 GitHub
4. 选择你刚才创建的仓库（如 `badminton`）
5. Railway 会自动检测到你的项目

### 第三步：配置服务

#### 3.1 选择根目录

Railway 检测到项目后：

1. 点击项目卡片
2. 在 **Settings** 标签页中找到 **Root Directory**
3. 设置为：`server`
4. 点击 **Save**

#### 3.2 配置环境变量

在 **Variables** 标签页中添加以下环境变量：

```
NODE_ENV=production
PORT=3002
```

暂时不需要设置 `CORS_ORIGIN`，等前端部署后再添加。

#### 3.3 配置构建命令（可选）

Railway 会自动检测 `package.json` 并运行：
- **Build**: `npm install`
- **Start**: `npm start`

如果需要自定义，在 **Settings** > **Deploy** 中修改。

### 第四步：部署

1. 点击 **Deploy** 按钮
2. Railway 会自动：
   - 安装依赖
   - 构建项目
   - 启动服务
3. 等待部署完成（通常 2-5 分钟）

### 第五步：获取部署 URL

1. 部署成功后，在 **Settings** 标签页找到 **Domains**
2. 点击 **Generate Domain**
3. Railway 会生成一个域名，例如：
   ```
   https://badminton-api-production.up.railway.app
   ```
4. **复制这个 URL**，后面会用到

### 第六步：测试后端 API

在浏览器中访问：

```
https://your-app.up.railway.app/api
```

应该看到类似这样的响应：

```json
{
  "message": "羽毛球比赛管理系统 API",
  "version": "1.0.0",
  "endpoints": {
    "matches": "/matches",
    "players": "/matches/:matchId/players",
    "games": "/matches/:matchId/games"
  }
}
```

## 🌐 Netlify 前端部署步骤

### 第一步：注册 Netlify 账号

1. 访问 https://www.netlify.com
2. 点击 **Sign up**
3. 选择 **GitLab** 登录

### 第二步：创建新站点

1. 登录后，点击 **Add new site** > **Import an existing project**
2. 选择 **GitLab**
3. 授权 Netlify 访问你的 GitLab
4. 选择 `ztspace/wenti911` 仓库

### 第三步：配置构建设置

按照以下配置填写：

| 配置项 | 值 |
|--------|-----|
| **Branch to deploy** | `main` |
| **Base directory** | 留空 |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

### 第四步：配置环境变量

在部署之前，点击 **Show advanced** > **New variable**

添加环境变量：

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://your-app.up.railway.app/api` |

⚠️ **重要**：将 `your-app.up.railway.app` 替换为你在 Railway 获取的实际域名！

### 第五步：部署

1. 点击 **Deploy site**
2. Netlify 会自动：
   - 克隆代码
   - 安装依赖
   - 运行构建命令
   - 发布到 CDN
3. 等待部署完成（通常 2-3 分钟）

### 第六步：获取网站 URL

部署成功后，Netlify 会显示你的网站 URL：

```
https://random-name-123456.netlify.app
```

你可以在 **Site settings** > **Domain management** 中自定义域名。

## 🔗 连接前后端

### 更新后端 CORS 配置

1. 回到 Railway 项目
2. 在 **Variables** 标签页添加：
   ```
   CORS_ORIGIN=https://your-netlify-site.netlify.app
   ```
3. 将 `your-netlify-site.netlify.app` 替换为你的 Netlify 域名
4. Railway 会自动重新部署

### 测试完整应用

1. 访问你的 Netlify 网站
2. 尝试添加选手、创建比赛等功能
3. 检查是否能正常与后端通信

## 📊 监控和日志

### Railway 日志

1. 在 Railway 项目中点击 **Deployments**
2. 选择最新的部署
3. 点击 **View Logs** 查看实时日志

### Netlify 日志

1. 在 Netlify 站点中点击 **Deploys**
2. 选择最新的部署
3. 点击查看构建日志

## 🔧 常见问题

### 1. Railway 部署失败

**问题**：构建或启动失败

**解决方案**：
- 检查 `server/package.json` 中的 `start` 脚本
- 确保所有依赖都在 `dependencies` 中
- 查看 Railway 日志找到具体错误

### 2. 前端无法连接后端

**问题**：前端显示网络错误

**解决方案**：
- 检查 Netlify 环境变量 `VITE_API_BASE_URL` 是否正确
- 检查 Railway 的 CORS 配置
- 在浏览器开发者工具的 Network 标签查看请求

### 3. Railway 数据丢失

**问题**：重启后数据消失

**原因**：Railway 的文件系统是临时的

**解决方案**：
- 使用 Railway 的 PostgreSQL 插件（推荐）
- 或者使用外部数据库服务

### 4. CORS 错误

**问题**：浏览器控制台显示 CORS 错误

**解决方案**：

在 `server/src/app.js` 中更新 CORS 配置：

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    'https://your-netlify-site.netlify.app',  // 添加你的 Netlify 域名
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

提交并推送代码，Railway 会自动重新部署。

## 💾 数据持久化（可选）

如果需要数据持久化，建议使用 PostgreSQL：

### 在 Railway 添加 PostgreSQL

1. 在 Railway 项目中点击 **New**
2. 选择 **Database** > **Add PostgreSQL**
3. Railway 会自动创建数据库并设置环境变量
4. 需要修改后端代码以支持 PostgreSQL（需要额外配置）

## 🎯 自定义域名（可选）

### Railway 自定义域名

1. 在 Railway 项目的 **Settings** > **Domains** 中
2. 点击 **Custom Domain**
3. 输入你的域名（如 `api.yourdomain.com`）
4. 按照提示配置 DNS CNAME 记录

### Netlify 自定义域名

1. 在 Netlify 站点的 **Domain settings** 中
2. 点击 **Add custom domain**
3. 输入你的域名（如 `badminton.yourdomain.com`）
4. 按照提示配置 DNS

## 📝 部署检查清单

### 后端（Railway）

- [ ] 代码已推送到 GitLab
- [ ] Railway 项目已创建
- [ ] Root Directory 设置为 `server`
- [ ] 环境变量已配置（NODE_ENV, PORT）
- [ ] 部署成功
- [ ] API 可以访问
- [ ] 获取了部署 URL

### 前端（Netlify）

- [ ] Netlify 站点已创建
- [ ] 构建设置正确（build command, publish directory）
- [ ] 环境变量已配置（VITE_API_BASE_URL）
- [ ] 部署成功
- [ ] 网站可以访问
- [ ] 获取了网站 URL

### 连接

- [ ] 后端 CORS 已配置 Netlify 域名
- [ ] 前端可以正常调用后端 API
- [ ] 所有功能正常工作

## 🚀 持续部署

配置完成后，每次推送代码到 GitLab：

- **Railway** 会自动检测并重新部署后端
- **Netlify** 会自动检测并重新部署前端

无需手动操作！

## 💰 费用说明

### Railway

- **免费额度**：$5/月（约 500 小时运行时间）
- **超出后**：按使用量计费
- **建议**：小项目完全够用

### Netlify

- **免费额度**：
  - 100GB 带宽/月
  - 300 分钟构建时间/月
  - 无限站点
- **超出后**：可升级到付费计划
- **建议**：个人项目完全够用

## 📞 需要帮助？

如果遇到问题：

1. 查看 Railway 和 Netlify 的部署日志
2. 检查浏览器控制台的错误信息
3. 参考本文档的常见问题部分
4. 查看 Railway 和 Netlify 的官方文档

---

祝部署顺利！🎉
